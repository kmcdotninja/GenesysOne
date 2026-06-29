import { useEffect, useState } from 'react'
import { Send } from 'lucide-react'
import { Button, Drawer, Input, MineralIcon, StatusPill, Textarea } from '@/components/ui'
import { useStore } from '@/store/AppStore'
import { money } from '@/lib/format'
import type { Role } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * Chat-style negotiation thread for a single RFQ, shared by both the buyer and
 * seller views. Reads the live RFQ from the store (by id) so newly sent messages
 * appear immediately. `me` decides which side of the thread the user is on.
 */
export function NegotiationDrawer({
  open,
  onClose,
  rfqId,
  me,
}: {
  open: boolean
  onClose: () => void
  rfqId: string | null
  me: Role
}) {
  const store = useStore()
  const rfq = store.rfqs.find((r) => r.id === rfqId)
  const [body, setBody] = useState('')
  const [price, setPrice] = useState('')

  // Reset the composer whenever we switch to a different RFQ.
  useEffect(() => {
    setBody('')
    setPrice('')
  }, [rfqId])

  const counterparty = rfq ? (me === 'seller' ? rfq.buyer : rfq.seller) : ''
  const closed = rfq?.status === 'closed'
  const messages = rfq?.messages ?? []

  const send = () => {
    if (!rfq || !body.trim()) return
    store.sendRfqMessage(rfq.id, me, body.trim(), price ? Number(price) : undefined)
    setBody('')
    setPrice('')
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={<span className="capitalize">{rfq ? `${rfq.mineral} negotiation` : 'Negotiation'}</span>}
      subtitle={rfq ? `with ${counterparty}` : ''}
      size="lg"
      footer={
        rfq
          ? closed
            ? (
              <p className="text-center text-sm text-forest-400">
                This RFQ is closed — the conversation has ended.
              </p>
            )
            : (
              <div className="space-y-2.5">
                <Textarea
                  rows={2}
                  placeholder={`Message ${counterparty}…`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    placeholder="Offer (optional, ₦)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="flex-1"
                  />
                  <Button leftIcon={<Send size={16} />} onClick={send} disabled={!body.trim()}>
                    Send
                  </Button>
                </div>
              </div>
            )
          : undefined
      }
    >
      {rfq && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-2xl bg-panel/60 p-4">
            <MineralIcon mineral={rfq.mineral} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold capitalize text-forest">{rfq.mineral}</p>
              <p className="text-xs text-forest-400">
                {rfq.quantity} {rfq.unit} · {rfq.incoterms.toUpperCase()} · to {rfq.deliveryState}
              </p>
            </div>
            <StatusPill status={rfq.status} />
          </div>

          {rfq.quotedPrice != null && (
            <div className="flex items-center justify-between rounded-2xl border border-hair px-4 py-3">
              <span className="text-sm text-forest-400">Latest quote</span>
              <span className="tnum text-lg font-semibold text-forest">{money(rfq.quotedPrice)}</span>
            </div>
          )}

          <div className="space-y-3 pt-1">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-forest-400">
                No messages yet — start the conversation below.
              </p>
            ) : (
              messages.map((m) => {
                const mine = m.from === me
                return (
                  <div key={m.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3.5 py-2.5',
                        mine ? 'bg-forest text-white' : 'bg-panel text-forest',
                      )}
                    >
                      <p className={cn('mb-1 text-[11px] font-medium', mine ? 'text-white/60' : 'text-forest-400')}>
                        {m.author} · {m.at}
                      </p>
                      {m.price != null && (
                        <p
                          className={cn(
                            'mb-1.5 inline-flex rounded-lg px-2 py-0.5 text-xs font-semibold tnum',
                            mine ? 'bg-white/15 text-white' : 'bg-white text-forest',
                          )}
                        >
                          Offer {money(m.price)}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{m.body}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </Drawer>
  )
}
