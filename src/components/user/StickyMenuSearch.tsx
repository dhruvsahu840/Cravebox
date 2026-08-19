'use client'
import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

/** Sticky search under the navbar — stays visible while browsing results. */
export function StickyMenuSearch() {
  const [q, setQ] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const clear = () => setQ('')
    const focus = () => {
      inputRef.current?.focus()
    }
    document.addEventListener('menu-search-clear', clear)
    document.addEventListener('focus-menu-search', focus)
    return () => {
      document.removeEventListener('menu-search-clear', clear)
      document.removeEventListener('focus-menu-search', focus)
    }
  }, [])

  const emitSearch = (val: string) => {
    document.dispatchEvent(new CustomEvent('menu-search', { detail: val }))
  }

  const handleChange = (val: string) => {
    setQ(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => emitSearch(val.trim()), 280)
  }

  const clearSearch = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setQ('')
    emitSearch('')
    document.dispatchEvent(new CustomEvent('menu-search-clear'))
    inputRef.current?.focus()
  }

  const goToResults = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    emitSearch(q.trim())
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="sticky top-16 z-40 border-b border-green-100/80 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 text-green-600 pointer-events-none" size={18} />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={e => handleChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                goToResults()
              }
            }}
            placeholder="Search pizza, burger, maggi…"
            className="w-full h-11 sm:h-12 pl-11 pr-11 rounded-xl bg-green-50/80 dark:bg-gray-900 border border-green-200/70 dark:border-gray-700 text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-400"
            autoComplete="off"
            enterKeyHint="search"
            aria-label="Search menu"
          />
          {q ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2.5 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-green-100 dark:border-gray-700 text-gray-500 flex items-center justify-center hover:bg-gray-50"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
