import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
function parseISO(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m: m - 1, d }
}
function fmtDate(iso: string) {
  if (!iso) return ''
  const { y, m, d } = parseISO(iso)
  return `${d} ${MONTHS[m]} ${y}`
}

const triggerClass =
  'flex h-12 w-full items-center justify-between rounded-2xl border border-hair bg-white px-4 text-sm transition-all hover:border-forest-200 focus:outline-none focus:border-forest-300 focus:ring-4 focus:ring-lime-100'

function Popover({ onClose, children, align = 'left' }: { onClose: () => void; children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <>
      <button aria-hidden tabIndex={-1} onClick={onClose} className="fixed inset-0 z-40 cursor-default" />
      <div
        className={cn(
          'absolute top-[calc(100%+6px)] z-50 animate-pop rounded-3xl border border-hair bg-white p-3 shadow-pop',
          align === 'right' ? 'right-0' : 'left-0',
        )}
      >
        {children}
      </div>
    </>
  )
}

export function DatePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Select date',
}: {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
}) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')
  const current = isControlled ? value : internal
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const base = current ? parseISO(current) : null
    const now = new Date()
    return base ? { y: base.y, m: base.m } : { y: now.getFullYear(), m: now.getMonth() }
  })

  const set = (iso: string) => {
    onChange?.(iso)
    if (!isControlled) setInternal(iso)
    setOpen(false)
  }

  const step = (dir: number) => {
    setView((v) => {
      let m = v.m + dir
      let y = v.y
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      return { y, m }
    })
  }

  const firstWeekday = new Date(view.y, view.m, 1).getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={triggerClass}>
        <span className={current ? 'font-medium text-forest' : 'text-forest-300'}>
          {current ? fmtDate(current) : placeholder}
        </span>
        <CalendarDays size={17} className="text-forest-300" />
      </button>

      {open && (
        <Popover onClose={() => setOpen(false)}>
          <div className="w-[260px]">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-forest">
                {MONTHS_FULL[view.m]} {view.y}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => step(-1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-forest-400 hover:bg-panel">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={() => step(1)} className="flex h-7 w-7 items-center justify-center rounded-lg text-forest-400 hover:bg-panel">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <span key={w} className="flex h-7 items-center justify-center text-[11px] font-semibold text-forest-300">
                  {w}
                </span>
              ))}
              {Array.from({ length: firstWeekday }).map((_, i) => <span key={`b-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const iso = toISO(view.y, view.m, day)
                const selected = current === iso
                const isToday = todayISO === iso
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => set(iso)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition-colors',
                      selected ? 'bg-forest text-white' : 'text-forest-500 hover:bg-panel',
                      !selected && isToday && 'ring-1 ring-lime-500',
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </Popover>
      )}
    </div>
  )
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const MINUTES = [0, 15, 30, 45]

export function TimePicker({
  value,
  defaultValue,
  onChange,
  placeholder = 'Select time',
}: {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  placeholder?: string
}) {
  const isControlled = value !== undefined
  const [internal, setInternal] = useState(defaultValue ?? '')
  const current = isControlled ? value : internal
  const [open, setOpen] = useState(false)

  const [h, m] = current ? current.split(':').map(Number) : [null, null]

  const set = (hh: number, mm: number) => {
    const iso = `${pad(hh)}:${pad(mm)}`
    onChange?.(iso)
    if (!isControlled) setInternal(iso)
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className={triggerClass}>
        <span className={current ? 'font-medium text-forest' : 'text-forest-300'}>
          {current || placeholder}
        </span>
        <Clock size={17} className="text-forest-300" />
      </button>

      {open && (
        <Popover onClose={() => setOpen(false)} align="right">
          <div className="flex w-[180px] gap-2">
            <div className="flex-1">
              <p className="mb-1 px-1 text-[11px] font-semibold uppercase text-forest-300">Hour</p>
              <div className="max-h-48 space-y-0.5 overflow-y-auto pr-1">
                {HOURS.map((hh) => (
                  <button
                    key={hh}
                    type="button"
                    onClick={() => set(hh, m ?? 0)}
                    className={cn(
                      'flex w-full items-center justify-center rounded-lg py-1.5 text-[13px] font-medium transition-colors',
                      h === hh ? 'bg-forest text-white' : 'text-forest-500 hover:bg-panel',
                    )}
                  >
                    {pad(hh)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="mb-1 px-1 text-[11px] font-semibold uppercase text-forest-300">Min</p>
              <div className="space-y-0.5">
                {MINUTES.map((mm) => (
                  <button
                    key={mm}
                    type="button"
                    onClick={() => set(h ?? 9, mm)}
                    className={cn(
                      'flex w-full items-center justify-center rounded-lg py-1.5 text-[13px] font-medium transition-colors',
                      m === mm ? 'bg-forest text-white' : 'text-forest-500 hover:bg-panel',
                    )}
                  >
                    {pad(mm)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Popover>
      )}
    </div>
  )
}
