import { BadgeCheck, Users } from 'lucide-react'
import { Avatar, Card, CardHeader, KeyValue, StatusPill } from '@/components/ui'
import { ROLE_META } from '@/data/nav'
import { useAccount } from '@/components/shell/AccountContext'
import { useStore } from '@/store/AppStore'
import type { Role } from '@/data/types'

export function KycSummary({ role }: { role: Role }) {
  const account = useAccount()
  const store = useStore()
  const meta = ROLE_META[role]
  const isLab = role === 'lab'
  const status = account.kyc
  const peopleLabel = isLab ? 'Authorized personnel' : 'Directors'

  // Demo accounts read their real submission from the shared compliance queue.
  const sub = account.isDemo
    ? store.kycSubmissions.find((k) => k.company === meta.company && k.role === role)
    : undefined

  // Nothing submitted yet → empty company profile (no fabricated details/directors).
  if (status === 'not_started' || (account.isDemo && !sub)) {
    return (
      <Card>
        <CardHeader title="Company profile" subtitle="Your business information" action={<StatusPill status={status} />} />
        <dl className="mt-5 grid grid-cols-2 gap-4">
          <KeyValue label={isLab ? 'Lab name' : 'Company name'} value={account.company} />
          <KeyValue label="Status" value={<span className="capitalize">{status.replace(/_/g, ' ')}</span>} />
        </dl>
        <hr className="my-5 border-hair" />
        <p className="mb-3 text-[13px] font-semibold text-forest-400">{peopleLabel}</p>
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-hair bg-panel/40 px-4 py-6 text-center">
          <Users size={20} className="text-forest-300" />
          <p className="text-sm text-forest-400">
            Complete verification to add company details and {isLab ? 'personnel' : 'directors'}.
          </p>
        </div>
      </Card>
    )
  }

  // Created account that has submitted — show the account-level info it provided.
  if (!account.isDemo) {
    return (
      <Card>
        <CardHeader title="Company profile" subtitle="Your business information" action={<StatusPill status={status} />} />
        <dl className="mt-5 grid grid-cols-2 gap-4">
          <KeyValue label="Company name" value={account.company} />
          <KeyValue label="Account type" value={meta.label} />
          <KeyValue label="Contact" value={account.contactName ?? '—'} />
          <KeyValue label="Status" value={<span className="capitalize">{status.replace(/_/g, ' ')}</span>} />
        </dl>
        <hr className="my-5 border-hair" />
        <p className="mb-3 text-[13px] font-semibold text-forest-400">{peopleLabel}</p>
        <p className="rounded-2xl bg-panel/50 px-4 py-3 text-sm text-forest-400">
          Submitted to compliance — under review.
        </p>
      </Card>
    )
  }

  // Demo account with a real submission — show exactly what was submitted.
  return (
    <Card>
      <CardHeader title="Company profile" subtitle="Submitted business information" action={<StatusPill status={status} />} />
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <KeyValue label={isLab ? 'Lab name' : 'Company name'} value={sub!.company} />
        <KeyValue label="Incorporation" value={<span className="capitalize">{sub!.incorporationType.replace(/_/g, ' ')}</span>} />
        <KeyValue label="Reg. date" value={sub!.incorporationDate} />
        <KeyValue label="Location" value={`${sub!.lga}, ${sub!.state}`} />
        <KeyValue label="TIN" value={sub!.tin ?? '—'} />
        <KeyValue label="License" value={sub!.license.number} />
      </dl>

      <hr className="my-5 border-hair" />
      <p className="mb-3 text-[13px] font-semibold text-forest-400">{peopleLabel}</p>
      {sub!.directors.length > 0 ? (
        <div className="space-y-2.5">
          {sub!.directors.map((d) => (
            <div key={d.name} className="flex items-center gap-3">
              <Avatar name={d.name} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest">{d.name}</p>
                <p className="text-xs text-forest-400">{d.role}</p>
              </div>
              {d.verification === 'verified' ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal">
                  <BadgeCheck size={14} /> Verified
                </span>
              ) : (
                <StatusPill status="pending" />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-forest-400">No directors on file.</p>
      )}
    </Card>
  )
}
