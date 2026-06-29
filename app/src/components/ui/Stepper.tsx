import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface Step {
  title: string
  label: string
}

export function Stepper({
  steps,
  current,
  onSelect,
}: {
  steps: Step[]
  current: number
  onSelect?: (index: number) => void
}) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        const isLast = i === steps.length - 1
        return (
          <li key={step.title} className="relative flex gap-3.5">
            {/* connector */}
            {!isLast && (
              <span
                className={cn(
                  'absolute left-[15px] top-9 h-[calc(100%-1.5rem)] w-px',
                  done ? 'bg-forest-200' : 'bg-hair',
                )}
              />
            )}
            <button
              type="button"
              onClick={() => onSelect?.(i)}
              className={cn(
                'relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all duration-200',
                done && 'bg-forest text-white',
                active && 'bg-forest text-white shadow-soft ring-4 ring-lime-100',
                !done && !active && 'bg-panel text-forest-300',
              )}
            >
              {done ? <Check size={15} strokeWidth={3} /> : i + 1}
            </button>
            <div className={cn('pb-8', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-xs font-medium',
                  active || done ? 'text-forest-400' : 'text-forest-300',
                )}
              >
                {step.title}
              </p>
              <p
                className={cn(
                  'mt-0.5 text-[15px] font-semibold transition-colors',
                  active ? 'text-forest' : done ? 'text-forest-500' : 'text-forest-300',
                )}
              >
                {step.label}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
