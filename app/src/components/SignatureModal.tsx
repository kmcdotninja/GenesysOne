import { useEffect, useRef, useState, type ChangeEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Check, Eraser, PenLine, Upload, X } from 'lucide-react'
import { Button, Segmented } from '@/components/ui'
import { cn } from '@/lib/cn'

type Mode = 'draw' | 'upload'

/**
 * Capture a signature by drawing on a canvas or uploading an image, then hand
 * the result back as a PNG/data-URL. Rendered at z-[80] so it layers above the
 * record-results drawer (z-[70]).
 */
export function SignatureModal({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (dataUrl: string) => void
}) {
  const [mode, setMode] = useState<Mode>('draw')
  const [uploaded, setUploaded] = useState<string | null>(null)
  const [hasInk, setHasInk] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  // Esc to close + lock background scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Size the canvas backing store to its layout box (clientWidth ignores the
  // modal's entrance transform, so strokes line up with the cursor).
  useEffect(() => {
    if (!open || mode !== 'draw') return
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = canvas.clientWidth * dpr
    canvas.height = canvas.clientHeight * dpr
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#023729'
    setHasInk(false)
  }, [open, mode])

  const pointFrom = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    last.current = pointFrom(e)
  }
  const moveStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const p = pointFrom(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    if (!hasInk) setHasInk(true)
  }
  const endStroke = () => {
    drawing.current = false
    last.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
  }

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setUploaded(reader.result as string)
    reader.readAsDataURL(file)
  }

  const reset = () => {
    setUploaded(null)
    setHasInk(false)
    setMode('draw')
  }

  const canSubmit = mode === 'draw' ? hasInk : !!uploaded

  const submit = () => {
    let data: string | null = null
    if (mode === 'draw' && hasInk) data = canvasRef.current?.toDataURL('image/png') ?? null
    else if (mode === 'upload') data = uploaded
    if (!data) return
    onSave(data)
    reset()
    onClose()
  }

  const close = () => {
    reset()
    onClose()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 bg-forest-900/30 backdrop-blur-[3px]" onClick={close} />
      <div className="relative flex w-full flex-col overflow-hidden rounded-t-4xl bg-white shadow-pop animate-pop sm:max-w-md sm:rounded-4xl">
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-[-0.01em] text-forest">Add your signature</h3>
            <p className="mt-1 text-sm text-forest-400">Draw a signature or upload an image to sign off.</p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-forest-400 transition-colors hover:bg-panel"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          <Segmented
            options={[
              { value: 'draw', label: 'Draw' },
              { value: 'upload', label: 'Upload' },
            ]}
            value={mode}
            onChange={(m) => setMode(m as Mode)}
          />

          {mode === 'draw' ? (
            <div className="mt-4">
              <div className="relative overflow-hidden rounded-2xl border border-dashed border-hair bg-panel/40">
                <canvas
                  ref={canvasRef}
                  className="block h-44 w-full cursor-crosshair touch-none"
                  onPointerDown={startStroke}
                  onPointerMove={moveStroke}
                  onPointerUp={endStroke}
                  onPointerLeave={endStroke}
                />
                {/* Signature baseline + hint */}
                <div className="pointer-events-none absolute inset-x-6 bottom-7 border-t border-hair" />
                {!hasInk && (
                  <span className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] font-medium text-forest-300">
                    <PenLine size={12} className="mr-1 inline" /> Sign above the line
                  </span>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" leftIcon={<Eraser size={15} />} onClick={clearCanvas} disabled={!hasInk}>
                  Clear
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              {uploaded ? (
                <div className="rounded-2xl border border-hair bg-panel/40 p-3">
                  <img
                    src={uploaded}
                    alt="Uploaded signature"
                    className="mx-auto max-h-40 w-auto rounded-lg bg-white object-contain outline outline-1 -outline-offset-1 outline-black/10"
                  />
                  <div className="mt-3 flex justify-center">
                    <Button variant="ghost" size="sm" onClick={() => setUploaded(null)}>
                      Choose a different file
                    </Button>
                  </div>
                </div>
              ) : (
                <label
                  className={cn(
                    'flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-hair bg-panel/40 text-center transition-colors hover:border-forest-300 hover:bg-panel',
                  )}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-forest-400 shadow-card">
                    <Upload size={18} />
                  </span>
                  <span className="text-sm font-semibold text-forest">Click to upload</span>
                  <span className="text-xs text-forest-400">PNG or JPG · transparent background works best</span>
                  <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFile} />
                </label>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-hair px-6 py-4">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button leftIcon={<Check size={16} />} onClick={submit} disabled={!canSubmit}>
            Save signature
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
