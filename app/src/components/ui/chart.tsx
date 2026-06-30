import * as React from 'react'
import { ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts'
import { cn } from '@/lib/cn'

/** shadcn-style chart config: maps a series key to a label + colour. */
export type ChartConfig = Record<string, { label?: React.ReactNode; color?: string }>

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null)

export function useChart() {
  const ctx = React.useContext(ChartContext)
  if (!ctx) throw new Error('useChart must be used within a <ChartContainer />')
  return ctx
}

/** Wraps a Recharts chart with a responsive container + themed Recharts overrides. */
export function ChartContainer({
  config,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { config: ChartConfig; children: React.ReactElement }) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart
        className={cn(
          "flex justify-center text-xs",
          "[&_.recharts-cartesian-axis-tick_text]:fill-forest-300",
          "[&_.recharts-cartesian-grid_line]:stroke-hair",
          "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-hair",
          "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
          "[&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none [&_.recharts-sector]:outline-none",
          className,
        )}
        {...props}
      >
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

export const ChartTooltip = RechartsTooltip

interface TooltipItem {
  value?: number
  name?: string | number
  dataKey?: string | number
  color?: string
}

/** Themed tooltip card matching the shadcn charts look. */
export function ChartTooltipContent({
  active,
  payload,
  label,
  valueFormat,
  hideLabel,
  indicator = 'dot',
  className,
}: {
  active?: boolean
  payload?: TooltipItem[]
  label?: React.ReactNode
  valueFormat?: (v: number) => string
  hideLabel?: boolean
  indicator?: 'dot' | 'line'
  className?: string
}) {
  const { config } = useChart()
  if (!active || !payload?.length) return null

  return (
    <div className={cn('min-w-[8rem] rounded-xl border border-hair bg-white px-3 py-2 shadow-pop', className)}>
      {!hideLabel && label != null && (
        <p className="mb-1.5 text-[11px] font-semibold text-forest-400">{label}</p>
      )}
      <div className="space-y-1.5">
        {payload.map((item, i) => {
          const key = String(item.dataKey ?? item.name ?? i)
          const conf = config[key]
          const color = item.color || conf?.color || '#0c5c43'
          const v = typeof item.value === 'number' ? item.value : Number(item.value ?? 0)
          return (
            <div key={i} className="flex items-center gap-2 text-sm">
              <span
                className={cn('shrink-0', indicator === 'dot' ? 'h-2.5 w-2.5 rounded-[3px]' : 'h-3 w-1 rounded-full')}
                style={{ background: color }}
              />
              {conf?.label && <span className="text-forest-400">{conf.label}</span>}
              <span className="tnum ml-auto font-semibold text-forest">
                {valueFormat ? valueFormat(v) : v.toLocaleString()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
