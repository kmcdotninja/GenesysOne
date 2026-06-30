import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Building2,
  Check,
  FileText,
  Mail,
  MessageSquareWarning,
  ScrollText,
  ShieldCheck,
  X,
} from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  Button,
  Card,
  DataTable,
  Drawer,
  Field,
  KeyValue,
  SectionLabel,
  StatCard,
  StatusPill,
  Textarea,
  useToast,
  type Column,
} from '@/components/ui'
import { useStore } from '@/store/AppStore'
import type { KycStatus, KycSubmission } from '@/data/types'
import { useFocusHighlight } from '@/lib/useFocusHighlight'
import { cn } from '@/lib/cn'

const FILTERS: { key: KycStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'submitted', label: 'New' },
  { key: 'under_review', label: 'Under review' },
  { key: 'info_requested', label: 'Info requested' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
]

const TYPE_LABEL: Record<KycSubmission['type'], string> = {
  miner: 'Miner',
  trader: 'Trader',
  buyer: 'Buyer',
  lab: 'Lab',
}

const DOC_TONE = { received: 'neutral', verified: 'success', flagged: 'danger' } as const
const mask = (v: string) => `•••• ${v.slice(-4)}`

export function ComplianceKyc() {
  const { kycSubmissions, approveKyc, rejectKyc, requestKycInfo } = useStore()
  const toast = useToast()
  const highlight = useFocusHighlight('kyc')
  const [filter, setFilter] = useState<KycStatus | 'all'>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const active = kycSubmissions.find((k) => k.id === activeId) ?? null

  useEffect(() => {
    if (highlight && kycSubmissions.some((k) => k.id === highlight)) setActiveId(highlight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight])

  useEffect(() => {
    setNote('')
  }, [activeId])

  const pending = kycSubmissions.filter((k) => k.status === 'submitted' || k.status === 'under_review').length
  const infoReq = kycSubmissions.filter((k) => k.status === 'info_requested').length
  const verified = kycSubmissions.filter((k) => k.status === 'verified').length

  const rows = filter === 'all' ? kycSubmissions : kycSubmissions.filter((k) => k.status === filter)

  const approve = () => {
    if (!active) return
    approveKyc(active.id)
    toast.success('KYC approved', `${active.company} is now verified.`)
  }
  const reject = () => {
    if (!active) return
    rejectKyc(active.id, note.trim() || 'Did not meet verification requirements')
    toast.info('KYC rejected', `${active.company} was notified.`)
  }
  const requestInfo = () => {
    if (!active) return
    if (!note.trim()) {
      toast.error('Add a note', 'Describe what additional information is required.')
      return
    }
    requestKycInfo(active.id, note.trim())
    toast.success('Information requested', `${active.company} was asked to provide more.`)
  }

  const columns: Column<KycSubmission>[] = [
    {
      key: 'company',
      header: 'Applicant',
      cell: (k) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel text-forest-500">
            <Building2 size={16} />
          </span>
          <div>
            <p className="font-semibold text-forest">{k.company}</p>
            <p className="text-xs text-forest-400">{k.contactName}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', cell: (k) => <Badge tone="neutral">{TYPE_LABEL[k.type]}</Badge> },
    { key: 'loc', header: 'Location', cell: (k) => <span className="text-forest-400">{k.lga}, {k.state}</span> },
    { key: 'docs', header: 'Docs', align: 'right', cell: (k) => <span className="tnum text-forest-400">{k.documents.length}</span> },
    { key: 'submitted', header: 'Submitted', align: 'right', cell: (k) => <span className="text-forest-400">{k.submittedAt}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (k) => <StatusPill status={k.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="KYC / KYB reviews"
        subtitle="Every miner, trader, buyer and lab submission lands here for compliance checks before they can transact."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total applicants" value={kycSubmissions.length} sub="All time" icon={<FileText size={17} />} />
        <StatCard label="Awaiting review" value={pending} sub="New & in review" icon={<ShieldCheck size={17} />} />
        <StatCard label="Info requested" value={infoReq} sub="Waiting on applicant" icon={<MessageSquareWarning size={17} />} />
        <StatCard label="Verified" value={verified} sub="Cleared to trade" icon={<Check size={17} />} />
      </div>

      <div className="mb-4 mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
              filter === f.key ? 'bg-forest text-white' : 'border border-hair bg-white text-forest-500 hover:bg-panel',
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
          rowKey={(k) => k.id}
          rowId={(k) => `kyc-${k.id}`}
          rowClassName={(k) => (highlight === k.id ? 'bg-lime-50' : '')}
          onRowClick={(k) => setActiveId(k.id)}
          empty={<div className="px-5 py-10 text-center text-sm text-forest-400">No submissions in this state.</div>}
        />
      </Card>

      <Drawer
        open={!!active}
        onClose={() => setActiveId(null)}
        title={active ? active.company : ''}
        subtitle={active ? `${TYPE_LABEL[active.type]} · submitted ${active.submittedAt}` : ''}
        size="lg"
      >
        {active && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-lime">
                <Building2 size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-forest">{active.company}</p>
                <p className="flex items-center gap-1.5 text-sm text-forest-400">
                  <Mail size={13} /> {active.contactEmail}
                </p>
              </div>
              <StatusPill status={active.status} />
            </div>

            {active.requestedInfo && (active.status === 'info_requested' || active.status === 'rejected') && (
              <div className="flex items-start gap-2 rounded-2xl border border-orange/30 bg-orange-soft/40 p-3.5 text-sm text-orange-600">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{active.requestedInfo}</span>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-4">
              <KeyValue label="Applicant type" value={TYPE_LABEL[active.type]} />
              <KeyValue label="Contact" value={active.contactName} />
              <KeyValue label="Location" value={`${active.lga}, ${active.state}`} />
              <KeyValue label="Incorporation" value={<span className="capitalize">{active.incorporationType.replace(/_/g, ' ')}</span>} />
              <KeyValue label="Incorporated" value={active.incorporationDate} />
              <KeyValue label="TIN" value={<span className="font-mono">{active.tin ?? '—'}</span>} />
            </dl>

            <div className="rounded-2xl border border-hair p-4">
              <SectionLabel>{active.license.kind}</SectionLabel>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-forest-500">
                  <ScrollText size={15} className="text-forest-300" />
                  <span className="font-mono">{active.license.number}</span>
                </span>
                {active.license.expiry && <span className="text-forest-400">Expires {active.license.expiry}</span>}
              </div>
            </div>

            <div>
              <SectionLabel>Documents</SectionLabel>
              <div className="space-y-2">
                {active.documents.map((d) => (
                  <div key={d.name} className="flex items-center justify-between rounded-xl border border-hair px-3.5 py-2.5 text-sm">
                    <span className="flex items-center gap-2 text-forest-500">
                      <FileText size={15} className="text-forest-300" />
                      {d.name}
                    </span>
                    <Badge tone={DOC_TONE[d.status]}>{d.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionLabel>Directors &amp; personnel · NIN / BVN</SectionLabel>
              <div className="space-y-2">
                {active.directors.map((p) => (
                  <div key={p.name} className="flex items-center justify-between rounded-xl bg-panel/50 px-3.5 py-2.5 text-sm">
                    <div>
                      <p className="font-semibold text-forest">{p.name}</p>
                      <p className="text-xs text-forest-400">{p.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-xs text-forest-400">NIN {mask(p.nin)} · BVN {mask(p.bvn)}</p>
                      <StatusPill status={p.verification === 'verified' ? 'verified' : p.verification === 'failed' ? 'failed' : 'pending'} className="mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision */}
            {active.status !== 'verified' && active.status !== 'rejected' && (
              <div className="rounded-2xl border border-hair p-4">
                <SectionLabel>Compliance decision</SectionLabel>
                <Field label="Note to applicant" optional hint="Required when requesting more info or rejecting.">
                  <Textarea rows={2} placeholder="e.g. Upload a proof of address issued in the last 3 months…" value={note} onChange={(e) => setNote(e.target.value)} />
                </Field>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button leftIcon={<ShieldCheck size={16} />} onClick={approve}>Approve</Button>
                  <Button variant="secondary" leftIcon={<MessageSquareWarning size={16} />} onClick={requestInfo}>Request info</Button>
                  <Button variant="danger" leftIcon={<X size={16} />} onClick={reject}>Reject</Button>
                </div>
              </div>
            )}

            {active.status === 'verified' && (
              <div className="flex items-center gap-2 rounded-2xl border border-teal/30 bg-teal-soft/40 p-4 text-sm font-semibold text-teal">
                <Check size={17} /> Verified{active.reviewedAt ? ` on ${active.reviewedAt}` : ''} — cleared to transact.
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
