import { Boxes, Inbox, Search, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'gem' | 'search' | 'inbox' | 'users'

const ICONS: Record<Variant, LucideIcon> = {
  gem: Boxes,
  search: Search,
  inbox: Inbox,
  users: Users,
}

/**
 * shadcn / Linear-style empty state art:
 * a glowing icon tile on a faint grid, a dashed connector,
 * and a skeleton "result" card below.
 */
export function EmptyIllustration({
  variant = 'gem',
  size = 'md',
  className,
}: {
  variant?: Variant
  size?: 'sm' | 'md'
  className?: string
}) {
  const Icon = ICONS[variant]
  const W = size === 'sm' ? 224 : 296
  const H = size === 'sm' ? 150 : 196
  const TILE = size === 'sm' ? 44 : 54
  const tileCenterY = H * 0.24
  const tileBottom = tileCenterY + TILE / 2
  const cardTop = H * 0.62
  const grid = size === 'sm' ? '22px 22px' : '28px 28px'

  return (
    <div
      className={cn('relative mx-auto select-none', className)}
      style={{ width: W, height: H }}
      aria-hidden="true"
    >
      {/* faint grid, faded at the edges */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(2,55,41,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(2,55,41,0.06) 1px, transparent 1px)',
          backgroundSize: `${grid}, ${grid}`,
          WebkitMaskImage:
            'radial-gradient(ellipse 72% 72% at 50% 42%, #000 35%, transparent 80%)',
          maskImage:
            'radial-gradient(ellipse 72% 72% at 50% 42%, #000 35%, transparent 80%)',
        }}
      />

      {/* glow */}
      <div
        className="gx-twinkle absolute rounded-full bg-lime/45 blur-2xl"
        style={{
          width: TILE * 2.4,
          height: TILE * 2.4,
          left: '50%',
          top: tileCenterY,
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* dashed connector */}
      <div
        className="absolute border-l-2 border-dashed border-forest-200/70"
        style={{
          left: '50%',
          top: tileBottom,
          height: cardTop - tileBottom + 6,
          transform: 'translateX(-0.5px)',
        }}
      />

      {/* glowing icon tile */}
      <div
        className="gx-float-soft absolute"
        style={{ left: '50%', top: tileCenterY, transform: 'translate(-50%, -50%)' }}
      >
        <div
          className="flex items-center justify-center rounded-2xl border border-lime-200 bg-white shadow-soft"
          style={{ width: TILE, height: TILE }}
        >
          <Icon size={size === 'sm' ? 18 : 22} className="text-teal" strokeWidth={2} />
        </div>
      </div>

      {/* skeleton result card */}
      <div
        className="absolute rounded-2xl border border-hair bg-white/90 shadow-card"
        style={{ left: '50%', top: cardTop, width: W * 0.78, transform: 'translateX(-50%)', padding: size === 'sm' ? 10 : 12 }}
      >
        <div className="flex items-center gap-3">
          <span className="h-7 w-7 shrink-0 rounded-full bg-panel" />
          <div className="flex-1 space-y-2">
            <span className="block h-2 w-3/4 rounded-full bg-panel" />
            <span className="block h-2 w-1/2 rounded-full bg-hair" />
          </div>
        </div>
      </div>
    </div>
  )
}
