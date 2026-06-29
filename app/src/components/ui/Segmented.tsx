import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export interface SegOption<T extends string> {
  label: ReactNode
  value: T
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  block,
  className,
}: {
  options: SegOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  block?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-panel p-1',
        block && 'flex w-full',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'relative inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out',
              size === 'sm' ? 'h-8 px-3.5 text-[13px]' : 'h-10 px-5 text-sm',
              'rounded-full',
              block && 'flex-1',
              active
                ? 'bg-white text-forest shadow-chip'
                : 'text-forest-400 hover:text-forest-500',
            )}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
