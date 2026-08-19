import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    role: string
    phone?: string
    phoneVerified?: boolean
  }
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: string
      image?: string
      phone: string
      phoneVerified: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    phone?: string
    phoneVerified?: boolean
  }
}
