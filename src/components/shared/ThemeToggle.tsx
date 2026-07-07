'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/store/themeStore'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const dark = useTheme(s => s.dark)
  const toggle = useTheme(s => s.toggle)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-xl border border-green-200/80 dark:border-green-800 bg-white/80 dark:bg-gray-800 flex items-center justify-center hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle dark mode"
    >
      {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-green-700" />}
    </button>
  )
}
