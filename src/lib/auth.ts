import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/db'
import { User } from '@/models'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const email = credentials.email.toLowerCase().trim()
        await connectDB()

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

      // Always resolve user from DB by email (handles stale IDs after DB changes)
      const email = (token.email as string | undefined)?.toLowerCase()
      let dbUser = email
        ? await User.findOne({ email }).select('-password')
        : null

      if (!dbUser && token.id) {
        dbUser = await User.findById(token.id).select('-password')
      }

      if (!dbUser || !dbUser.isActive) {
        // Invalid/stale session — clear user id so protected routes redirect
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