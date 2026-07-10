'use client'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { SettingsProvider } from '@/components/shared/SettingsProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={false}>
      <ThemeProvider>
        <SettingsProvider>{children}</SettingsProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
