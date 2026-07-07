'use client'
import { useEffect } from 'react'
import { useTheme } from '@/store/themeStore'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const dark = useTheme(s => s.dark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return <>{children}</>
}
