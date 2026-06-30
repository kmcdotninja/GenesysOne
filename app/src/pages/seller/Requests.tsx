import { useEffect, useState } from 'react'
import { Check, FileText, Handshake, MessageSquare, Send, TestTube2, Truck, X } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  KeyValue,
  MineralIcon,
  StatCard,
  StatusPill,
  useToast,
} from '@/components/ui'
import { NegotiationDrawer } from '@/components/NegotiationDrawer'
import { useStore } from '@/store/AppStore'
import { useAccount } from '@/components/shell/AccountContext'
import { SELLER_CO } from '@/data/mock'
import { cn } from '@/lib/cn'
import { useFocusHighlight } from '@/lib/useFocusHighlight'

export function SellerRequests() {
  const { rfqs, sampleRequests, respondToRfq, setSampleStatus } = useStore()
  const toast = useToast()
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null)
  // Deep-link: scroll to and briefly highlight the request named in ?focus=<id>.
  const highlight = useFocusHighlight('req')

  // Only requests addressed to this seller account.
  const { verified } = useAccount()
  const myRfqs = (verified ? rfqs : []).filter((r) => r.seller === SELLER_CO)
  const mySamples = (verified ? sampleRequests : []).filter((r) => r.seller === SELLER_CO)
  const openRfqs = myRfqs.filter((r) => r.status === 'pending' || r.status === 'negotiation').length
  const pendingSamples = mySamples.filter((r) => r.status !== 'delivered').length

  // A deep-linked RFQ opens straight into its negotiation thread.
  useEffect(() => {
    if (highlight && rfqs.some((r) => r.id === highlight)) setNegotiatingId(highlight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight])

  const respond = (id: string, status: 'responded' | 'closed', mineral: string) => {
    respondToRfq(id, status)
    if (status === 'closed') toast.info('RFQ declined', `The ${mineral} RFQ was returned to the buyer.`)
    else toast.success('Quote sent', `Your ${mineral} quote is on its way to the buyer.`)
  }

  const ship = (id: string, status: 'shipped' | 'delivered', mineral: string) => {
    setSampleStatus(id, status)
    toast.success(status === 'shipped' ? 'Sample shipped' : 'Sample delivered', `The buyer's ${mineral} sample is now ${status}.`)
  }

  return (
    <div>
      <PageHeader
        title="Buyer requests"
        subtitle="Quotes and sample requests buyers have sent you — respond to keep deals moving."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="RFQs received" value={myRfqs.length} sub="All time" icon={<FileText size={17} />} />
        <StatCard label="Awaiting your quote" value={openRfqs} sub="Pending & negotiating" icon={<Handshake size={17} />} />
        <StatCard label="Sample requests" value={mySamples.length} sub="All time" icon={<TestTube2 size={17} />} />
        <StatCard label="Awaiting fulfilment" value={pendingSamples} sub="Not yet delivered" icon={<Truck size={17} />} />
      </div>

      {/* ---- Incoming RFQs ---- */}
      <h2 className="mb-3 mt-8 text-[15px] font-semibold text-forest">Requests for quote</h2>
      {myRfqs.length === 0 ? (
        <Card>
          <EmptyState
            variant="inbox"
            title="No RFQs yet"
            description="When a buyer requests a quote on one of your listings, it shows up here."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {myRfqs.map((r) => {
            const open = r.status === 'pending' || r.status === 'negotiation'
            return (
              <Card
                key={r.id}
                id={`req-${r.id}`}
                className={cn(
                  'flex flex-col transition-shadow duration-500',
                  highlight === r.id && 'ring-2 ring-lime-500 ring-offset-2',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <MineralIcon mineral={r.mineral} size="lg" />
                    <div>
                      <p className="font-semibold capitalize text-forest">{r.mineral}</p>
                      <p className="text-xs text-forest-400">{r.createdAt}</p>
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>

                <div className="my-4 grid grid-cols-2 gap-4 rounded-2xl bg-panel/50 p-4">
                  <KeyValue label="Buyer" value={r.buyer} className="col-span-2" />
                  <KeyValue label="Quantity" value={`${r.quantity} ${r.unit}`} />
                  <KeyValue label="Timeline" value={r.timeline} />
                  <KeyValue label="Incoterms" value={<span className="uppercase">{r.incoterms}</span>} />
                  <KeyValue label="Payment" value={<span className="capitalize">{r.paymentTerms.replace(/_/g, ' ')}</span>} />
                </div>

                <div className="mt-auto border-t border-hair pt-4">
                  {open ? (
                    <div className="flex gap-2">
                      {r.status === 'pending' ? (
                        <>
                          <Button block size="sm" leftIcon={<Send size={15} />} onClick={() => respond(r.id, 'responded', r.mineral)}>
                            Send quote
                          </Button>
                          <Button block size="sm" variant="secondary" leftIcon={<Handshake size={15} />} onClick={() => setNegotiatingId(r.id)}>
                            Negotiate
                          </Button>
                        </>
                      ) : (
                        <Button block size="sm" leftIcon={<MessageSquare size={15} />} onClick={() => setNegotiatingId(r.id)}>
                          Open negotiation{r.messages?.length ? ` (${r.messages.length})` : ''}
                        </Button>
                      )}
                      <Button block size="sm" variant="danger" leftIcon={<X size={15} />} onClick={() => respond(r.id, 'closed', r.mineral)}>
                        Decline
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-forest-400">
                      {r.status === 'responded' ? 'Quote sent · awaiting buyer' : 'RFQ closed'}
                    </p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* ---- Incoming sample requests ---- */}
      <h2 className="mb-3 mt-8 text-[15px] font-semibold text-forest">Sample requests</h2>
      {mySamples.length === 0 ? (
        <Card>
          <EmptyState
            variant="inbox"
            title="No sample requests yet"
            description="Buyers can request physical samples from your listings before they buy."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {mySamples.map((s) => (
            <Card
              key={s.id}
              id={`req-${s.id}`}
              className={cn(
                'flex flex-col transition-shadow duration-500',
                highlight === s.id && 'ring-2 ring-lime-500 ring-offset-2',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MineralIcon mineral={s.mineral} size="lg" />
                  <div>
                    <p className="font-semibold capitalize text-forest">{s.mineral}</p>
                    <p className="text-xs text-forest-400">{s.quantity} {s.unit} · requested {s.createdAt}</p>
                  </div>
                </div>
                <StatusPill status={s.status} />
              </div>

              <div className="my-4 grid grid-cols-2 gap-4 rounded-2xl bg-panel/50 p-4">
                <KeyValue label="Buyer" value={s.buyer} />
                <KeyValue label="Courier" value={s.courier} />
              </div>

              <div className="mt-auto border-t border-hair pt-4">
                {s.status === 'pending' && (
                  <Button block size="sm" leftIcon={<Truck size={15} />} onClick={() => ship(s.id, 'shipped', s.mineral)}>
                    Mark shipped
                  </Button>
                )}
                {s.status === 'shipped' && (
                  <Button block size="sm" variant="lime" leftIcon={<Check size={15} />} onClick={() => ship(s.id, 'delivered', s.mineral)}>
                    Mark delivered
                  </Button>
                )}
                {s.status === 'delivered' && (
                  <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-teal">
                    <Check size={15} /> Delivered to buyer
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Badge tone="info">Live</Badge>
        <span className="ml-2 text-xs text-forest-400">
          Responses update the buyer's RFQ and sample views in real time.
        </span>
      </div>

      <NegotiationDrawer
        open={!!negotiatingId}
        onClose={() => setNegotiatingId(null)}
        rfqId={negotiatingId}
        me="seller"
      />
    </div>
  )
}
