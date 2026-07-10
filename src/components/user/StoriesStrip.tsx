'use client'

const STORIES = [
  { emoji: '🍕', label: 'Pizza deal' },
  { emoji: '🍔', label: 'Burger fest' },
  { emoji: '🍜', label: 'Maggi night' },
  { emoji: '🔥', label: 'Flash 20%' },
  { emoji: '🎉', label: 'New combos' },
]

export function StoriesStrip() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-3">
      <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
        {STORIES.map(s => (
          <div key={s.label} className="shrink-0 flex flex-col items-center gap-1">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 p-0.5">
              <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-2xl">
                {s.emoji}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
