import { useState } from 'react'
import { Calendar, Check, MapPin, Phone, Truck, User, X } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  ButtonLink,
  Button,
  Card,
  EmptyState,
  KeyValue,
  MineralIcon,
  StatusPill,
  useToast,
} from '@/components/ui'
import { useStore } from '@/store/AppStore'
import type { TestingStatus } from '@/data/types'
import { cn } from '@/lib/cn'
import { useFocusHighlight } from '@/lib/useFocusHighlight'

const FILTERS: { key: TestingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'incoming', label: 'Incoming' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
]

export function LabRequests() {
  const { testingRequests, setTestingStatus } = useStore()
  const toast = useToast()
  const [filter, setFilter] = useState<TestingStatus | 'all'>('all')
  const highlight = useFocusHighlight('req')

  const rows = testingRequests.filter((r) => filter === 'all' || r.status === filter)

  const accept = (id: string, batch: string) => {
    setTestingStatus(id, 'accepted')
    toast.success('Request accepted', `${batch} is locked to your lab.`)
  }
  const reject = (id: string, batch: string) => {
    setTestingStatus(id, 'rejected')
    toast.info('Request rejected', `${batch} was returned to the requester.`)
  }

  return (
    <div>
      <PageHeader
        title="Testing requests"
        subtitle="Review incoming batches from buyers and sellers, then accept to begin testing."
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
                : 'border border-hair bg-white text-forest-500 hover:bg-panel',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            variant="inbox"
            title={filter === 'all' ? 'No testing requests' : `No ${filter.replace('_', ' ')} requests`}
            description="Requests raised by sellers and buyers will appear here."
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {rows.map((r) => (
            <Card
              key={r.id}
              id={`req-${r.id}`}
              className={cn('flex flex-col transition-shadow duration-500', highlight === r.id && 'ring-2 ring-lime-500 ring-offset-2')}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <MineralIcon mineral={r.mineral} size="lg" />
                  <div>
                    <p className="font-semibold capitalize text-forest">{r.mineral}</p>
                    <p className="font-mono text-xs text-forest-400">{r.batchId}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusPill status={r.status} />
                  <Badge tone="neutral" className="capitalize">from {r.requesterRole}</Badge>
                </div>
              </div>

              <div className="my-4 grid grid-cols-2 gap-4 rounded-2xl bg-panel/50 p-4">
                <KeyValue label="Grade claimed" value={`${r.gradeClaimed}%`} />
                <KeyValue label="Quantity" value={r.quantity ? `${r.quantity} ${r.unit}` : '—'} />
                <KeyValue label="Requester" value={r.requester} className="col-span-2" />
              </div>

              <div className="space-y-2 text-sm text-forest-500">
                <p className="flex items-center gap-2">
                  <Calendar size={15} className="text-forest-300" />
                  {r.date} · {r.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-forest-300" />
                  {r.lga}, {r.state} · {r.address}
                </p>
                <p className="flex items-center gap-2">
                  <User size={15} className="text-forest-300" />
                  {r.contactName}
                  <Phone size={14} className="ml-1 text-forest-300" />
                  <span className="text-forest-400">{r.contactPhone}</span>
                </p>
                <p className="flex items-center gap-2 capitalize">
                  <Truck size={15} className="text-forest-300" />
                  {r.deliveryMode.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="mt-5 border-t border-hair pt-4">
                {r.status === 'incoming' && (
                  <div className="flex gap-2">
                    <Button block leftIcon={<Check size={16} />} onClick={() => accept(r.id, r.batchId)}>
                      Accept
                    </Button>
                    <Button block variant="danger" leftIcon={<X size={16} />} onClick={() => reject(r.id, r.batchId)}>
                      Reject
                    </Button>
                  </div>
                )}
                {(r.status === 'accepted' || r.status === 'in_progress') && (
                  <ButtonLink to="/lab/conduct" variant="lime" block leftIcon={<Check size={16} />}>
                    Conduct test
                  </ButtonLink>
                )}
                {r.status === 'rejected' && (
                  <p className="text-center text-sm text-forest-300">Request rejected · returned to requester</p>
                )}
                {r.status === 'completed' && (
                  <p className="text-center text-sm font-medium text-teal">Certificate published</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
