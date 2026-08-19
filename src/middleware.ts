import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    if (pathname.startsWith('/admin')) {
      if (!token) {
        const url = new URL('/auth/login', req.url)
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
      if (token.role !== 'admin') {
        const url = new URL('/auth/login', req.url)
        url.searchParams.set('error', 'NotAdmin')
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
    }

    if ((pathname.startsWith('/orders') || pathname.startsWith('/profile')) && !token) {
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    // Customers without a verified phone must sign in again via Phone OTP
    if (
      token &&
      token.role !== 'admin' &&
      token.phoneVerified === false &&
      (pathname.startsWith('/orders') || pathname.startsWith('/profile'))
    ) {
      const url = new URL('/auth/login', req.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/auth/login',
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (pathname.startsWith('/admin')) return true
        if (pathname.startsWith('/orders') || pathname.startsWith('/profile')) return !!token
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/orders/:path*', '/profile/:path*'],
}
