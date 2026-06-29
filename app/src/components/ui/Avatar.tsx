import { useState } from 'react'
import { cn } from '@/lib/cn'

const COLORS: string[] = [
  '#34b489',
  '#5b7388',
  '#e0a32a',
  '#c06a3a',
  '#06674c',
  '#b07ab6',
  '#6fab22',
  '#7aa0aa',
]

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function colorFor(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}

const sizes = {
  xs: 'h-7 w-7 text-[10px]',
  sm: 'h-9 w-9 text-xs',
  md: 'h-10 w-10 text-[13px]',
  lg: 'h-12 w-12 text-sm',
}

export function Avatar({
  name,
  src,
  size = 'md',
  className,
  ring = true,
}: {
  name: string
  src?: string
  size?: keyof typeof sizes
  className?: string
  ring?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const bg = colorFor(name)
  const showImage = src && !failed

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-card select-none',
        ring && 'ring-2 ring-white',
        sizes[size],
        className,
      )}
      style={showImage ? undefined : { background: bg }}
      title={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        initialsOf(name)
      )}
    </span>
  )
}

/** Photo URL helper (deterministic faces with graceful initials fallback). */
export function faceUrl(seed: string): string {
  return `https://i.pravatar.cc/120?u=${encodeURIComponent(seed)}`
}
