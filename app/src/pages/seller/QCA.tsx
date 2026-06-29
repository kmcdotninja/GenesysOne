import { useState } from 'react'
import { CheckCircle2, FlaskConical, Inbox, Loader, Send } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Button,
  Card,
  DataTable,
  EmptyState,
  MineralIcon,
  StatCard,
  StatusPill,
  type Column,
} from '@/components/ui'
import { RequestTestingModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import type { TestingRequest } from '@/data/types'

export function SellerQCA() {
  const { testingRequests } = useStore()
  const [open, setOpen] = useState(false)

  const mine = testingRequests.filter((r) => r.requesterRole === 'seller')
  const incoming = mine.filter((r) => r.status === 'incoming').length
  const inProgress = mine.filter((r) => r.status === 'accepted' || r.status === 'in_progress').length
  const completed = mine.filter((r) => r.status === 'completed').length

  const columns: Column<TestingRequest>[] = [
    {
      key: 'mineral',
      header: 'Mineral',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={r.mineral} />
          <div>
            <p className="font-semibold capitalize text-forest">{r.mineral}</p>
            <p className="font-mono text-xs text-forest-400">{r.batchId}</p>
          </div>
        </div>
      ),
    },
    { key: 'grade', header: 'Grade claimed', align: 'right', cell: (r) => <span className="tnum">{r.gradeClaimed}%</span> },
    { key: 'schedule', header: 'Schedule', cell: (r) => <span className="text-forest-500">{r.date} · {r.time}</span> },
    { key: 'location', header: 'Location', cell: (r) => <span className="text-forest-400">{r.lga}, {r.state}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Quality Control & Assurance"
        subtitle="Request accredited labs to sample and certify your mineral batches."
        actions={
          <Button leftIcon={<Send size={16} />} onClick={() => setOpen(true)}>
            Request testing
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total requests" value={mine.length} sub="All time" icon={<FlaskConical size={17} />} />
        <StatCard label="Incoming" value={incoming} sub="Awaiting a lab" icon={<Inbox size={17} />} />
        <StatCard label="In progress" value={inProgress} sub="Accepted & sampling" icon={<Loader size={17} />} />
        <StatCard label="Completed" value={completed} sub="Certified" icon={<CheckCircle2 size={17} />} />
      </div>

      <Card className="mt-5" pad={false}>
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-[15px] font-semibold text-forest">Testing requests</h2>
        </div>
        <div className="p-2 sm:p-3">
          <DataTable
            columns={columns}
            rows={mine}
            rowKey={(r) => r.id}
            empty={
              <EmptyState
                title="No testing requests yet"
                description="Request a lab to sample and certify a batch — results auto-link to your listings."
                action={
                  <Button leftIcon={<Send size={16} />} onClick={() => setOpen(true)}>
                    Request testing
                  </Button>
                }
              />
            }
          />
        </div>
      </Card>

      <RequestTestingModal open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
