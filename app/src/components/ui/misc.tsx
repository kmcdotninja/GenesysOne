import type { InputHTMLAttributes, ReactNode } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { EmptyIllustration } from './Illustration'

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label?: ReactNode
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5"
    >
      <span
        className={cn(
          'relative h-6 w-10 rounded-full transition-colors duration-200',
          checked ? 'bg-forest' : 'bg-hair',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform duration-200',
            checked && 'translate-x-4',
          )}
        />
      </span>
      {label && <span className="text-sm font-medium text-forest-500">{label}</span>}
    </button>
  )
}

export function SearchInput({
  className,
  wrapClassName,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { wrapClassName?: string }) {
  return (
    <div className={cn('relative', wrapClassName)}>
      <Search
        size={18}
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest-300"
      />
      <input
        className={cn(
          'h-11 w-full rounded-2xl border border-hair bg-white pl-11 pr-4 text-sm text-forest placeholder:text-forest-300',
          'transition-all focus:outline-none focus:border-forest-300 focus:ring-4 focus:ring-lime-100',
          className,
        )}
        {...props}
      />
    </div>
  )
}

export function EmptyState({
  variant = 'gem',
  title,
  description,
  action,
  compact,
}: {
  variant?: 'gem' | 'search' | 'inbox' | 'users'
  title: string
  description?: string
  action?: ReactNode
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'px-6 py-8' : 'px-6 py-14',
      )}
    >
      <EmptyIllustration variant={variant} size={compact ? 'sm' : 'md'} />
      <p className="mt-5 text-[15px] font-semibold text-forest">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-forest-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/** Section heading inside a card/form. */
export function SectionLabel({
  children,
  hint,
}: {
  children: ReactNode
  hint?: ReactNode
}) {
  return (
    <div className="mb-4">
      <h4 className="text-sm font-bold uppercase tracking-[0.06em] text-forest-400">
        {children}
      </h4>
      {hint && <p className="mt-1 text-[13px] text-forest-400 normal-case">{hint}</p>}
    </div>
  )
}
