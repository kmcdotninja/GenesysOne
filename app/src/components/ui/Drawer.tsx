import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * A floating, detached side drawer — rounded on all corners with a margin from
 * the viewport edge, sliding in from the right. API-compatible with Modal.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg' | 'xl'
}) {
  const [mounted, setMounted] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      setClosing(false)
    } else if (mounted) {
      setClosing(true)
      const t = setTimeout(() => {
        setMounted(false)
        setClosing(false)
      }, 280)
      return () => clearTimeout(t)
    }
  }, [open, mounted])

  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mounted, onClose])

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div
        className={cn(
          'absolute inset-0 bg-forest-900/25 backdrop-blur-[3px]',
          closing ? 'animate-fade-out' : 'animate-fade-in',
        )}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute right-2 top-2 bottom-2 flex w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-4xl border border-hair bg-white shadow-pop sm:right-3 sm:top-3 sm:bottom-3',
          size === 'xl' ? 'sm:w-[640px]' : size === 'lg' ? 'sm:w-[540px]' : 'sm:w-[440px]',
          closing ? 'animate-drawer-out' : 'animate-drawer-in',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hair px-6 py-5">
          <div className="min-w-0">
            {title && (
              <h3 className="text-lg font-semibold tracking-[-0.01em] text-forest">{title}</h3>
            )}
            {subtitle && <p className="mt-0.5 truncate text-sm text-forest-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-forest-400 transition-colors hover:bg-panel hover:text-forest"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && <div className="border-t border-hair px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
