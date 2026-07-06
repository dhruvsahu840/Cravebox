import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/shared/Providers'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'CraveBox — Fresh Food Delivered Fast',
  description: 'Pizzas, Burgers, Sandwiches & Maggi delivered in 30 mins',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#fff',
                color: '#14532d',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                fontWeight: '500',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
