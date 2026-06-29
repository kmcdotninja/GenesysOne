import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function StatCard({
  label,
  value,
  sub,
  icon,
  delta,
  deltaTone = 'up',
  className,
}: {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  delta?: ReactNode
  deltaTone?: 'up' | 'down' | 'flat'
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-4xl border border-hair bg-white p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-forest-400">{label}</span>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel text-forest-400">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="tnum text-[26px] font-semibold leading-none tracking-[-0.02em] text-forest">
          {value}
        </span>
        {delta && (
          <span
            className={cn(
              'mb-0.5 text-xs font-semibold',
              deltaTone === 'up' && 'text-teal',
              deltaTone === 'down' && 'text-rose-ink',
              deltaTone === 'flat' && 'text-forest-400',
            )}
          >
            {delta}
          </span>
        )}
      </div>
      {sub && <p className="mt-1.5 text-[13px] text-forest-400">{sub}</p>}
    </div>
  )
}

/** Compact tally used in the listing/trade status summary bars. */
export function Tally({
  label,
  count,
  value,
  accent,
}: {
  label: string
  count: number
  value: string
  accent?: string
}) {
  return (
    <div className="relative rounded-3xl border border-hair bg-white p-4">
      <span
        className="absolute left-4 top-4 h-2 w-2 rounded-full"
        style={{ background: accent ?? '#cfd6d2' }}
      />
      <p className="pl-4 text-[13px] font-medium text-forest-400">{label}</p>
      <p className="tnum mt-2 text-2xl font-semibold tracking-[-0.02em] text-forest">
        {count}
      </p>
      <p className="tnum mt-0.5 text-[13px] font-medium text-forest-400">{value}</p>
    </div>
  )
}
