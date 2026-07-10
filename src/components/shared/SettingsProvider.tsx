'use client'
import { useEffect } from 'react'
import { useSettings } from '@/store/settingsStore'

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const fetchSettings = useSettings(s => s.fetchSettings)

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  return <>{children}</>
}
