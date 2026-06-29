import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface TabItem<T extends string> {
  value: T
  label: ReactNode
  count?: number
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  size = 'lg',
  className,
}: {
  items: TabItem<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'md' | 'lg'
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-6', className)}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={cn(
              'group relative -mb-px flex items-center gap-2 pb-3 font-semibold transition-colors',
              size === 'lg' ? 'text-[22px] tracking-[-0.01em]' : 'text-sm',
              active ? 'text-forest' : 'text-forest-300 hover:text-forest-500',
            )}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[11px] font-bold',
                  active ? 'bg-lime-100 text-forest-500' : 'bg-panel text-forest-300',
                )}
              >
                {item.count}
              </span>
            )}
            {active && (
              <span className="absolute -bottom-px left-0 h-[2.5px] w-full rounded-full bg-forest" />
            )}
          </button>
        )
      })}
    </div>
  )
}
