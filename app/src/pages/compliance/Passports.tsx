import { useEffect, useState } from 'react'
import {
  BadgeCheck,
  Check,
  ExternalLink,
  Hash,
  MapPin,
  Send,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Button,
  Card,
  DataTable,
  Drawer,
  Field,
  Input,
  KeyValue,
  MineralIcon,
  SectionLabel,
  Select,
  StatusPill,
  Textarea,
  useToast,
  type Column,
} from '@/components/ui'
import { useStore } from '@/store/AppStore'
import type { Passport, PassportStatus } from '@/data/types'
import { useFocusHighlight } from '@/lib/useFocusHighlight'
import { cn } from '@/lib/cn'

const FILTERS: { key: PassportStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_verification', label: 'In verification' },
  { key: 'verified', label: 'Verified' },
  { key: 'rejected', label: 'Rejected' },
]

const captured = (p: Passport) =>
  p.extractedAt != null || (p.custody ?? []).some((c) => /capture|sealed/i.test(c.label))

export function CompliancePassports() {
  const { passports, agents, assignAgent, submitFieldCapture, approvePassport, rejectPassport, vettingQueue, approveMineralVetting } = useStore()
  const pendingVetting = vettingQueue.filter((v) => v.status === 'pending')
  const toast = useToast()
  const highlight = useFocusHighlight('p')
  const [filter, setFilter] = useState<PassportStatus | 'all'>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [agentId, setAgentId] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [photos, setPhotos] = useState('4')
  const [esg, setEsg] = useState({ environmental: '92', social: '90', governance: '91', supplyChain: '93' })
  const [evaluation, setEvaluation] = useState('')
  const [reason, setReason] = useState('')

  const active = passports.find((p) => p.id === activeId) ?? null

  // Open the drawer when arriving from a deep-linked notification.
  useEffect(() => {
    if (highlight && passports.some((p) => p.id === highlight)) setActiveId(highlight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlight])

  // Sync capture form defaults to the opened passport.
  useEffect(() => {
    if (active) {
      setLat(String(active.gps.lat))
      setLng(String(active.gps.lng))
      setAgentId('')
      setReason('')
      setPhotos('4')
      setEvaluation('')
      setEsg({
        environmental: String(active.esg?.environmental ?? 92),
        social: String(active.esg?.social ?? 90),
        governance: String(active.esg?.governance ?? 91),
        supplyChain: String(active.esg?.supplyChain ?? 93),
      })
    }
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const rows = filter === 'all' ? passports : passports.filter((p) => p.status === filter)
  const availableAgents = agents.filter((a) => a.status === 'available')

  const doAssign = () => {
    if (!active || !agentId) return
    assignAgent(active.id, agentId)
    toast.success('Agent assigned', `${active.number} is now in verification.`)
  }
  const doCapture = () => {
    if (!active) return
    const e = Number(esg.environmental) || 0
    const s = Number(esg.social) || 0
    const g = Number(esg.governance) || 0
    const sc = Number(esg.supplyChain) || 0
    submitFieldCapture(active.id, {
      gps: { lat: Number(lat) || active.gps.lat, lng: Number(lng) || active.gps.lng },
      photos: Number(photos) || undefined,
      esg: { environmental: e, social: s, governance: g, supplyChain: sc, overall: Math.round((e + s + g + sc) / 4) },
      evaluation: evaluation.trim() || undefined,
    })
    toast.success('Field capture saved', 'GPS, photos, ESG and sealed sample recorded.')
  }
  const doApprove = () => {
    if (!active) return
    approvePassport(active.id)
    toast.success('Passport verified', `${active.number} anchored on Ethereum — now live.`)
  }
  const doReject = () => {
    if (!active) return
    rejectPassport(active.id, reason.trim() || 'Did not meet verification criteria')
    toast.info('Passport rejected', `${active.number} returned to the producer.`)
  }

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
    {
      key: 'qty',
      header: 'Quantity',
      align: 'right',
      cell: (p) => <span className="tnum">{p.quantity} {p.unit === 'ton' ? 'MT' : p.unit}</span>,
    },
    { key: 'agent', header: 'Agent', cell: (p) => <span className="text-forest-400">{p.agentName ?? '—'}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (p) => <StatusPill status={p.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Digital Mineral Passports"
        subtitle="Assign field agents, run verification, and anchor approved passports on Ethereum."
      />

      {pendingVetting.length > 0 && (
        <Card className="mb-5">
          <SectionLabel hint="Approve to issue a Digital Passport and unlock the seller's listing.">
            Mineral vetting requests
          </SectionLabel>
          <div className="space-y-2.5">
            {pendingVetting.map((v) => (
              <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-hair p-3">
                <MineralIcon mineral={v.mineral} shape="rounded" size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold capitalize text-forest">{v.mineral}</p>
                  <p className="text-xs text-forest-400">
                    {v.company} · {v.quantity} {v.unit} · grade {v.grade}% · {v.state}
                  </p>
                </div>
                <Button
                  size="sm"
                  leftIcon={<ShieldCheck size={15} />}
                  onClick={() => {
                    approveMineralVetting(v.id)
                    toast.success('Mineral vetted', `${v.company}'s ${v.mineral} is approved — Digital Passport issued.`)
                  }}
                >
                  Approve &amp; issue passport
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
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
          rowKey={(p) => p.id}
          rowId={(p) => `p-${p.id}`}
          rowClassName={(p) => (highlight === p.id ? 'bg-lime-50' : '')}
          onRowClick={(p) => setActiveId(p.id)}
          empty={<div className="px-5 py-10 text-center text-sm text-forest-400">No passports in this state.</div>}
        />
      </Card>

      <Drawer
        open={!!active}
        onClose={() => setActiveId(null)}
        title={active ? active.productName : ''}
        subtitle={active ? `${active.number} · ${active.seller}` : ''}
        size="lg"
      >
        {active && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
              <MineralIcon mineral={active.mineral} shape="rounded" size="xl" />
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold capitalize text-forest">{active.productName}</p>
                <p className="text-sm text-forest-400">{active.gradeLabel} · {active.quantity} {active.unit === 'ton' ? 'MT' : active.unit}</p>
              </div>
              <StatusPill status={active.status} />
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <KeyValue label="Producer" value={active.seller} />
              <KeyValue label="Batch" value={<span className="font-mono">{active.batchId ?? '—'}</span>} />
              <KeyValue label="Mine site" value={active.siteName} className="col-span-2" />
              <KeyValue label="Region" value={`${active.region}, ${active.country}`} />
              <KeyValue label="GPS" value={<span className="font-mono text-xs">{active.gps.lat.toFixed(4)}, {active.gps.lng.toFixed(4)}</span>} />
            </dl>

            {/* ---- PENDING: assign an agent ---- */}
            {active.status === 'pending' && (
              <div className="rounded-2xl border border-hair p-4">
                <SectionLabel>Assign a field agent</SectionLabel>
                <Field label="Verification agent" required>
                  <Select value={agentId} onChange={(e) => setAgentId(e.target.value)}>
                    <option value="">Select an available agent…</option>
                    {availableAgents.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} · {a.region}</option>
                    ))}
                  </Select>
                </Field>
                <Button className="mt-4" block leftIcon={<UserCheck size={16} />} onClick={doAssign} disabled={!agentId}>
                  Assign &amp; start verification
                </Button>
              </div>
            )}

            {/* ---- IN VERIFICATION: capture, then decide ---- */}
            {active.status === 'in_verification' && !captured(active) && (
              <div className="rounded-2xl border border-hair p-4">
                <SectionLabel>On-field evaluation · {active.agentName}</SectionLabel>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="GPS latitude" required><Input value={lat} onChange={(e) => setLat(e.target.value)} /></Field>
                  <Field label="GPS longitude" required><Input value={lng} onChange={(e) => setLng(e.target.value)} /></Field>
                  <Field label="Compliance photos" required><Input type="number" value={photos} onChange={(e) => setPhotos(e.target.value)} /></Field>
                </div>

                <p className="mb-2 mt-4 text-[12px] font-bold uppercase tracking-wide text-forest-400">ESG assessment</p>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Environmental"><Input type="number" value={esg.environmental} onChange={(e) => setEsg((v) => ({ ...v, environmental: e.target.value }))} /></Field>
                  <Field label="Social (rights / labour)"><Input type="number" value={esg.social} onChange={(e) => setEsg((v) => ({ ...v, social: e.target.value }))} /></Field>
                  <Field label="Governance"><Input type="number" value={esg.governance} onChange={(e) => setEsg((v) => ({ ...v, governance: e.target.value }))} /></Field>
                  <Field label="Supply chain"><Input type="number" value={esg.supplyChain} onChange={(e) => setEsg((v) => ({ ...v, supplyChain: e.target.value }))} /></Field>
                </div>
                <Field label="Evaluation note" optional className="mt-3">
                  <Textarea rows={2} placeholder="Child-labour-free, ethical sourcing confirmed, site conditions…" value={evaluation} onChange={(e) => setEvaluation(e.target.value)} />
                </Field>

                <p className="mt-3 flex items-center gap-1.5 text-xs text-forest-400">
                  <MapPin size={13} /> Sample will be sealed in a tamper-proof QR bag and sent to the lab.
                </p>
                <Button className="mt-4" block leftIcon={<Send size={16} />} onClick={doCapture}>
                  Submit on-field evaluation
                </Button>
              </div>
            )}

            {active.status === 'in_verification' && captured(active) && (
              <div className="rounded-2xl border border-hair p-4">
                <SectionLabel>Verification decision</SectionLabel>
                <p className="mb-3 flex items-center gap-1.5 text-sm text-teal">
                  <Check size={15} /> Field capture complete{active.testResultId ? ' · lab assay linked' : ' · awaiting lab assay'}.
                </p>
                <Field label="Rejection reason" optional>
                  <Textarea rows={2} placeholder="Only required if rejecting…" value={reason} onChange={(e) => setReason(e.target.value)} />
                </Field>
                <div className="mt-4 flex gap-2">
                  <Button block leftIcon={<ShieldCheck size={16} />} onClick={doApprove}>
                    Approve &amp; anchor
                  </Button>
                  <Button block variant="danger" leftIcon={<X size={16} />} onClick={doReject}>
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {/* ---- VERIFIED ---- */}
            {active.status === 'verified' && (
              <div className="rounded-2xl border border-teal/30 bg-teal-soft/40 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-teal">
                  <BadgeCheck size={17} /> Verified &amp; anchored on {active.chain}
                </p>
                {active.txHash && (
                  <p className="mt-2 flex items-center gap-1.5 break-all font-mono text-[11px] text-forest-400">
                    <Hash size={12} className="shrink-0" /> {active.txHash}
                  </p>
                )}
                <p className="mt-1 text-xs text-forest-400">Anchored {active.anchoredAt}</p>
                <Link
                  to={`/passport/${active.number}`}
                  target="_blank"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-forest px-3.5 py-2 text-[13px] font-semibold text-white"
                >
                  <ExternalLink size={15} /> View public passport
                </Link>
              </div>
            )}

            {/* ---- REJECTED ---- */}
            {active.status === 'rejected' && (
              <div className="rounded-2xl border border-rose-soft bg-rose-soft/40 p-4 text-sm text-rose-ink">
                Rejected · {active.rejectedReason}
              </div>
            )}

            {/* Custody trail */}
            {active.custody && active.custody.length > 0 && (
              <div>
                <SectionLabel>Chain of custody</SectionLabel>
                <ol className="space-y-3">
                  {active.custody.map((c) => (
                    <li key={c.id} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-teal" />
                      <div>
                        <p className="font-medium text-forest">{c.label}</p>
                        <p className="text-xs text-forest-400">{c.actor} · {c.at}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
