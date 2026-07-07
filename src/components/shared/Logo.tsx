import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
}

const sizes = { sm: 28, md: 36, lg: 44 }

export function Logo({ size = 'md', showText = true, href = '/' }: LogoProps) {
  const px = sizes[size]

  const content = (
    <div className="flex items-center gap-2.5 group">
      <Image
        src="/icon.svg"
        alt="CraveBox"
        width={px}
        height={px}
        className="rounded-lg shadow-sm group-hover:scale-105 transition-transform"
        priority
      />
      {showText && (
        <span className={`font-extrabold text-green-900 dark:text-white tracking-tight ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
          Crave<span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">Box</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href} className="inline-flex">{content}</Link>
  }
  return content
}
