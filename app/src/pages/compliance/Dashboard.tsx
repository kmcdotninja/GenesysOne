import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock, MapPin, ShieldCheck, Users } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  AreaChart,
  Badge,
  Card,
  CardHeader,
  DataTable,
  MineralIcon,
  StatCard,
  StatusPill,
  type Column,
} from '@/components/ui'
import { useStore } from '@/store/AppStore'
import { VOLUME_SERIES } from '@/data/mock'
import type { Passport } from '@/data/types'

export function ComplianceDashboard() {
  const { passports, miningSites, agents } = useStore()
  const navigate = useNavigate()

  const pending = passports.filter((p) => p.status === 'pending')
  const inVerification = passports.filter((p) => p.status === 'in_verification')
  const verified = passports.filter((p) => p.status === 'verified')
  const queue = passports.filter((p) => p.status === 'pending' || p.status === 'in_verification')

  const columns: Column<Passport>[] = [
    {
      key: 'product',
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={p.mineral} />
          <div>
            <p className="font-semibold capitalize text-forest">{p.productName}</p>
            <p className="font-mono text-xs text-forest-400">{p.number}</p>
          </div>
        </div>
      ),
    },
    { key: 'seller', header: 'Producer', cell: (p) => <span className="text-forest-500">{p.seller}</span> },
    { key: 'site', header: 'Site', cell: (p) => <span className="text-forest-400">{p.siteName}</span> },
    { key: 'agent', header: 'Agent', cell: (p) => <span className="text-forest-400">{p.agentName ?? '—'}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (p) => <StatusPill status={p.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Welcome, GenesysOne Compliance"
        subtitle="Verify mine sites, anchor passports on-chain, and keep the trust layer current."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending requests" value={pending.length} sub="Awaiting an agent" icon={<Clock size={17} />} />
        <StatCard label="In verification" value={inVerification.length} sub="Field & lab checks" icon={<ShieldCheck size={17} />} />
        <StatCard label="Verified passports" value={verified.length} sub="Live & anchored" icon={<CheckCircle2 size={17} />} />
        <StatCard label="Registered sites" value={miningSites.length} sub={`${agents.length} field agents`} icon={<MapPin size={17} />} />
      </div>

      <Card className="mt-5">
        <CardHeader
          title="Passports anchored · last 18 weeks"
          subtitle="Digital Mineral Passports verified on Stellar"
          action={<Badge tone="success" dot>+27%</Badge>}
        />
        <AreaChart data={VOLUME_SERIES} height={170} line="#2f8868" fill="#a6e64d" className="mt-4" />
      </Card>

      <Card className="mt-5" pad={false}>
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-[15px] font-semibold text-forest">Verification queue</h2>
          <span className="flex items-center gap-1.5 text-xs text-forest-400">
            <Users size={14} /> {agents.filter((a) => a.status === 'available').length} agents available
          </span>
        </div>
        <div className="p-2 sm:p-3">
          <DataTable
            columns={columns}
            rows={queue}
            rowKey={(p) => p.id}
            onRowClick={(p) => navigate(`/compliance/passports?focus=${p.id}`)}
            empty={<div className="px-5 py-10 text-center text-sm text-forest-400">Queue is clear — every passport is verified.</div>}
          />
        </div>
      </Card>
    </div>
  )
}
