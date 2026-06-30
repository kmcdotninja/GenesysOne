import { useState } from 'react'
import { BadgeCheck, ChevronRight, MapPin, Send, ShieldCheck, ShoppingCart, Star, TestTube2, Truck } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  MineralIcon,
  SearchInput,
  Select,
  Sparkline,
  Toggle,
} from '@/components/ui'
import { BuyModal, RfqModal, SampleModal } from '@/components/modals'
import { GatedButton } from '@/components/shell/AccountContext'
import { PassportDrawer } from '@/components/PassportDrawer'
import { useStore } from '@/store/AppStore'
import { MARKET_LISTINGS, NIGERIAN_STATES } from '@/data/mock'
import { MINERALS, type MarketListing, type Passport } from '@/data/types'
import { money } from '@/lib/format'

export function BuyerMarketplace() {
  const { passports } = useStore()
  const [query, setQuery] = useState('')
  const [mineral, setMineral] = useState('all')
  const [state, setState] = useState('all')
  const [certifiedOnly, setCertifiedOnly] = useState(false)
  const [rfqFor, setRfqFor] = useState<MarketListing | null>(null)
  const [sampleFor, setSampleFor] = useState<MarketListing | null>(null)
  const [buyFor, setBuyFor] = useState<MarketListing | null>(null)
  const [passportFor, setPassportFor] = useState<Passport | null>(null)

  const passportOf = (m: MarketListing) =>
    m.passportNumber ? passports.find((p) => p.number === m.passportNumber) : undefined

  const rows = MARKET_LISTINGS.filter((m) => {
    if (mineral !== 'all' && m.mineral !== mineral) return false
    if (state !== 'all' && m.state !== state) return false
    if (certifiedOnly && !m.certified) return false
    if (query && !`${m.mineral} ${m.sellerName}`.toLowerCase().includes(query.toLowerCase()))
      return false
    return true
  })

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle="Discover approved, certified listings from verified sellers."
      />

      {/* Filter bar */}
      <Card pad={false} className="mb-5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            placeholder="Search minerals or sellers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            wrapClassName="flex-1"
          />
          <div className="flex flex-wrap gap-3">
            <Select value={mineral} onChange={(e) => setMineral(e.target.value)} className="h-11 w-40">
              <option value="all">All minerals</option>
              {MINERALS.map((m) => (
                <option key={m} value={m} className="capitalize">
                  {m}
                </option>
              ))}
            </Select>
            <Select value={state} onChange={(e) => setState(e.target.value)} className="h-11 w-40">
              <option value="all">All locations</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <div className="flex items-center rounded-2xl border border-hair px-4">
              <Toggle checked={certifiedOnly} onChange={setCertifiedOnly} label="Certified" />
            </div>
          </div>
        </div>
      </Card>

      <p className="mb-3 text-sm text-forest-400">
        {rows.length} listing{rows.length === 1 ? '' : 's'} available
      </p>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            variant="search"
            title="No listings match your filters"
            description="Try a different mineral, location, or clear the certified filter."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setMineral('all')
                  setState('all')
                  setCertifiedOnly(false)
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((m) => (
          <Card key={m.id} className="flex flex-col">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <MineralIcon mineral={m.mineral} size="lg" />
                <div>
                  <p className="font-semibold capitalize text-forest">{m.mineral}</p>
                  <p className="text-xs text-forest-400">Grade {m.grade}%</p>
                </div>
              </div>
              {(() => {
                const p = passportOf(m)
                if (p && p.status === 'verified') {
                  return (
                    <button
                      type="button"
                      onClick={() => setPassportFor(p)}
                      title="View digital passport"
                      className="group inline-flex items-center gap-1 rounded-full bg-teal-soft px-2.5 py-1 text-xs font-semibold text-teal transition-colors hover:brightness-95"
                    >
                      <ShieldCheck size={13} /> Certified
                      <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )
                }
                return m.certified ? (
                  <Badge tone="success" dot>Certified</Badge>
                ) : (
                  <Badge tone="neutral">Uncertified</Badge>
                )
              })()}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="truncate font-medium text-forest-500">{m.sellerName}</span>
                {m.sellerVerified && <BadgeCheck size={15} className="shrink-0 text-teal" />}
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-forest-400">
                <Star size={12} className="fill-orange text-orange" />
                {m.sellerRating}
              </span>
            </div>

            <div className="my-4 flex items-end justify-between border-y border-hair py-3">
              <div>
                <p className="tnum text-xl font-semibold text-forest">
                  {money(m.priceAmount, m.priceCurrency)}
                </p>
                <p className="text-xs text-forest-400">
                  {m.quantity} {m.unit} available
                </p>
              </div>
              <Sparkline data={m.trend} color="#34b489" />
            </div>

            <div className="mb-4 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-lg bg-panel px-2 py-1 text-xs font-medium capitalize text-forest-400">
                <Truck size={12} /> {m.deliveryMode}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg bg-panel px-2 py-1 text-xs font-medium capitalize text-forest-400">
                <MapPin size={12} /> {m.state}
              </span>
              <span className="inline-flex items-center rounded-lg bg-panel px-2 py-1 text-xs font-medium capitalize text-forest-400">
                {m.locationType}
              </span>
            </div>

            <div className="mt-auto space-y-2">
              <GatedButton block size="sm" leftIcon={<ShoppingCart size={15} />} onClick={() => setBuyFor(m)}>
                Buy now
              </GatedButton>
              <div className="grid grid-cols-2 gap-2">
                <GatedButton variant="secondary" size="sm" leftIcon={<TestTube2 size={15} />} onClick={() => setSampleFor(m)}>
                  Sample
                </GatedButton>
                <GatedButton variant="secondary" size="sm" leftIcon={<Send size={15} />} onClick={() => setRfqFor(m)}>
                  Send RFQ
                </GatedButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
      )}

      <RfqModal
        open={!!rfqFor}
        onClose={() => setRfqFor(null)}
        mineral={rfqFor?.mineral}
        seller={rfqFor?.sellerName}
      />
      <SampleModal
        open={!!sampleFor}
        onClose={() => setSampleFor(null)}
        mineral={sampleFor?.mineral}
        seller={sampleFor?.sellerName}
      />
      <BuyModal open={!!buyFor} onClose={() => setBuyFor(null)} listing={buyFor} />
      <PassportDrawer open={!!passportFor} onClose={() => setPassportFor(null)} passport={passportFor} />
    </div>
  )
}
