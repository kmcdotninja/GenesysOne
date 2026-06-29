import { useId } from 'react'
import { cn } from '@/lib/cn'

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

export function AreaChart({
  data,
  height = 200,
  line = '#0c5c43',
  fill = '#a6e64d',
  className,
  showEndDot = true,
}: {
  data: number[]
  height?: number
  line?: string
  fill?: string
  className?: string
  showEndDot?: boolean
}) {
  const id = useId().replace(/:/g, '')
  const W = 600
  const H = 220
  const padY = 18
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: padY + (1 - (v - min) / range) * (H - padY * 2),
  }))

  const linePath = smoothPath(points)
  const areaPath = `${linePath} L ${W} ${H} L 0 ${H} Z`
  const end = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={cn('w-full', className)}
      style={{ height }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`fill-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity="0.45" />
          <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#fill-${id})`} />
      <path
        d={linePath}
        fill="none"
        stroke={line}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {showEndDot && (
        <>
          <line
            x1={end.x}
            y1={0}
            x2={end.x}
            y2={H}
            stroke={line}
            strokeWidth={1}
            strokeDasharray="3 4"
            opacity={0.35}
            vectorEffect="non-scaling-stroke"
          />
          <circle cx={end.x} cy={end.y} r={4.5} fill={line} />
          <circle cx={end.x} cy={end.y} r={8} fill={line} opacity={0.18} />
        </>
      )}
    </svg>
  )
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
