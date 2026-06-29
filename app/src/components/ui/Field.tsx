import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { ChevronDown, Upload } from 'lucide-react'
import { cn } from '@/lib/cn'

const baseField =
  'w-full rounded-2xl border border-hair bg-white text-sm text-forest placeholder:text-forest-300 ' +
  'transition-all duration-150 focus:outline-none focus:border-forest-300 focus:ring-4 focus:ring-lime-100 ' +
  'disabled:bg-panel disabled:text-forest-300'

export function Field({
  label,
  hint,
  required,
  optional,
  children,
  className,
}: {
  label?: ReactNode
  hint?: ReactNode
  required?: boolean
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-[13px] font-semibold text-forest-500">
            {label}
            {required && <span className="ml-0.5 text-orange">*</span>}
          </span>
          {optional && (
            <span className="text-[11px] font-medium text-forest-300">Optional</span>
          )}
        </div>
      )}
      {children}
      {hint && <p className="mt-1.5 text-xs leading-relaxed text-forest-400">{hint}</p>}
    </label>
  )
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(baseField, 'h-12 px-4', className)} {...props} />
}

export function Textarea({
  className,
  rows = 4,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(baseField, 'resize-none px-4 py-3 leading-relaxed', className)}
      {...props}
    />
  )
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={cn(
          baseField,
          'h-12 cursor-pointer appearance-none pl-4 pr-10 font-medium',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-forest-300"
        size={18}
      />
    </div>
  )
}

export function FileField({
  label,
  caption = 'PDF, JPG or PNG · up to 10MB',
  multiple,
}: {
  label?: string
  caption?: string
  multiple?: boolean
}) {
  return (
    <div className="group flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-hair bg-panel/50 px-4 py-3.5 transition-colors hover:border-forest-300 hover:bg-lime-50/60">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-400 shadow-card transition-colors group-hover:text-forest">
        <Upload size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-forest">
          {label ?? 'Upload file'}
          {multiple && <span className="font-normal text-forest-400"> (one or more)</span>}
        </p>
        <p className="truncate text-xs text-forest-400">{caption}</p>
      </div>
    </div>
  )
}

/** Small label/value pair used in detail panels. */
export function KeyValue({
  label,
  value,
  className,
}: {
  label: ReactNode
  value: ReactNode
  className?: string
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-xs font-medium text-forest-400">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold text-forest">{value}</dd>
    </div>
  )
}
