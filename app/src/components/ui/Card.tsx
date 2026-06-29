import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** A nested, recessed panel (light gray) rather than a raised white card. */
  inset?: boolean
  /** A dark forest surface with light text. */
  dark?: boolean
  pad?: boolean
}

export function Card({ inset, dark, pad = true, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-4xl',
        dark
          ? 'bg-forest text-white'
          : inset
            ? 'bg-panel'
            : 'bg-white border border-hair',
        pad && 'p-5 sm:p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-forest">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm leading-relaxed text-forest-400">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
