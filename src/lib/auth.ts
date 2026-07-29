import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { connectDB } from '@/lib/db'
import { User, OtpSession } from '@/models'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
        phone:    { label: 'Phone',    type: 'text' },
        otp:      { label: 'OTP',      type: 'text' },
      },
      async authorize(credentials) {
        await connectDB()

        // Guest OTP login
        if (credentials?.phone && credentials?.otp) {
          const phone = String(credentials.phone).replace(/\D/g, '').slice(-10)
          const otp = String(credentials.otp).trim()
          if (phone.length !== 10 || otp.length < 4) return null

          const session = await OtpSession.findOne({ phone }).sort({ createdAt: -1 })
          if (!session || session.expiresAt.getTime() < Date.now()) return null
          if (session.attempts >= 5) return null

          const valid = await bcrypt.compare(otp, session.otpHash)
          if (!valid) {
            session.attempts += 1
            await session.save()
            return null
          }

          const email = `guest_${phone}@lifepizza.local`
          let user = await User.findOne({ email })
          if (!user) {
            const randomPw = crypto.randomBytes(24).toString('hex')
            const hash = await bcrypt.hash(randomPw, 10)
            user = await User.create({
              name: session.name || 'Guest',
              email,
              phone,
              password: hash,
              role: 'user',
            })
          } else if (!user.isActive) {
            return null
          } else if (session.name && user.name === 'Guest') {
            user.name = session.name
            await user.save()
          }

          await OtpSession.deleteMany({ phone })

          return {
            id:    user._id.toString(),
            email: user.email,
            name:  user.name,
            role:  user.role,
            image: user.avatar,
          }
        }

        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase().trim()

        const user = await User.findOne({ email }).select('+password')
        if (!user || !user.password) return null
        if (!user.isActive) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id:    user._id.toString(),
          email: user.email,
          name:  user.name,
          role:  user.role,
          image: user.avatar,
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id    = user.id
        token.role  = (user as any).role
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (!token) return session

      await connectDB()

      const email = (token.email as string | undefined)?.toLowerCase()
      let dbUser = email
        ? await User.findOne({ email }).select('-password')
        : null

      if (!dbUser && token.id) {
        dbUser = await User.findById(token.id).select('-password')
      }

      if (!dbUser || !dbUser.isActive) {
        session.user.id = ''
        session.user.role = 'user'
        return session
      }

      session.user.id    = dbUser._id.toString()
      session.user.role  = dbUser.role
      session.user.name  = dbUser.name
      session.user.email = dbUser.email
      return session
    },
  },

  pages: {
    signIn:  '/auth/login',
    signOut: '/auth/login',
    error:   '/auth/login',
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
}
