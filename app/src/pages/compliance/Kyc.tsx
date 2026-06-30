import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Building2,
  Check,
  Clock,
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
import { ROLE_META } from '@/data/nav'
import type { KycStatus, KycSubmission, Role } from '@/data/types'
import { useFocusHighlight } from '@/lib/useFocusHighlight'
import { cn } from '@/lib/cn'

const FILTERS: { key: KycStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'not_started', label: 'Not started' },
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
const mask = (v: string) => (v ? `•••• ${v.slice(-4)}` : '••••')

/** A reviewable account — every real account (demo + created), with its submission if any. */
interface ReviewRow {
  id: string
  company: string
  contactName: string
  role: Role
  type: KycSubmission['type']
  status: KycStatus
  submission?: KycSubmission
}

function SubmissionReview({
  sub,
  status,
  note,
  setNote,
  approve,
  reject,
  requestInfo,
}: {
  sub: KycSubmission
  status: KycStatus
  note: string
  setNote: (v: string) => void
  approve: () => void
  reject: () => void
  requestInfo: () => void
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-lime">
          <Building2 size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-forest">{sub.company}</p>
          <p className="flex items-center gap-1.5 text-sm text-forest-400">
            <Mail size={13} /> {sub.contactEmail}
          </p>
        </div>
        <StatusPill status={status} />
      </div>

      {sub.requestedInfo && (status === 'info_requested' || status === 'rejected') && (
        <div className="flex items-start gap-2 rounded-2xl border border-orange/30 bg-orange-soft/40 p-3.5 text-sm text-orange-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{sub.requestedInfo}</span>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-4">
        <KeyValue label="Applicant type" value={TYPE_LABEL[sub.type]} />
        <KeyValue label="Contact" value={sub.contactName} />
        <KeyValue label="Location" value={`${sub.lga}, ${sub.state}`} />
        <KeyValue label="Incorporation" value={<span className="capitalize">{sub.incorporationType.replace(/_/g, ' ')}</span>} />
        <KeyValue label="Incorporated" value={sub.incorporationDate} />
        <KeyValue label="TIN" value={<span className="font-mono">{sub.tin ?? '—'}</span>} />
      </dl>

      <div className="rounded-2xl border border-hair p-4">
        <SectionLabel>{sub.license.kind}</SectionLabel>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-forest-500">
            <ScrollText size={15} className="text-forest-300" />
            <span className="font-mono">{sub.license.number}</span>
          </span>
          {sub.license.expiry && <span className="text-forest-400">Expires {sub.license.expiry}</span>}
        </div>
      </div>

      <div>
        <SectionLabel>Documents</SectionLabel>
        <div className="space-y-2">
          {sub.documents.map((d) => (
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
        {sub.directors.length > 0 ? (
          <div className="space-y-2">
            {sub.directors.map((p) => (
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
        ) : (
          <p className="text-sm text-forest-400">No directors listed.</p>
        )}
      </div>

      {status !== 'verified' && status !== 'rejected' && (
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

      {status === 'verified' && (
        <div className="flex items-center gap-2 rounded-2xl border border-teal/30 bg-teal-soft/40 p-4 text-sm font-semibold text-teal">
          <Check size={17} /> Verified{sub.reviewedAt ? ` on ${sub.reviewedAt}` : ''} — cleared to transact.
        </div>
      )}
    </div>
  )
}

function NotStartedReview({ row }: { row: ReviewRow }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-panel text-forest-400">
          <Building2 size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold text-forest">{row.company}</p>
          <p className="text-sm text-forest-400">{TYPE_LABEL[row.type]}</p>
        </div>
        <StatusPill status="not_started" />
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hair bg-panel/40 px-6 py-12 text-center">
        <Clock size={26} className="text-forest-300" />
        <div>
          <p className="text-sm font-semibold text-forest">Hasn't started KYC</p>
          <p className="mt-1 text-[13px] text-forest-400">
            {row.company} hasn't submitted any verification details yet — nothing to review until they do.
          </p>
        </div>
      </div>
    </div>
  )
}

export function ComplianceKyc() {
  const { kyc, accounts, kycSubmissions, approveKyc, rejectKyc, requestKycInfo } = useStore()
  const toast = useToast()
  const highlight = useFocusHighlight('kyc')
  const [filter, setFilter] = useState<KycStatus | 'all'>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [note, setNote] = useState('')

  // Every real account — the demo seller/buyer/lab and any created accounts —
  // appears here with its live status, including ones that haven't started KYC.
  const reviewRows = useMemo<ReviewRow[]>(() => {
    const demoRoles: Role[] = ['seller', 'buyer', 'lab']
    const demo: ReviewRow[] = demoRoles.map((r) => {
      const submission = kycSubmissions.find((k) => !k.accountId && k.company === ROLE_META[r].company && k.role === r)
      return {
        id: submission?.id ?? `demo-${r}`,
        company: ROLE_META[r].company,
        contactName: submission?.contactName ?? '—',
        role: r,
        type: r === 'buyer' ? 'buyer' : r === 'lab' ? 'lab' : 'miner',
        status: submission?.status ?? kyc[r],
        submission,
      }
    })
    const created: ReviewRow[] = accounts.map((a) => {
      const submission = kycSubmissions.find((k) => k.accountId === a.id)
      return {
        id: submission?.id ?? `acct-${a.id}`,
        company: a.company,
        contactName: a.contactName,
        role: a.role,
        type: a.role === 'buyer' ? 'buyer' : 'miner',
        status: submission?.status ?? a.kyc,
        submission,
      }
    })
    return [...demo, ...created]
  }, [kyc, accounts, kycSubmissions])

  const active = reviewRows.find((r) => r.id === activeId) ?? null

  useEffect(() => {
    if (highlight && reviewRows.some((r) => r.id === highlight)) setActiveId(highlight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight])

  useEffect(() => {
    setNote('')
  }, [activeId])

  const pending = reviewRows.filter((r) => r.status === 'submitted' || r.status === 'under_review').length
  const notStarted = reviewRows.filter((r) => r.status === 'not_started').length
  const verifiedCount = reviewRows.filter((r) => r.status === 'verified').length

  const rows = filter === 'all' ? reviewRows : reviewRows.filter((r) => r.status === filter)

  const approve = () => {
    if (!active?.submission) return
    approveKyc(active.submission.id)
    toast.success('KYC approved', `${active.company} is now verified.`)
  }
  const reject = () => {
    if (!active?.submission) return
    rejectKyc(active.submission.id, note.trim() || 'Did not meet verification requirements')
    toast.info('KYC rejected', `${active.company} was notified.`)
  }
  const requestInfo = () => {
    if (!active?.submission) return
    if (!note.trim()) {
      toast.error('Add a note', 'Describe what additional information is required.')
      return
    }
    requestKycInfo(active.submission.id, note.trim())
    toast.success('Information requested', `${active.company} was asked to provide more.`)
  }

  const columns: Column<ReviewRow>[] = [
    {
      key: 'company',
      header: 'Account',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel text-forest-500">
            <Building2 size={16} />
          </span>
          <div>
            <p className="font-semibold text-forest">{r.company}</p>
            <p className="text-xs text-forest-400">{r.contactName}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', header: 'Type', cell: (r) => <Badge tone="neutral">{TYPE_LABEL[r.type]}</Badge> },
    { key: 'loc', header: 'Location', cell: (r) => <span className="text-forest-400">{r.submission ? `${r.submission.lga}, ${r.submission.state}` : '—'}</span> },
    { key: 'docs', header: 'Docs', align: 'right', cell: (r) => <span className="tnum text-forest-400">{r.submission ? r.submission.documents.length : '—'}</span> },
    { key: 'submitted', header: 'Submitted', align: 'right', cell: (r) => <span className="text-forest-400">{r.submission?.submittedAt ?? '—'}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="KYC / KYB reviews"
        subtitle="Every seller, buyer and lab account shows here with its live verification status."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total accounts" value={reviewRows.length} sub="Seller, buyer, lab & more" icon={<FileText size={17} />} />
        <StatCard label="Awaiting review" value={pending} sub="Submitted & in review" icon={<ShieldCheck size={17} />} />
        <StatCard label="Not started" value={notStarted} sub="No KYC submitted yet" icon={<Clock size={17} />} />
        <StatCard label="Verified" value={verifiedCount} sub="Cleared to trade" icon={<Check size={17} />} />
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
          rowKey={(r) => r.id}
          rowId={(r) => `kyc-${r.id}`}
          rowClassName={(r) => (highlight === r.id ? 'bg-lime-50' : '')}
          onRowClick={(r) => setActiveId(r.id)}
          empty={<div className="px-5 py-10 text-center text-sm text-forest-400">No accounts in this state.</div>}
        />
      </Card>

      <Drawer
        open={!!active}
        onClose={() => setActiveId(null)}
        title={active ? active.company : ''}
        subtitle={
          active
            ? active.submission
              ? `${TYPE_LABEL[active.type]} · submitted ${active.submission.submittedAt}`
              : `${TYPE_LABEL[active.type]} · not started`
            : ''
        }
        size="lg"
      >
        {active && active.submission && (
          <SubmissionReview
            sub={active.submission}
            status={active.status}
            note={note}
            setNote={setNote}
            approve={approve}
            reject={reject}
            requestInfo={requestInfo}
          />
        )}
        {active && !active.submission && <NotStartedReview row={active} />}
      </Drawer>
    </div>
  )
}
