import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

type GemStyle = { sym: string; from: string; to: string; ink: string }

/** Stock product photos for each mineral, served from /public/minerals. */
const MINERAL_IMAGE: Record<string, string> = {
  tin: '/minerals/Tin.png',
  lithium: '/minerals/Lithium.png',
  columbite: '/minerals/Columbite.png',
  lead: '/minerals/Lead.png',
  zinc: '/minerals/Zinc.png',
  copper: '/minerals/Copper.png',
  wolframite: '/minerals/Wolframite.png',
  monazite: '/minerals/Monazite.png',
  tantalite: '/minerals/Tantalite.png',
  beryllium: '/minerals/Beryllium.png',
  gold: '/minerals/Gold.png',
  spodumene: '/minerals/Spodumene.png',
}

/** Resolve a mineral's stock photo URL (undefined for unknown minerals). */
export function mineralImage(mineral: string): string | undefined {
  return MINERAL_IMAGE[mineral.toLowerCase()]
}

const MINERAL_STYLE: Record<string, GemStyle> = {
  tin: { sym: 'Sn', from: '#9fb4c4', to: '#5b7388', ink: '#fff' },
  lithium: { sym: 'Li', from: '#d7e8a6', to: '#a6e64d', ink: '#02281e' },
  columbite: { sym: 'Cb', from: '#6b6f76', to: '#33363c', ink: '#fff' },
  lead: { sym: 'Pb', from: '#8c93a1', to: '#4a4f5c', ink: '#fff' },
  zinc: { sym: 'Zn', from: '#bcd3da', to: '#7aa0aa', ink: '#02281e' },
  copper: { sym: 'Cu', from: '#f0a878', to: '#c06a3a', ink: '#fff' },
  wolframite: { sym: 'W', from: '#5d5a52', to: '#2c2a26', ink: '#fff' },
  monazite: { sym: 'Mz', from: '#d9b06a', to: '#a87b2e', ink: '#fff' },
  tantalite: { sym: 'Ta', from: '#7e8aa0', to: '#444f63', ink: '#fff' },
  beryllium: { sym: 'Be', from: '#9fe6c8', to: '#34b489', ink: '#02281e' },
  gold: { sym: 'Au', from: '#ffd874', to: '#e0a32a', ink: '#5a3d00' },
  spodumene: { sym: 'Sp', from: '#e6c7e8', to: '#b07ab6', ink: '#fff' },
}

const FALLBACK: GemStyle = { sym: '◆', from: '#cfd6d2', to: '#9aa39e', ink: '#fff' }

const sizes = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-[11px]',
  lg: 'h-11 w-11 text-[13px]',
  xl: 'h-14 w-14 text-base',
}

export function MineralIcon({
  mineral,
  size = 'md',
  className,
  src,
  shape = 'circle',
}: {
  mineral: string
  size?: keyof typeof sizes
  className?: string
  /** Explicit product photo (e.g. a seller upload). Falls back to the mineral's
   *  stock photo, then to the colored glyph if the image can't load. */
  src?: string
  shape?: 'circle' | 'rounded'
}) {
  const radius = shape === 'rounded' ? 'rounded-xl' : 'rounded-full'
  const resolved = src ?? mineralImage(mineral)
  const [errored, setErrored] = useState(false)
  // Reset the error flag when the image source changes (e.g. row reuse).
  useEffect(() => setErrored(false), [resolved])

  if (resolved && !errored) {
    return (
      <img
        src={resolved}
        alt={mineral}
        title={mineral}
        loading="lazy"
        decoding="async"
        onError={() => setErrored(true)}
        className={cn(
          // Free-standing product photo: no box/outline so the mineral isn't
          // clipped — just the cut-out PNG with a soft shadow that follows its shape.
          'shrink-0 select-none object-contain drop-shadow-[0_2px_4px_rgba(2,40,30,0.18)]',
          sizes[size],
          className,
        )}
      />
    )
  }
  const s = MINERAL_STYLE[mineral.toLowerCase()] ?? FALLBACK
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-bold ring-2 ring-white shadow-card select-none',
        radius,
        sizes[size],
        className,
      )}
      style={{
        background: `linear-gradient(140deg, ${s.from}, ${s.to})`,
        color: s.ink,
      }}
      title={mineral}
    >
      {s.sym}
    </span>
  )
}

/** Two overlapping mineral glyphs — used for trade pairs. */
export function MineralPair({
  a,
  b,
  size = 'md',
}: {
  a: string
  b: string
  size?: keyof typeof sizes
}) {
  return (
    <span className="inline-flex items-center">
      <MineralIcon mineral={a} size={size} />
      <MineralIcon mineral={b} size={size} className="-ml-3" />
    </span>
  )
}
