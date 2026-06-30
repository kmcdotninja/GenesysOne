import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  Clock,
  FileCheck2,
  FlaskConical,
  Link2,
  MapPin,
  ShieldCheck,
  UserCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
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

const PIPELINE: { icon: LucideIcon; title: string; sub: string }[] = [
  { icon: FileCheck2, title: 'Request', sub: 'Seller requests a passport for a product' },
  { icon: UserCheck, title: 'Assign agent', sub: 'Compliance assigns a field agent' },
  { icon: MapPin, title: 'On-field capture', sub: 'GPS · photos · ESG · sealed sample' },
  { icon: FlaskConical, title: 'Lab assay', sub: 'Grade, purity & sign-off' },
  { icon: ShieldCheck, title: 'Approve', sub: 'Compliance verifies the package' },
  { icon: Link2, title: 'Anchored', sub: 'Hash on Ethereum · QR goes live' },
]

export function ComplianceDashboard() {
  const { passports, agents, kycSubmissions } = useStore()
  const navigate = useNavigate()

  const pending = passports.filter((p) => p.status === 'pending')
  const inVerification = passports.filter((p) => p.status === 'in_verification')
  const verified = passports.filter((p) => p.status === 'verified')
  const queue = passports.filter((p) => p.status === 'pending' || p.status === 'in_verification')
  const kycPending = kycSubmissions.filter((k) => k.status === 'submitted' || k.status === 'under_review').length

  const columns: Column<Passport>[] = [
    {
      key: 'product',
      header: 'Product',
      cell: (p) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={p.mineral} shape="rounded" size="lg" />
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
        <StatCard label="KYC to review" value={kycPending} sub="Miners, traders & buyers" icon={<FileCheck2 size={17} />} />
        <StatCard label="Passport requests" value={pending.length} sub="Awaiting an agent" icon={<Clock size={17} />} />
        <StatCard label="In verification" value={inVerification.length} sub="Field & lab checks" icon={<ShieldCheck size={17} />} />
        <StatCard label="Verified passports" value={verified.length} sub="Live & anchored" icon={<CheckCircle2 size={17} />} />
      </div>

      <Card className="mt-5">
        <CardHeader title="How a Digital Mineral Passport is created" subtitle="Every product is verified mine-to-market before it goes live." />
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start">
          {PIPELINE.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.title} className="flex flex-1 items-start gap-3 lg:flex-col lg:items-center lg:text-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-lime-100 text-forest">
                  <Icon size={19} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-forest">
                    <span className="text-forest-300">{i + 1}.</span> {step.title}
                  </p>
                  <p className="text-xs leading-snug text-forest-400">{step.sub}</p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="mt-5">
        <CardHeader
          title="Passports anchored · last 18 weeks"
          subtitle="Digital Mineral Passports verified on Ethereum"
          action={<Badge tone="success" dot>+27%</Badge>}
        />
        <AreaChart
          data={VOLUME_SERIES}
          height={170}
          line="#2f8868"
          fill="#a6e64d"
          className="mt-4"
          labels={VOLUME_SERIES.map((_, i) => `Wk ${i + 1}`)}
          valueFormat={(v) => `${v} passports`}
        />
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
