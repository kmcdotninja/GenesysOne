import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Reads `?focus=<id>` from the URL (set by deep-linked notifications), scrolls
 * the matching element into view, and returns the id so the page can briefly
 * highlight it. Render the target element with `id={`${prefix}-${itemId}`}`.
 */
export function useFocusHighlight(prefix = 'req'): string | null {
  const [searchParams] = useSearchParams()
  const [highlight, setHighlight] = useState<string | null>(null)

  useEffect(() => {
    const focus = searchParams.get('focus')
    if (!focus) return
    setHighlight(focus)
    document
      .getElementById(`${prefix}-${focus}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    const t = setTimeout(() => setHighlight(null), 2600)
    return () => clearTimeout(t)
  }, [searchParams, prefix])

  return highlight
}
