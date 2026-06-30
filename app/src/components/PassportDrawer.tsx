import { CheckCircle2, Download, ExternalLink, Hash, Leaf, ShieldCheck } from 'lucide-react'
import {
  Button,
  Drawer,
  KeyValue,
  MineralIcon,
  SectionLabel,
  StatusPill,
  useToast,
} from '@/components/ui'
import { PassportQR } from '@/components/PassportQR'
import { downloadPassportCertificate } from '@/lib/certificate'
import type { Passport } from '@/data/types'

/** In-context summary of a Digital Mineral Passport, with a link to the full public page. */
export function PassportDrawer({
  open,
  onClose,
  passport,
}: {
  open: boolean
  onClose: () => void
  passport: Passport | null
}) {
  const toast = useToast()
  if (!passport) return <Drawer open={open} onClose={onClose} title="" size="lg">{null}</Drawer>

  const verified = passport.status === 'verified'
  const publicUrl = `${window.location.origin}/passport/${passport.number}`
  const stellarHash = passport.txHash?.replace('stellar:', '')
  const gps = `${Math.abs(passport.gps.lat).toFixed(4)}° ${passport.gps.lat >= 0 ? 'N' : 'S'}, ${Math.abs(passport.gps.lng).toFixed(4)}° ${passport.gps.lng >= 0 ? 'E' : 'W'}`

  const copyLink = () => {
    navigator.clipboard?.writeText(publicUrl)
    toast.success('Public link copied', publicUrl)
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={passport.productName}
      subtitle={`${passport.number} · ${passport.seller}`}
      size="lg"
      footer={
        <div className="flex flex-wrap items-center justify-end gap-2">
          {verified && (
            <Button variant="secondary" size="sm" leftIcon={<Download size={15} />} onClick={() => downloadPassportCertificate(passport)}>
              Certificate
            </Button>
          )}
          {verified && (
            <Button variant="secondary" size="sm" onClick={copyLink}>
              Copy link
            </Button>
          )}
          <Button size="sm" leftIcon={<ExternalLink size={15} />} onClick={() => window.open(`/passport/${passport.number}`, '_blank')}>
            Open full passport
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
          <MineralIcon mineral={passport.mineral} size="xl" />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold capitalize text-forest">{passport.productName}</p>
            <p className="text-sm text-forest-400">
              {passport.gradeLabel} · {passport.quantity} {passport.unit === 'ton' ? 'MT' : passport.unit}
            </p>
          </div>
          <StatusPill status={passport.status} />
        </div>

        <div>
          <SectionLabel>Provenance</SectionLabel>
          <dl className="grid grid-cols-2 gap-4">
            <KeyValue label="Producer" value={passport.seller} />
            <KeyValue label="Mining method" value={passport.miningMethod ?? '—'} />
            <KeyValue label="Mine site" value={passport.siteName} className="col-span-2" />
            <KeyValue label="Region" value={`${passport.region}, ${passport.country}`} />
            <KeyValue label="GPS" value={<span className="font-mono text-xs">{gps}</span>} />
            <KeyValue label="Batch" value={<span className="font-mono">{passport.batchId ?? '—'}</span>} />
          </dl>
        </div>

        {passport.esg && (
          <div>
            <SectionLabel>ESG &amp; sustainability · {passport.esg.overall}%</SectionLabel>
            <div className="space-y-2">
              {(
                [
                  ['Environmental', passport.esg.environmental],
                  ['Social', passport.esg.social],
                  ['Governance', passport.esg.governance],
                  ['Supply chain', passport.esg.supplyChain],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-forest-500">
                    <CheckCircle2 size={14} className="text-teal" /> {label}
                  </span>
                  <span className="tnum font-semibold text-forest">{value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {passport.composition && passport.composition.length > 0 && (
          <div>
            <SectionLabel>Lab composition</SectionLabel>
            <div className="space-y-2.5">
              {passport.composition.map((c) => (
                <div key={c.formula}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-forest-500">
                      <span className="font-semibold text-forest">{c.formula}</span> · {c.label}
                    </span>
                    <span className="tnum font-semibold text-forest">{c.value.toFixed(2)}%</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-panel">
                    <div className="h-full rounded-full bg-teal" style={{ width: `${Math.min(100, c.value)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-2 rounded-2xl border border-hair p-4">
          <div className="rounded-xl border border-hair bg-white p-2.5">
            <PassportQR value={publicUrl} size={150} />
          </div>
          <p className="text-xs text-forest-400">Scan to view the public passport</p>
        </div>

        {verified && passport.txHash ? (
          <div className="rounded-2xl border border-teal/30 bg-teal-soft/40 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-teal">
              <ShieldCheck size={16} /> Anchored on {passport.chain}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 break-all font-mono text-[11px] text-forest-400">
              <Hash size={12} className="shrink-0" /> {passport.txHash}
            </p>
            {stellarHash && (
              <a
                href={`https://stellar.expert/explorer/public/tx/${stellarHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"
              >
                <ExternalLink size={12} /> Verify on Stellar · anchored {passport.anchoredAt}
              </a>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border border-orange/30 bg-orange-soft/40 p-3.5 text-sm text-orange-600">
            <Leaf size={15} /> Verification in progress — not yet anchored on-chain.
          </div>
        )}
      </div>
    </Drawer>
  )
}
