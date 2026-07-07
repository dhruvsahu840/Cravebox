import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/shared/Providers'
import { Toaster } from 'react-hot-toast'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'CraveBox — Fresh Food Delivered Fast',
  description: 'Pizzas, Burgers, Sandwiches & Maggi delivered in 30 mins',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'CraveBox — Fresh Food Delivered Fast',
    description: 'Order pizzas, burgers, sandwiches & maggi. Delivered in 30 mins · Bhopal',
    siteName: 'CraveBox',
    images: [
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630, alt: 'CraveBox — Fresh Food Delivery' },
      { url: '/og-image.svg', width: 1200, height: 630, alt: 'CraveBox' },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CraveBox — Fresh Food Delivered Fast',
    description: 'Order food online. 30-min delivery in Bhopal.',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon.svg" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="font-sans">
        <Providers>
          {children}
          <Toaster
            position="bottom-center"
            gutter={12}
            containerStyle={{ bottom: 80 }}
            toastOptions={{
              duration: 3000,
              className: 'toast-anim',
              style: {
                background: 'var(--toast-bg, #fff)',
                color: 'var(--toast-color, #14532d)',
                border: '1px solid #bbf7d0',
                borderRadius: '14px',
                fontWeight: '600',
                fontFamily: 'var(--font-jakarta)',
                boxShadow: '0 8px 30px rgba(20,83,45,0.15)',
              },
              success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
