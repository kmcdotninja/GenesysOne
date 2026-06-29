import { AlertCircle, CheckCircle2, Clock, FileCheck2, Upload } from 'lucide-react'
import { Avatar, Badge, Button, KeyValue, StatusPill, faceUrl } from '@/components/ui'
import { DIRECTORS } from '@/data/mock'
import { ROLE_META } from '@/data/nav'
import type { Role } from '@/data/types'

interface RequestedItem {
  label: string
  hint: string
  action: string
}

const REQUESTED: Record<Role, RequestedItem[]> = {
  seller: [],
  buyer: [],
  lab: [
    {
      label: 'Updated ISO/IEC 17025 accreditation',
      hint: 'Your certificate on file expires in 30 days.',
      action: 'Upload',
    },
    {
      label: 'BVN verification — Ngozi Eze',
      hint: 'Required to complete personnel verification.',
      action: 'Provide',
    },
  ],
}

function StatusBanner({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-teal-soft/70 p-4">
        <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-teal" />
        <div>
          <p className="text-sm font-semibold text-forest">Verified</p>
          <p className="text-[13px] text-forest-500">
            Your business is fully verified — all trading features are unlocked.
          </p>
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
          <p className="text-[13px] text-forest-500">
            A reviewer needs more information before your KYC can be approved.
          </p>
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
          Submitted on 12 Apr 2024 · reviews typically complete within 1–2 business days.
        </p>
      </div>
    </div>
  )
}

export function KycStatus({ role, onEdit }: { role: Role; onEdit: () => void }) {
  const meta = ROLE_META[role]
  const isLab = role === 'lab'
  const requested = REQUESTED[role]

  return (
    <div className="space-y-6">
      <StatusBanner status={meta.kyc} />

      {/* Reviewer requests */}
      {requested.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h4 className="text-sm font-bold uppercase tracking-[0.06em] text-forest-400">
              Requested by reviewer
            </h4>
            <Badge tone="warning">{requested.length}</Badge>
          </div>
          <div className="space-y-2.5">
            {requested.map((r) => (
              <div
                key={r.label}
                className="flex items-center gap-3 rounded-2xl border border-orange/30 bg-orange-soft/40 p-3.5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-card">
                  <Upload size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-forest">{r.label}</p>
                  <p className="text-xs text-forest-500">{r.hint}</p>
                </div>
                <Button size="sm" variant="secondary" onClick={onEdit}>
                  {r.action}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submitted details */}
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.06em] text-forest-400">
          Submitted details
        </h4>
        <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-hair p-4">
          <KeyValue label={isLab ? 'Lab name' : 'Company name'} value={meta.company} />
          <KeyValue label="Incorporation" value="Registered company" />
          <KeyValue label="Reg. date" value="12 Apr 2019" />
          <KeyValue label="Location" value="Plateau · Barkin Ladi" />
          <KeyValue label="TIN" value="0123•••• 0001" />
          <KeyValue label="Country" value="Nigeria" />
        </dl>
        {isLab && (
          <div className="mt-3 flex items-center gap-2.5 rounded-2xl bg-teal-soft/60 px-3.5 py-3 text-sm text-teal">
            <FileCheck2 size={17} />
            <span className="font-medium">3 accreditation documents on file</span>
          </div>
        )}
      </div>

      {/* People */}
      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-[0.06em] text-forest-400">
          {isLab ? 'Authorized personnel' : 'Directors'}
        </h4>
        <div className="space-y-2.5">
          {DIRECTORS.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-2xl border border-hair p-3">
              <Avatar name={d.name} src={faceUrl(d.id)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-forest">{d.name}</p>
                <p className="text-xs text-forest-400">
                  NIN {d.nin.slice(0, 3)}•••• · {d.role}
                </p>
              </div>
              <StatusPill status={d.verification === 'verified' ? 'verified' : 'pending'} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
