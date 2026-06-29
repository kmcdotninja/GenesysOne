import { useState } from 'react'
import {
  Calendar,
  Check,
  CheckCircle2,
  FlaskConical,
  Inbox,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  Wallet,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import { useKycDrawer } from '@/components/shell/KycDrawerContext'
import {
  AreaChart,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  DataTable,
  Drawer,
  KeyValue,
  MineralIcon,
  StatCard,
  StatusPill,
  useToast,
  type Column,
} from '@/components/ui'
import { useStore } from '@/store/AppStore'
import { VOLUME_SERIES } from '@/data/mock'
import { compactMoney } from '@/lib/format'
import type { TestingRequest } from '@/data/types'

export function LabDashboard() {
  const { testingRequests, testResults, labWalletNGN, setTestingStatus } = useStore()
  const { openForm } = useKycDrawer()
  const toast = useToast()
  const [active, setActive] = useState<TestingRequest | null>(null)

  const incoming = testingRequests.filter((r) => r.status === 'incoming').length
  const inProgress = testingRequests.filter((r) => r.status === 'in_progress' || r.status === 'accepted').length
  const completed = testResults.filter((r) => r.status === 'completed').length

  const accept = (r: TestingRequest) => {
    setTestingStatus(r.id, 'accepted')
    toast.success('Request accepted', `${r.batchId} is locked to your lab.`)
    setActive(null)
  }
  const reject = (r: TestingRequest) => {
    setTestingStatus(r.id, 'rejected')
    toast.info('Request rejected', `${r.batchId} was returned to the requester.`)
    setActive(null)
  }

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
    { key: 'requester', header: 'Requester', cell: (r) => <span className="text-forest-500">{r.requester}</span> },
    { key: 'grade', header: 'Grade claimed', align: 'right', cell: (r) => <span className="tnum">{r.gradeClaimed}%</span> },
    { key: 'schedule', header: 'Schedule', cell: (r) => <span className="text-forest-400">{r.date} · {r.time}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Welcome, Geneva Assay Labs"
        subtitle="Track your testing pipeline and finish KYC to unlock payouts."
        actions={
          <Button leftIcon={<ShieldCheck size={16} />} onClick={openForm}>
            Resume KYC
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Incoming requests" value={incoming} sub="Awaiting your response" icon={<Inbox size={17} />} />
        <StatCard label="In progress" value={inProgress} sub="Accepted & sampling" icon={<FlaskConical size={17} />} />
        <StatCard label="Completed tests" value={completed} delta="+3" sub="Certificates issued" icon={<CheckCircle2 size={17} />} />
        <StatCard label="Wallet balance" value={compactMoney(labWalletNGN)} sub="From completed tests" icon={<Wallet size={17} />} />
      </div>

      <Card className="mt-5">
        <CardHeader
          title="Testing throughput · last 18 weeks"
          subtitle="Samples assayed per week"
          action={<Badge tone="success" dot>+22%</Badge>}
        />
        <AreaChart data={VOLUME_SERIES} height={170} line="#2f8868" fill="#a6e64d" className="mt-4" />
      </Card>

      <Card className="mt-5" pad={false}>
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-[15px] font-semibold text-forest">Incoming requests</h2>
          <ButtonLink to="/lab/requests" variant="ghost" size="sm">View queue</ButtonLink>
        </div>
        <div className="p-2 sm:p-3">
          <DataTable
            columns={columns}
            rows={testingRequests}
            rowKey={(r) => r.id}
            onRowClick={setActive}
          />
        </div>
      </Card>

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `${active.mineral[0].toUpperCase()}${active.mineral.slice(1)} batch` : ''}
        subtitle={active?.batchId}
        footer={
          active ? (
            active.status === 'incoming' ? (
              <div className="flex gap-2">
                <Button block variant="danger" leftIcon={<X size={16} />} onClick={() => reject(active)}>Reject</Button>
                <Button block leftIcon={<Check size={16} />} onClick={() => accept(active)}>Accept</Button>
              </div>
            ) : active.status === 'accepted' || active.status === 'in_progress' ? (
              <ButtonLink to="/lab/conduct" block leftIcon={<FlaskConical size={16} />}>Conduct test</ButtonLink>
            ) : (
              <p className="text-center text-sm text-forest-400">No actions available</p>
            )
          ) : null
        }
      >
        {active && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
              <MineralIcon mineral={active.mineral} size="xl" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold capitalize text-forest">{active.mineral}</p>
                <p className="text-sm text-forest-400">from {active.requester}</p>
              </div>
              <StatusPill status={active.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <KeyValue label="Grade claimed" value={`${active.gradeClaimed}%`} />
              <KeyValue label="Quantity" value={active.quantity ? `${active.quantity} ${active.unit}` : '—'} />
              <KeyValue label="Delivery" value={active.deliveryMode.replace(/_/g, ' ')} />
              <KeyValue label="Requester role" value={active.requesterRole} />
            </dl>
            <div className="space-y-2.5 rounded-2xl border border-hair p-4 text-sm text-forest-500">
              <p className="flex items-center gap-2"><Calendar size={15} className="text-forest-300" />{active.date} · {active.time}</p>
              <p className="flex items-center gap-2"><MapPin size={15} className="text-forest-300" />{active.lga}, {active.state} · {active.address}</p>
              <p className="flex items-center gap-2"><User size={15} className="text-forest-300" />{active.contactName}<Phone size={14} className="ml-1 text-forest-300" /><span className="text-forest-400">{active.contactPhone}</span></p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
