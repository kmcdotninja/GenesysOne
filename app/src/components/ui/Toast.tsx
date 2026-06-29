import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

type Tone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: Tone
  title: string
  description?: string
  closing?: boolean
}

interface ToastApi {
  toast: (t: { tone?: Tone; title: string; description?: string }) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

const TONE: Record<Tone, { icon: LucideIcon; ring: string; accent: string }> = {
  success: { icon: CheckCircle2, ring: 'bg-teal-soft text-teal', accent: 'bg-teal' },
  error: { icon: AlertTriangle, ring: 'bg-rose-soft text-rose-ink', accent: 'bg-rose-ink' },
  info: { icon: Info, ring: 'bg-lime-100 text-forest-500', accent: 'bg-lime-500' },
}

const DURATION = 4000

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.map((t) => (t.id === id ? { ...t, closing: true } : t)))
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 240)
  }, [])

  const push = useCallback(
    (t: { tone?: Tone; title: string; description?: string }) => {
      const id = ++counter.current
      setItems((prev) => [...prev, { id, tone: t.tone ?? 'info', title: t.title, description: t.description }])
      setTimeout(() => dismiss(id), DURATION)
    },
    [dismiss],
  )

  const api: ToastApi = {
    toast: push,
    success: (title, description) => push({ tone: 'success', title, description }),
    error: (title, description) => push({ tone: 'error', title, description }),
    info: (title, description) => push({ tone: 'info', title, description }),
  }

  return (
    <ToastContext.Provider value={api}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2.5">
          {items.map((t) => {
            const meta = TONE[t.tone]
            const Icon = meta.icon
            return (
              <div
                key={t.id}
                role="status"
                className={cn(
                  'pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl border border-hair bg-white/95 py-3.5 pl-4 pr-9 shadow-pop backdrop-blur-sm',
                  t.closing ? 'animate-toast-out' : 'animate-toast-in',
                )}
              >
                {/* tone accent */}
                <span className={cn('absolute inset-y-0 left-0 w-1', meta.accent)} />
                <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', meta.ring)}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold tracking-[-0.01em] text-forest">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-[13px] leading-snug text-forest-400">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Dismiss notification"
                  className="absolute right-2 top-2.5 flex h-7 w-7 items-center justify-center rounded-lg text-forest-300 transition-colors hover:bg-panel hover:text-forest-500"
                >
                  <X size={15} />
                </button>
              </div>
            )
          })}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
