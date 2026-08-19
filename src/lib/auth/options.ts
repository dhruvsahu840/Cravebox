import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models'
import { verifyOtpCode } from '@/lib/auth/otp'
import { normalizePhone } from '@/lib/auth/phone'

async function loadSessionUser(idOrEmail?: string | null, phone?: string | null) {
  await connectDB()
  if (idOrEmail && /^[a-f\d]{24}$/i.test(idOrEmail)) {
    const byId = await User.findById(idOrEmail).select('-password')
    if (byId) return byId
  }
  if (idOrEmail?.includes('@')) {
    const byEmail = await User.findOne({ email: idOrEmail.toLowerCase() }).select('-password')
    if (byEmail) return byEmail
  }
  if (phone) {
    return User.findOne({ phone: normalizePhone(phone) }).select('-password')
  }
  return null
}

function toAuthUser(dbUser: any) {
  const phoneVerified =
    dbUser.role === 'admin' ? true : Boolean(dbUser.phoneVerified)

  return {
    id: dbUser._id.toString(),
    email: dbUser.email || '',
    name: dbUser.name,
    role: dbUser.role,
    image: dbUser.avatar,
    phone: dbUser.phone || '',
    phoneVerified,
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp:   { label: 'OTP', type: 'text' },
        name:  { label: 'Name', type: 'text' },
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.otp) return null

        const result = await verifyOtpCode({
          phone: credentials.phone,
          otp: credentials.otp,
          purpose: 'login',
        })
        if (!result.ok) return null

        await connectDB()
        const phone = result.phone
        let user = await User.findOne({ phone })

        // Migrate legacy guest accounts
        if (!user) {
          user = await User.findOne({ email: `guest_${phone}@lifepizza.local` })
          if (user) {
            user.phone = phone
            user.phoneVerified = true
            if (result.name) user.name = result.name
            await user.save()
          }
        }

        if (!user) {
          const optionalEmail = credentials.email?.trim().toLowerCase() || undefined
          if (optionalEmail) {
            const emailTaken = await User.findOne({ email: optionalEmail })
            if (emailTaken) return null
          }
          user = await User.create({
            name: (credentials.name || result.name || 'Customer').trim().slice(0, 60) || 'Customer',
            phone,
            phoneVerified: true,
            email: optionalEmail,
            role: 'user',
          })
        } else {
          if (!user.isActive || user.role === 'admin') return null
          user.phoneVerified = true
          if (result.name && (!user.name || user.name === 'Guest' || user.name === 'Customer')) {
            user.name = result.name
          }
          if (credentials.name?.trim()) user.name = credentials.name.trim().slice(0, 60)
          if (credentials.email?.trim() && !user.email) {
            const email = credentials.email.trim().toLowerCase()
            const taken = await User.findOne({ email, _id: { $ne: user._id } })
            if (!taken) user.email = email
          }
          await user.save()
        }

        return toAuthUser(user)
      },
    }),

    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const email = credentials.email.toLowerCase().trim()
        const user = await User.findOne({ email, role: 'admin' }).select('+password')
        if (!user?.password || !user.isActive) return null
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null
        return toAuthUser(user)
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id
        token.role = (user as any).role || 'user'
        token.email = user.email || ''
        token.phone = (user as any).phone || ''
        token.phoneVerified = Boolean((user as any).phoneVerified)
        token.name = user.name || ''
        token.picture = user.image || undefined
      }

      if (trigger === 'update' || (!token.role && token.id)) {
        const dbUser = await loadSessionUser(token.id as string, token.phone as string)
        if (dbUser) {
          const mapped = toAuthUser(dbUser)
          token.id = mapped.id
          token.role = mapped.role
          token.email = mapped.email
          token.phone = mapped.phone
          token.phoneVerified = mapped.phoneVerified
          token.name = mapped.name
          token.picture = mapped.image
        }
      }

      // Keep phone fields fresh after link-phone
      if (session?.phoneVerified !== undefined) {
        token.phoneVerified = session.phoneVerified
        token.phone = session.phone || token.phone
      }

      return token
    },

    async session({ session, token }) {
      if (!token?.id) {
        session.user.id = ''
        session.user.role = 'user'
        session.user.phone = ''
        session.user.phoneVerified = false
        return session
      }

      const dbUser = await loadSessionUser(token.id as string, token.phone as string)
      if (!dbUser || !dbUser.isActive) {
        session.user.id = ''
        session.user.role = 'user'
        session.user.phone = ''
        session.user.phoneVerified = false
        return session
      }

      const mapped = toAuthUser(dbUser)
      session.user.id = mapped.id
      session.user.role = mapped.role
      session.user.name = mapped.name
      session.user.email = mapped.email
      session.user.image = mapped.image
      session.user.phone = mapped.phone
      session.user.phoneVerified = mapped.phoneVerified
      return session
    },
  },

  pages: {
    signIn: '/auth/login',
    error:  '/auth/login',
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
