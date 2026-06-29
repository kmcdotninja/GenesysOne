import { useState } from 'react'
import { Check, Plus, Truck } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Button,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  KeyValue,
  MineralIcon,
  StatusPill,
  type Column,
} from '@/components/ui'
import { SampleModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import type { SampleRequest, SampleStatus } from '@/data/types'
import { cn } from '@/lib/cn'
import { useFocusHighlight } from '@/lib/useFocusHighlight'

const STEPS: { key: SampleStatus; label: string }[] = [
  { key: 'pending', label: 'Requested' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
]

function Tracker({ status }: { status: SampleStatus }) {
  const current = STEPS.findIndex((s) => s.key === status)
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i <= current
        const isLast = i === STEPS.length - 1
        return (
          <div key={s.key} className={cn('flex items-center', !isLast && 'flex-1')}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-colors',
                  done ? 'bg-forest text-lime' : 'bg-panel text-forest-300',
                )}
              >
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('text-[11px] font-medium', done ? 'text-forest' : 'text-forest-300')}>
                {s.label}
              </span>
            </div>
            {!isLast && (
              <span
                className={cn(
                  'mx-2 mb-5 h-0.5 flex-1 rounded-full transition-colors',
                  i < current ? 'bg-forest-300' : 'bg-hair',
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function BuyerSamples() {
  const { sampleRequests } = useStore()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<SampleRequest | null>(null)
  const highlight = useFocusHighlight('req')

  const columns: Column<SampleRequest>[] = [
    {
      key: 'mineral',
      header: 'Mineral',
      cell: (s) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={s.mineral} />
          <div>
            <p className="font-semibold capitalize text-forest">{s.mineral}</p>
            <p className="text-xs text-forest-400">{s.seller}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'qty',
      header: 'Quantity',
      align: 'right',
      cell: (s) => (
        <span className="tnum">
          {s.quantity} {s.unit}
        </span>
      ),
    },
    {
      key: 'courier',
      header: 'Courier',
      cell: (s) => (
        <span className="inline-flex items-center gap-1.5 text-forest-500">
          <Truck size={14} /> {s.courier}
        </span>
      ),
    },
    { key: 'requested', header: 'Requested', cell: (s) => <span className="text-forest-400">{s.createdAt}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (s) => <StatusPill status={s.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Sample requests"
        subtitle="Request physical samples from listings and track them to your door."
        actions={
          <Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Request sample
          </Button>
        }
      />

      <Card pad={false} className="p-2 sm:p-3">
        <DataTable
          columns={columns}
          rows={sampleRequests}
          rowKey={(s) => s.id}
          rowId={(s) => `req-${s.id}`}
          rowClassName={(s) => (highlight === s.id ? 'bg-lime-50' : '')}
          onRowClick={setActive}
          empty={
            <EmptyState
              title="No sample requests"
              description="Request a physical sample from a marketplace listing."
              action={
                <Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
                  Request sample
                </Button>
              }
            />
          }
        />
      </Card>

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? <span className="capitalize">{active.mineral} sample</span> : ''}
        subtitle={active ? `From ${active.seller}` : ''}
      >
        {active && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
              <MineralIcon mineral={active.mineral} size="xl" />
              <div className="flex-1">
                <p className="text-lg font-semibold capitalize text-forest">{active.mineral}</p>
                <p className="text-sm text-forest-400">
                  {active.quantity} {active.unit} · {active.seller}
                </p>
              </div>
              <StatusPill status={active.status} />
            </div>

            <div className="rounded-2xl border border-hair p-4">
              <p className="mb-5 text-sm font-semibold text-forest">Shipment progress</p>
              <Tracker status={active.status} />
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <KeyValue
                label="Courier"
                value={
                  <span className="inline-flex items-center gap-1.5">
                    <Truck size={14} /> {active.courier}
                  </span>
                }
              />
              <KeyValue label="Requested" value={active.createdAt} />
            </dl>
          </div>
        )}
      </Drawer>

      <SampleModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
