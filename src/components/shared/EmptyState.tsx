import Link from 'next/link'

interface EmptyStateProps {
  emoji?: string
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ emoji = '🍽️', title, description, actionLabel, actionHref, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-6xl mb-4 animate-float">{emoji}</div>
      <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">{description}</p>}
      {actionLabel && actionHref && (
        <Link href={actionHref} className="btn-primary">{actionLabel}</Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button onClick={onAction} className="btn-primary">{actionLabel}</button>
      )}
    </div>
  )
}
