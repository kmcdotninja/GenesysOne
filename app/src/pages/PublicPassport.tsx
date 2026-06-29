import { Link, useParams } from 'react-router-dom'
import {
  BadgeCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  Factory,
  FlaskConical,
  Gem,
  Globe,
  Hash,
  Leaf,
  Link2,
  MapPin,
  Pickaxe,
  Recycle,
  ShieldCheck,
  Ship,
  Truck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { Mark } from '@/components/Logo'
import { PassportQR } from '@/components/PassportQR'
import { useStore } from '@/store/AppStore'
import { MINERAL_ELEMENT } from '@/data/mock'
import type { JourneyStage } from '@/data/types'
import { cn } from '@/lib/cn'

const JOURNEY_META: Record<JourneyStage['key'], { label: string; icon: LucideIcon }> = {
  extraction: { label: 'Extraction', icon: Pickaxe },
  processing: { label: 'Processing', icon: Factory },
  transport: { label: 'Transport', icon: Truck },
  export: { label: 'Export', icon: Ship },
}

function gpsLabel(gps: { lat: number; lng: number }) {
  const lat = `${Math.abs(gps.lat).toFixed(4)}° ${gps.lat >= 0 ? 'N' : 'S'}`
  const lng = `${Math.abs(gps.lng).toFixed(4)}° ${gps.lng >= 0 ? 'E' : 'W'}`
  return `${lat}, ${lng}`
}

/* Donut ring for the ESG score */
function ScoreRing({ value }: { value: number }) {
  const r = 52
  const c = 2 * Math.PI * r
  const dash = (value / 100) * c
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#ececea" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#34b489"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tnum text-2xl font-bold text-forest">{value}%</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-forest-400">ESG Score</span>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <p className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-forest-400">
      {Icon && <Icon size={15} className="text-forest-300" />}
      {children}
    </p>
  )
}

const PANEL = 'rounded-3xl border border-hair bg-white p-5 sm:p-6'

export function PublicPassport() {
  const { code } = useParams()
  const { passports } = useStore()
  const passport = passports.find((p) => p.number === code)

  if (!passport) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <ShieldCheck size={40} className="text-forest-300" />
        <h1 className="text-2xl font-semibold text-forest">Passport not found</h1>
        <p className="max-w-sm text-forest-400">
          No Digital Mineral Passport matches <span className="font-mono">{code}</span>. Check the QR code or link and try again.
        </p>
        <Link to="/" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white">
          Go to GenesysOne
        </Link>
      </div>
    )
  }

  const el = MINERAL_ELEMENT[passport.mineral]
  const verified = passport.status === 'verified'
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/passport/${passport.number}`
  const stellarHash = passport.txHash?.replace('stellar:', '')

  const verifyOnChain = () => {
    if (stellarHash) window.open(`https://stellar.expert/explorer/public/tx/${stellarHash}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <header className="mb-7 flex flex-col gap-4 border-b border-hair pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-lime">
              <Mark className="h-6 w-6" />
            </span>
            <div className="leading-tight">
              <p className="text-[15px] font-bold tracking-[-0.01em] text-forest">GENESYS ONE</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-forest-400">Mineral Passport</p>
            </div>
          </div>
          <div className="hidden text-center lg:block">
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-forest">DIGITAL MINERAL PASSPORT</h1>
            <p className="mt-0.5 text-sm text-forest-400">Powered by Blockchain · Verified · Transparent · Traceable</p>
          </div>
          <div
            className={cn(
              'flex items-center gap-2.5 self-start rounded-2xl border px-4 py-2.5 lg:self-auto',
              verified ? 'border-teal/30 bg-teal-soft/50' : 'border-orange/30 bg-orange-soft/50',
            )}
          >
            <ShieldCheck size={20} className={verified ? 'text-teal' : 'text-orange-600'} />
            <div className="leading-tight">
              <p className={cn('text-[13px] font-bold', verified ? 'text-teal' : 'text-orange-600')}>
                {verified ? 'VERIFIED & AUTHENTIC' : 'VERIFICATION IN PROGRESS'}
              </p>
              <p className="text-[11px] text-forest-400">
                {verified ? 'Blockchain Verified' : 'Awaiting compliance approval'}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ---------- Left column ---------- */}
          <div className="space-y-5">
            {/* Dark hero card */}
            <div className="relative overflow-hidden rounded-3xl bg-forest p-6 text-white">
              <div className="pointer-events-none absolute -right-16 -top-10 h-56 w-56 rounded-full bg-lime/30 blur-3xl" />
              <div className="relative">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Passport ID</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="font-mono text-lg font-semibold">{passport.number}</p>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-bold',
                      verified ? 'bg-lime text-forest' : 'bg-white/15 text-white',
                    )}
                  >
                    {verified ? 'ACTIVE' : passport.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="mt-6 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Mineral</p>
                    <p className="mt-1 text-2xl font-semibold leading-tight">{passport.productName}</p>
                  </div>
                  {/* periodic-style element tile */}
                  <div className="flex h-[68px] w-[68px] shrink-0 flex-col justify-between rounded-2xl border border-white/20 bg-white/5 p-2">
                    <span className="text-[10px] font-semibold text-lime">{el.atomic}</span>
                    <span className="text-center text-2xl font-bold leading-none">{el.symbol}</span>
                    <span className="text-center text-[9px] text-white/60">{el.element}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Grade</p>
                    <p className="mt-1 text-lg font-semibold">{passport.gradeLabel}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Quantity</p>
                    <p className="mt-1 text-lg font-semibold">
                      {passport.quantity} {passport.unit === 'ton' ? 'MT' : passport.unit}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Origin</p>
                  <div className="mt-1.5 flex items-start gap-2">
                    <MapPin size={17} className="mt-0.5 shrink-0 text-lime" />
                    <div>
                      <p className="font-semibold">{passport.siteName}</p>
                      <p className="text-sm text-white/60">
                        {passport.region}, {passport.country}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-white/50">{gpsLabel(passport.gps)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mineral summary */}
            <div className={PANEL}>
              <SectionTitle icon={Gem}>Mineral Summary</SectionTitle>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <SummaryItem icon={Gem} label="Mineral Type" value={passport.productName} />
                <SummaryItem icon={Calendar} label="Date Extracted" value={passport.extractedAt ?? '—'} />
                <SummaryItem icon={MapPin} label="Source" value={passport.siteName} />
                <SummaryItem icon={Hash} label="Batch Number" value={passport.batchId ?? '—'} mono />
                <SummaryItem icon={Wrench} label="Mining Method" value={passport.miningMethod ?? '—'} />
                <SummaryItem icon={Clock} label="Last Updated" value={passport.updatedAt} />
              </dl>
            </div>
          </div>

          {/* ---------- Middle column ---------- */}
          <div className="space-y-5">
            {/* Traceability journey */}
            {passport.journey && passport.journey.length > 0 && (
              <div className={PANEL}>
                <SectionTitle icon={Truck}>Traceability Journey</SectionTitle>
                <div className="flex items-start justify-between gap-1">
                  {passport.journey.map((stage, i) => {
                    const meta = JOURNEY_META[stage.key]
                    const Icon = meta.icon
                    return (
                      <div key={stage.key} className="flex flex-1 items-start">
                        <div className="flex flex-1 flex-col items-center text-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-100 text-forest">
                            <Icon size={20} />
                          </span>
                          <p className="mt-2 text-[13px] font-semibold text-forest">{meta.label}</p>
                          <p className="mt-0.5 text-[11px] text-forest-400">{stage.date}</p>
                          <p className="text-[11px] text-forest-300">{stage.location}</p>
                        </div>
                        {i < passport.journey!.length - 1 && (
                          <span className="mt-6 w-4 border-t-2 border-dashed border-hair sm:w-6" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ESG */}
            {passport.esg && (
              <div className={PANEL}>
                <SectionTitle icon={Leaf}>ESG &amp; Sustainability Score</SectionTitle>
                <div className="flex items-center gap-5">
                  <ScoreRing value={passport.esg.overall} />
                  <div className="flex-1 space-y-2.5">
                    <EsgRow label="Environmental Impact" value={passport.esg.environmental} />
                    <EsgRow label="Social Responsibility" value={passport.esg.social} />
                    <EsgRow label="Governance" value={passport.esg.governance} />
                    <EsgRow label="Supply Chain Integrity" value={passport.esg.supplyChain} />
                  </div>
                </div>
              </div>
            )}

            {/* Carbon */}
            {passport.carbonTotal != null && (
              <div className={PANEL}>
                <SectionTitle icon={Leaf}>Carbon Footprint</SectionTitle>
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                      <Leaf size={22} />
                    </span>
                    <div>
                      <p className="tnum text-3xl font-bold text-forest">{passport.carbonTotal}</p>
                      <p className="text-xs text-forest-400">tCO₂e</p>
                    </div>
                  </div>
                  <div className="flex-1 border-l border-hair pl-5 text-sm">
                    <p className="text-forest-400">Total Emissions (Scope 1, 2 &amp; 3)</p>
                    <p className="mt-2 tnum text-lg font-semibold text-forest">{passport.carbonIntensity} tCO₂e / MT</p>
                    <p className="text-xs text-forest-300">Intensity</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---------- Right column ---------- */}
          <div className="space-y-5">
            {/* QR */}
            <div className={cn(PANEL, 'flex flex-col items-center text-center')}>
              <SectionTitle>Scan to View Passport</SectionTitle>
              <div className="rounded-2xl border-2 border-lime-200 p-3">
                <PassportQR value={publicUrl} />
              </div>
              <p className="mt-4 text-sm text-forest-400">
                Scan this QR code to access the full mineral passport and verify authenticity.
              </p>
              <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-forest px-4 py-3 text-[13px] font-semibold text-white">
                <Recycle size={15} className="text-lime" /> REAL-TIME DATA · LIVE UPDATES
              </div>
              {verified && (
                <div className="mt-3 grid w-full grid-cols-2 gap-2">
                  <button
                    onClick={verifyOnChain}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-hair px-3 py-2 text-xs font-semibold text-forest-500 transition-colors hover:bg-panel"
                  >
                    <Link2 size={14} /> Verify on Stellar
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-hair px-3 py-2 text-xs font-semibold text-forest-500 transition-colors hover:bg-panel"
                  >
                    <Download size={14} /> Certificate
                  </button>
                </div>
              )}
            </div>

            {/* Lab results */}
            {passport.composition && passport.composition.length > 0 && (
              <div className={PANEL}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wide text-forest-400">
                    <FlaskConical size={15} className="text-forest-300" /> Lab Test Results
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-soft px-2 py-0.5 text-[10px] font-bold uppercase text-teal">
                    <BadgeCheck size={11} /> Verified
                  </span>
                </div>
                <div className="space-y-3">
                  {passport.composition.map((c) => (
                    <div key={c.formula}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-forest-500">
                          <span className="font-semibold text-forest">{c.formula}</span> · {c.label}
                        </span>
                        <span className="tnum font-semibold text-forest">{c.value.toFixed(2)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel">
                        <div
                          className="h-full rounded-full bg-teal"
                          style={{ width: `${Math.min(100, c.value)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chain of custody */}
        {passport.custody && passport.custody.length > 0 && (
          <div className={cn(PANEL, 'mt-5')}>
            <SectionTitle icon={ShieldCheck}>Chain of Custody · anchored on {passport.chain}</SectionTitle>
            <ol className="relative ml-2 space-y-5 border-l border-hair pl-6">
              {passport.custody.map((c) => (
                <li key={c.id} className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-soft">
                    <span className="h-2 w-2 rounded-full bg-teal" />
                  </span>
                  <p className="text-sm font-semibold text-forest">{c.label}</p>
                  <p className="text-xs text-forest-400">
                    {c.actor} · {c.at}
                  </p>
                  {c.txHash && (
                    <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-forest-300">
                      <Hash size={11} /> {c.txHash.slice(0, 24)}…
                    </p>
                  )}
                </li>
              ))}
            </ol>
            {passport.anchoredAt && (
              <a
                href={stellarHash ? `https://stellar.expert/explorer/public/tx/${stellarHash}` : '#'}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
              >
                <ExternalLink size={14} /> View blockchain record · anchored {passport.anchoredAt}
              </a>
            )}
          </div>
        )}

        {/* Footer trust band */}
        <div className="mt-5 grid gap-6 rounded-3xl bg-forest px-6 py-7 text-white sm:grid-cols-2 lg:grid-cols-5">
          <TrustProp icon={ShieldCheck} title="Blockchain Verified" body="Immutable & tamper-proof record on Stellar" />
          <TrustProp icon={Leaf} title="Responsible Sourcing" body="Ethically sourced with respect for people and planet" />
          <TrustProp icon={Eye} title="Transparent Supply Chain" body="End-to-end visibility from mine to market" />
          <TrustProp icon={Globe} title="ESG Compliant" body="Aligned with global ESG standards" />
          <TrustProp icon={Recycle} title="Sustainable Future" body="Driving a cleaner, more responsible future" />
        </div>

        <p className="mt-6 text-center text-xs text-forest-300">
          No login required · This product is blockchain-certified and tamper-evident · © {new Date().getFullYear()} GenesysOne
        </p>
      </div>
    </div>
  )
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-forest-300" />
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-forest-400">{label}</dt>
        <dd className={cn('truncate text-sm font-medium text-forest', mono && 'font-mono')}>{value}</dd>
      </div>
    </div>
  )
}

function EsgRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 text-sm text-forest-500">
        <CheckCircle2 size={15} className="text-teal" />
        {label}
      </span>
      <span className="tnum text-sm font-semibold text-forest">{value}%</span>
    </div>
  )
}

function TrustProp({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="flex flex-col gap-2">
      <Icon size={22} className="text-lime" />
      <p className="text-[13px] font-bold uppercase tracking-wide">{title}</p>
      <p className="text-xs leading-relaxed text-white/60">{body}</p>
    </div>
  )
}
