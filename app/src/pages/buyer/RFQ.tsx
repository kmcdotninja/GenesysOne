import { useEffect, useState } from 'react'
import { MessageSquare, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Card,
  DataTable,
  EmptyState,
  MineralIcon,
  StatusPill,
  type Column,
} from '@/components/ui'
import { RfqModal } from '@/components/modals'
import { GatedButton, useAccount } from '@/components/shell/AccountContext'
import { NegotiationDrawer } from '@/components/NegotiationDrawer'
import { useStore } from '@/store/AppStore'
import type { RFQ, RFQStatus } from '@/data/types'
import { cn } from '@/lib/cn'
import { useFocusHighlight } from '@/lib/useFocusHighlight'

const FILTERS: { key: RFQStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'responded', label: 'Responded' },
  { key: 'negotiation', label: 'Negotiation' },
  { key: 'closed', label: 'Closed' },
]

export function BuyerRFQ() {
  const { rfqs: allRfqs } = useStore()
  const { verified } = useAccount()
  const rfqs = verified ? allRfqs : []
  const [filter, setFilter] = useState<RFQStatus | 'all'>('all')
  const [open, setOpen] = useState(false)
  const [negotiatingId, setNegotiatingId] = useState<string | null>(null)
  const highlight = useFocusHighlight('req')

  // Opening a deep-linked RFQ jumps straight into its negotiation thread.
  useEffect(() => {
    if (highlight && rfqs.some((r) => r.id === highlight)) setNegotiatingId(highlight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight])

  const rows = filter === 'all' ? rfqs : rfqs.filter((r) => r.status === filter)

  const columns: Column<RFQ>[] = [
    {
      key: 'mineral',
      header: 'Mineral',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={r.mineral} />
          <div>
            <p className="font-semibold capitalize text-forest">{r.mineral}</p>
            <p className="text-xs text-forest-400">{r.createdAt}</p>
          </div>
        </div>
      ),
    },
    { key: 'seller', header: 'Seller', cell: (r) => <span className="text-forest-500">{r.seller}</span> },
    {
      key: 'qty',
      header: 'Quantity',
      align: 'right',
      cell: (r) => (
        <span className="tnum">
          {r.quantity} {r.unit}
        </span>
      ),
    },
    {
      key: 'incoterms',
      header: 'Incoterms',
      cell: (r) => <span className="uppercase text-forest-400">{r.incoterms}</span>,
    },
    {
      key: 'payment',
      header: 'Payment',
      cell: (r) => <span className="capitalize text-forest-400">{r.paymentTerms.replace(/_/g, ' ')}</span>,
    },
    { key: 'timeline', header: 'Timeline', align: 'right', cell: (r) => <span className="text-forest-400">{r.timeline}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
    {
      key: 'chat',
      header: '',
      align: 'right',
      cell: (r) => (
        <span className="inline-flex items-center justify-end gap-1 text-forest-400">
          <MessageSquare size={15} />
          {r.messages?.length ? <span className="tnum text-xs font-semibold">{r.messages.length}</span> : null}
        </span>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Requests for quote"
        subtitle="Send RFQs to sellers and track them through to negotiation."
        actions={
          <GatedButton leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Create RFQ
          </GatedButton>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
              filter === f.key
                ? 'bg-forest text-white'
                : 'border border-hair bg-white text-forest-400 hover:bg-panel',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card pad={false} className="p-2 sm:p-3">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          rowId={(r) => `req-${r.id}`}
          rowClassName={(r) => (highlight === r.id ? 'bg-lime-50' : '')}
          onRowClick={(r) => setNegotiatingId(r.id)}
          empty={
            <EmptyState
              title={filter === 'all' ? 'No RFQs yet' : `No ${filter} RFQs`}
              description="Send a request for quote to a seller to get started."
              action={
                <GatedButton leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
                  Create RFQ
                </GatedButton>
              }
            />
          }
        />
      </Card>

      <RfqModal open={open} onClose={() => setOpen(false)} />

      <NegotiationDrawer
        open={!!negotiatingId}
        onClose={() => setNegotiatingId(null)}
        rfqId={negotiatingId}
        me="buyer"
      />
    </div>
  )
}
