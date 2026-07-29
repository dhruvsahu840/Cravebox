import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes require admin role
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

    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/auth/login',
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        // Let the function above handle redirects with clear messages
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
