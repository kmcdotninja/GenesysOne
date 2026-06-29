import { BadgeCheck, FileCheck2 } from 'lucide-react'
import { Avatar, Card, CardHeader, KeyValue, StatusPill, faceUrl } from '@/components/ui'
import { DIRECTORS } from '@/data/mock'
import { ROLE_META } from '@/data/nav'
import type { Role } from '@/data/types'

export function KycSummary({ role }: { role: Role }) {
  const meta = ROLE_META[role]
  const isLab = role === 'lab'
  return (
    <Card>
      <CardHeader
        title="Company profile"
        subtitle="Verified business information"
        action={<StatusPill status={meta.kyc} />}
      />
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <KeyValue label={isLab ? 'Lab name' : 'Company name'} value={meta.company} />
        <KeyValue label="Incorporation" value="Registered company" />
        <KeyValue label="Reg. date" value="12 Apr 2019" />
        <KeyValue label="Location" value="Plateau · Barkin Ladi" />
        <KeyValue label="TIN" value="0123•••• 0001" />
        <KeyValue label="Country" value="Nigeria" />
      </dl>

      {isLab && (
        <div className="mt-4 flex items-center gap-2.5 rounded-2xl bg-teal-soft/60 px-3.5 py-3 text-sm text-teal">
          <FileCheck2 size={17} />
          <span className="font-medium">3 accreditation documents on file</span>
        </div>
      )}

      <hr className="my-5 border-hair" />
      <p className="mb-3 text-[13px] font-semibold text-forest-400">
        {isLab ? 'Authorized personnel' : 'Directors'}
      </p>
      <div className="space-y-2.5">
        {DIRECTORS.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <Avatar name={d.name} src={faceUrl(d.id)} size="sm" />
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
    </Card>
  )
}
