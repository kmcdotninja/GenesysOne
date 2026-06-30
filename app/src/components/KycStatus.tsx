import { type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Clock, FileText, MessageSquareWarning, ShieldCheck } from 'lucide-react'
import { Avatar, Badge, Button, KeyValue, StatusPill } from '@/components/ui'
import { ROLE_META } from '@/data/nav'
import { useStore } from '@/store/AppStore'
import type { KycSubmission, Role, UserAccount } from '@/data/types'

const mask = (v: string) => (v ? `•••• ${v.slice(-4)}` : '••••')

const Heading = ({ children }: { children: ReactNode }) => (
  <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.06em] text-forest-400">{children}</h4>
)

const DOC_TONE = { received: 'neutral', verified: 'success', flagged: 'danger' } as const

function StatusBanner({ status, submittedAt }: { status: string; submittedAt?: string }) {
  if (status === 'verified') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-teal-soft/70 p-4">
        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-teal" />
        <div>
          <p className="text-sm font-semibold text-forest">Verified</p>
          <p className="text-[13px] text-forest-500">Your business is fully verified — all features are unlocked.</p>
        </div>
      </div>
    )
  }
  if (status === 'rejected') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-rose-soft/70 p-4">
        <AlertCircle size={20} className="mt-0.5 shrink-0 text-rose-ink" />
        <div>
          <p className="text-sm font-semibold text-forest">Changes requested</p>
          <p className="text-[13px] text-forest-500">A reviewer needs more information before your KYC can be approved.</p>
        </div>
      </div>
    )
  }
  if (status === 'info_requested') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-orange-soft/70 p-4">
        <MessageSquareWarning size={20} className="mt-0.5 shrink-0 text-orange-600" />
        <div>
          <p className="text-sm font-semibold text-forest">Information requested</p>
          <p className="text-[13px] text-forest-500">Compliance asked for more details before they can continue.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-orange-soft/70 p-4">
      <Clock size={20} className="mt-0.5 shrink-0 text-orange-600" />
      <div>
        <p className="text-sm font-semibold text-forest">Under review</p>
        <p className="text-[13px] text-forest-500">
          Submitted {submittedAt ?? 'recently'} · reviews typically complete within 1–2 business days.
        </p>
      </div>
    </div>
  )
}

function NotStarted({ company, onEdit }: { company: string; onEdit: () => void }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-2xl bg-panel/60 p-4">
        <Clock size={20} className="mt-0.5 shrink-0 text-forest-400" />
        <div>
          <p className="text-sm font-semibold text-forest">Not started</p>
          <p className="text-[13px] text-forest-500">You haven't submitted your verification yet.</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-hair bg-panel/40 px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-forest-400 shadow-card">
          <ShieldCheck size={22} />
        </span>
        <div>
          <p className="text-sm font-semibold text-forest">No details submitted yet</p>
          <p className="mt-1 text-[13px] text-forest-400">
            Complete the verification form to submit {company} to compliance for review.
          </p>
        </div>
        <Button leftIcon={<ShieldCheck size={16} />} onClick={onEdit}>Start verification</Button>
      </div>
    </div>
  )
}

function SubmissionView({ sub, status, onEdit }: { sub: KycSubmission; status: string; onEdit: () => void }) {
  return (
    <div className="space-y-6">
      <StatusBanner status={status} submittedAt={sub.submittedAt} />

      {sub.requestedInfo && (status === 'info_requested' || status === 'rejected') && (
        <div className="flex items-start gap-2 rounded-2xl border border-orange/30 bg-orange-soft/40 p-3.5 text-sm text-orange-600">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{sub.requestedInfo}</span>
        </div>
      )}

      <div>
        <Heading>Submitted details</Heading>
        <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-hair p-4">
          <KeyValue label="Company name" value={sub.company} />
          <KeyValue label="Incorporation" value={<span className="capitalize">{sub.incorporationType.replace(/_/g, ' ')}</span>} />
          <KeyValue label="Reg. date" value={sub.incorporationDate} />
          <KeyValue label="Location" value={`${sub.lga}, ${sub.state}`} />
          <KeyValue label="TIN" value={<span className="font-mono">{sub.tin ?? '—'}</span>} />
          <KeyValue label="License" value={sub.license.number} />
        </dl>
      </div>

      <div>
        <Heading>Documents</Heading>
        <div className="space-y-2">
          {sub.documents.map((d) => (
            <div key={d.name} className="flex items-center justify-between rounded-xl border border-hair px-3.5 py-2.5 text-sm">
              <span className="flex items-center gap-2 text-forest-500">
                <FileText size={15} className="text-forest-300" /> {d.name}
              </span>
              <Badge tone={DOC_TONE[d.status]}>{d.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      {sub.directors.length > 0 && (
        <div>
          <Heading>Directors</Heading>
          <div className="space-y-2.5">
            {sub.directors.map((d) => (
              <div key={d.name} className="flex items-center gap-3 rounded-2xl border border-hair p-3">
                <Avatar name={d.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-forest">{d.name}</p>
                  <p className="text-xs text-forest-400">
                    {d.role}
                    {d.nin ? ` · NIN ${mask(d.nin)}` : ''}
                  </p>
                </div>
                <StatusPill status={d.verification === 'verified' ? 'verified' : d.verification === 'failed' ? 'failed' : 'pending'} />
              </div>
            ))}
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <Button variant="secondary" leftIcon={<ShieldCheck size={16} />} onClick={onEdit}>
          Resubmit details
        </Button>
      )}
    </div>
  )
}

export function KycStatus({
  role,
  onEdit,
  status,
  account,
}: {
  role: Role
  onEdit: () => void
  status?: string
  account?: UserAccount
}) {
  const store = useStore()
  const effectiveStatus = status ?? (account ? account.kyc : store.kyc[role])

  // Nothing submitted yet → empty "not started" state (no fabricated data).
  if (effectiveStatus === 'not_started') {
    return <NotStarted company={account?.company ?? ROLE_META[role].company} onEdit={onEdit} />
  }

  // A created account's submission lives in the shared compliance queue, not this
  // world — show the account-level summary it provided.
  if (account) {
    return (
      <div className="space-y-6">
        <StatusBanner status={effectiveStatus} submittedAt={account.createdAt} />
        <div>
          <Heading>Submitted details</Heading>
          <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-hair p-4">
            <KeyValue label="Company name" value={account.company} />
            <KeyValue label="Account type" value={ROLE_META[account.role].label} />
            <KeyValue label="Contact" value={account.contactName} />
            <KeyValue label="Email" value={account.email} />
            <KeyValue label="Country" value={account.country ?? '—'} />
          </dl>
        </div>
        {effectiveStatus !== 'verified' && (
          <p className="rounded-2xl bg-panel/50 px-4 py-3 text-[13px] text-forest-400">
            Your submission is with the compliance team — you'll be notified once it's reviewed.
          </p>
        )}
      </div>
    )
  }

  // Demo account — show the actual submission from the compliance queue.
  const sub = store.kycSubmissions.find((k) => k.company === ROLE_META[role].company && k.role === role)
  if (!sub) return <NotStarted company={ROLE_META[role].company} onEdit={onEdit} />
  return <SubmissionView sub={sub} status={effectiveStatus} onEdit={onEdit} />
}
