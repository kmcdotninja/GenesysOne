import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, FlaskConical, MapPin } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import { Button, Card, EmptyState, KeyValue, MineralIcon } from '@/components/ui'
import { ConductResultModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import type { TestingRequest } from '@/data/types'

export function LabConduct() {
  const { testingRequests } = useStore()
  const navigate = useNavigate()
  const [active, setActive] = useState<TestingRequest | null>(null)

  const eligible = testingRequests.filter((r) => r.status === 'accepted' || r.status === 'in_progress')

  return (
    <div>
      <PageHeader
        title="Conduct test & upload results"
        subtitle="Record measured assays and publish signed certificates for accepted batches."
      />

      {eligible.length === 0 ? (
        <Card>
          <EmptyState
            variant="inbox"
            title="No active tests"
            description="Accept a request from the Testing Requests queue to start conducting a test."
            action={<Button onClick={() => navigate('/lab/requests')}>Go to requests</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {eligible.map((r) => (
            <Card key={r.id} className="flex flex-col">
              <div className="flex items-center gap-3">
                <MineralIcon mineral={r.mineral} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold capitalize text-forest">{r.mineral}</p>
                  <p className="font-mono text-xs text-forest-400">{r.batchId}</p>
                </div>
              </div>

              <div className="my-4 grid grid-cols-2 gap-4 rounded-2xl bg-panel/50 p-4">
                <KeyValue label="Requester" value={r.requester} className="col-span-2" />
                <KeyValue label="Grade claimed" value={`${r.gradeClaimed}%`} />
                <KeyValue label="Quantity" value={r.quantity ? `${r.quantity} ${r.unit}` : '—'} />
              </div>

              <div className="space-y-2 text-sm text-forest-500">
                <p className="flex items-center gap-2">
                  <Calendar size={15} className="text-forest-300" />
                  {r.date} · {r.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={15} className="text-forest-300" />
                  {r.lga}, {r.state}
                </p>
              </div>

              <Button className="mt-5" block leftIcon={<FlaskConical size={16} />} onClick={() => setActive(r)}>
                Record results
              </Button>
            </Card>
          ))}
        </div>
      )}

      <ConductResultModal
        key={active?.id ?? 'none'}
        open={!!active}
        onClose={() => setActive(null)}
        request={active}
      />
    </div>
  )
}
