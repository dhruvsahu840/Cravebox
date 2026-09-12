import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/shared/Providers'
import { Toaster } from 'react-hot-toast'
import ServiceWorkerRegistration from "@/components/shared/ServiceWorkerRegistration"

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Lifepizza — Order Fresh Pizza, Burgers & Fast Food in bijawar',
  description: 'Order fresh pizzas, burgers, sandwiches & maggi online at Lifepizza. Fast 30-minute food delivery across bijawar.',
  keywords: [
    'Lifepizza',
    'Lifepizza bijawar',
    'pizza delivery bijawar',
    'order food online bijawar',
    'burgers in bijawar',
    'fast food delivery bijawar',
    'late night food delivery bijawar',
    'sandwiches bijawar',
  ],
  verification: {
    google: 'YxU77SZlOwi5S2oG_ftJeJONhtNOEE4Ipte8V7Yt7YI',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Lifepizza — Order Fresh Pizza, Burgers & Fast Food in bijawar',
    description: 'Order pizzas, burgers, sandwiches & maggi. Delivered in 30 mins · bijawar',
    siteName: 'Lifepizza',
    images: [
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630, alt: 'Lifepizza — Fresh Food Delivery' },
      { url: '/og-image.svg', width: 1200, height: 630, alt: 'Lifepizza' },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lifepizza — Order Fresh Pizza & Fast Food in bijawar',
    description: 'Order food online. 30-min delivery in bijawar.',
    images: ['https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&q=80'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Lifepizza',
    url: 'https://lifepizza.vercel.app',
    description: 'Fresh pizzas, burgers, sandwiches & maggi delivered fast in bijawar.',
    servesCuisine: ['Pizza', 'Burgers', 'Sandwiches', 'Fast Food'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'bijawar',
      addressCountry: 'IN',
    },
  }

  return (
    <html lang="en" className={jakarta.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        />
      </head>
      <body className="font-sans">
        <ServiceWorkerRegistration />

        <Providers>
          {children}

          <Toaster
            position="bottom-center"
            gutter={12}
            containerStyle={{ bottom: 80 }}
            toastOptions={{
              duration: 3000,
              className: "toast-anim",
              style: {
                background: "var(--toast-bg, #fff)",
                color: "var(--toast-color, #14532d)",
                border: "1px solid #bbf7d0",
                borderRadius: "14px",
                fontWeight: "600",
                fontFamily: "var(--font-jakarta)",
                boxShadow: "0 8px 30px rgba(20,83,45,0.15)",
              },
              success: {
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}