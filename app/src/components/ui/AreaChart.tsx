import { useId } from 'react'
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  ReferenceDot,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from './chart'
import { cn } from '@/lib/cn'

/** shadcn-style area chart (Recharts) — interactive crosshair + themed tooltip. */
export function AreaChart({
  data,
  height = 200,
  line = '#0c5c43',
  fill = '#a6e64d',
  className,
  showEndDot = true,
  labels,
  valueFormat = (v) => `${Math.round(v).toLocaleString()}`,
  interactive = true,
}: {
  data: number[]
  height?: number
  line?: string
  fill?: string
  className?: string
  showEndDot?: boolean
  labels?: string[]
  valueFormat?: (v: number) => string
  interactive?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const chartData = data.map((v, i) => ({ x: labels?.[i] ?? `${i + 1}`, v }))
  const config: ChartConfig = { v: { color: line } }
  const last = chartData[chartData.length - 1]

  return (
    <ChartContainer config={config} className={cn('w-full', className)} style={{ height }}>
      <RechartsAreaChart data={chartData} margin={{ top: 10, right: 6, left: 6, bottom: 0 }}>
        <defs>
          <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fill} stopOpacity={0.45} />
            <stop offset="95%" stopColor={fill} stopOpacity={0.03} />
          </linearGradient>
        </defs>
        {interactive && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
        <XAxis dataKey="x" hide padding={{ left: 6, right: 6 }} />
        <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
        {interactive && (
          <ChartTooltip
            cursor={{ stroke: line, strokeOpacity: 0.35, strokeDasharray: '3 4' }}
            content={<ChartTooltipContent valueFormat={valueFormat} />}
          />
        )}
        <Area
          dataKey="v"
          type="natural"
          stroke={line}
          strokeWidth={2.5}
          fill={`url(#area-${id})`}
          dot={false}
          activeDot={interactive ? { r: 4.5, fill: line, stroke: '#fff', strokeWidth: 2 } : false}
          isAnimationActive
        />
        {showEndDot && last && (
          <ReferenceDot x={last.x} y={last.v} r={4} fill={line} stroke="#fff" strokeWidth={2} />
        )}
      </RechartsAreaChart>
    </ChartContainer>
  )
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const p0 = points[i - 1]
    const p1 = points[i]
    const cx = (p0.x + p1.x) / 2
    d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}

/** Minimal inline sparkline for table rows / cards. */
export function Sparkline({
  data,
  width = 96,
  height = 32,
  color = '#0c5c43',
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: 3 + (1 - (v - min) / range) * (height - 6),
  }))
  return (
    <svg width={width} height={height} className="overflow-visible">
      <path
        d={smoothPath(pts)}
        fill="none"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
