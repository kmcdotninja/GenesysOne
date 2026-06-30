import { useEffect, useState } from 'react'
import { BadgeCheck, Check, Handshake, Send } from 'lucide-react'
import { Button, Drawer, Input, MineralIcon, StatusPill, Textarea, useToast } from '@/components/ui'
import { useStore } from '@/store/AppStore'
import { money } from '@/lib/format'
import type { Role } from '@/data/types'
import { cn } from '@/lib/cn'

/**
 * Chat-style negotiation thread for a single RFQ, shared by both the buyer and
 * seller views. Reads the live RFQ from the store (by id) so newly sent messages
 * appear immediately. `me` decides which side of the thread the user is on.
 *
 * A price sits "on the table" (the most recent offer). Each side accepts it, and
 * only when BOTH have accepted does the deal close — an escrow-funded order is
 * created. A fresh offer voids any prior acceptance.
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
  const toast = useToast()
  const rfq = store.rfqs.find((r) => r.id === rfqId)
  const [body, setBody] = useState('')
  const [price, setPrice] = useState('')

  // Reset the composer whenever we switch to a different RFQ.
  useEffect(() => {
    setBody('')
    setPrice('')
  }, [rfqId])

  const otherRole: Role = me === 'seller' ? 'buyer' : 'seller'
  const otherLabel = otherRole === 'seller' ? 'Seller' : 'Buyer'
  const counterparty = rfq ? (me === 'seller' ? rfq.buyer : rfq.seller) : ''
  const closed = rfq?.status === 'closed'
  const accepted = rfq?.status === 'accepted'
  const messages = rfq?.messages ?? []

  // The live price on the table: the most recent real (non-system) offer.
  const currentOffer = rfq
    ? [...(rfq.messages ?? [])].reverse().find((m) => m.price != null && !m.system)?.price ?? rfq.quotedPrice
    : undefined
  const agreedBy = rfq?.agreedBy ?? []
  const iAccepted = agreedBy.includes(me)
  const theyAccepted = agreedBy.includes(otherRole)

  const send = () => {
    if (!rfq || !body.trim()) return
    store.sendRfqMessage(rfq.id, me, body.trim(), price ? Number(price) : undefined)
    setBody('')
    setPrice('')
  }

  const accept = () => {
    if (!rfq || currentOffer == null) return
    const res = store.agreeRfq(rfq.id, me)
    if (res === 'no_offer') toast.error('No price yet', 'Put an offer on the table before accepting.')
    else if (res === 'insufficient') toast.error('Escrow funding failed', "The buyer's wallet balance is below the agreed price.")
    else if (res === 'waiting') toast.success('Price accepted', `Waiting for the ${otherRole} to accept ${money(currentOffer)}.`)
    else if (res === 'agreed') toast.success('Deal agreed', `Order created and funded in escrow at ${money(currentOffer)}.`)
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
          ? closed || accepted
            ? (
              <p className="text-center text-sm text-forest-400">
                {accepted
                  ? 'Agreement reached — track this deal under Trades.'
                  : 'This RFQ is closed — the conversation has ended.'}
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

          {/* Deal panel — the price on the table and where both sides accept it. */}
          {currentOffer != null && (
            <div className={cn('rounded-2xl border p-4', accepted ? 'border-teal/30 bg-teal-soft/40' : 'border-hair')}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-forest-400">{accepted ? 'Agreed price' : 'Price on the table'}</span>
                <span className="tnum text-lg font-semibold text-forest">{money(currentOffer)}</span>
              </div>

              {accepted ? (
                <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-teal">
                  <BadgeCheck size={16} /> Both sides agreed — order created &amp; funded in escrow.
                </p>
              ) : (
                <>
                  <div className="mt-3 flex items-center gap-2">
                    <AcceptChip label="You" ok={iAccepted} />
                    <AcceptChip label={otherLabel} ok={theyAccepted} />
                  </div>
                  {iAccepted ? (
                    <p className="mt-3 text-center text-xs text-forest-400">
                      You accepted {money(currentOffer)} — waiting for the {otherRole} to confirm.
                    </p>
                  ) : (
                    <Button className="mt-3 w-full" leftIcon={<Handshake size={16} />} onClick={accept}>
                      {theyAccepted ? `Accept ${money(currentOffer)} & close deal` : `Accept ${money(currentOffer)}`}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          <div className="space-y-3 pt-1">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-forest-400">
                No messages yet — start the conversation below.
              </p>
            ) : (
              messages.map((m) => {
                if (m.system) {
                  return (
                    <div key={m.id} className="flex justify-center">
                      <div className="max-w-[88%] rounded-full bg-panel px-3.5 py-1.5 text-center text-[11px] font-medium text-forest-500">
                        {m.body}
                      </div>
                    </div>
                  )
                }
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

/** A small "You ✓ / Seller •" indicator showing who has accepted the price. */
function AcceptChip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        ok ? 'bg-teal-soft/60 text-teal' : 'bg-panel text-forest-400',
      )}
    >
      {ok ? <Check size={13} /> : <span className="h-1.5 w-1.5 rounded-full bg-forest-300" />}
      {label}
    </span>
  )
}
