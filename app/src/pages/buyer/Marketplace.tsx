import { useState, type ReactNode } from 'react'
import { BadgeCheck, ChevronDown, MapPin, Send, ShieldCheck, ShoppingCart, TestTube2, Truck, type LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  MineralIcon,
  mineralImage,
  SearchInput,
  Select,
} from '@/components/ui'
import { BuyModal, RfqModal, SampleModal } from '@/components/modals'
import { GatedButton, useVerifyGuard } from '@/components/shell/AccountContext'
import { PassportDrawer } from '@/components/PassportDrawer'
import { useStore } from '@/store/AppStore'
import { MARKET_LISTINGS, NIGERIAN_STATES } from '@/data/mock'
import { MINERALS, type MarketListing, type Passport } from '@/data/types'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'

export function BuyerMarketplace() {
  const { passports } = useStore()
  const [query, setQuery] = useState('')
  const [mineral, setMineral] = useState('all')
  const [state, setState] = useState('all')
  const [rfqFor, setRfqFor] = useState<MarketListing | null>(null)
  const [sampleFor, setSampleFor] = useState<MarketListing | null>(null)
  const [buyFor, setBuyFor] = useState<MarketListing | null>(null)
  const [passportFor, setPassportFor] = useState<Passport | null>(null)
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const { requireVerified } = useVerifyGuard()

  const passportOf = (m: MarketListing) =>
    m.passportNumber ? passports.find((p) => p.number === m.passportNumber) : undefined

  const rows = MARKET_LISTINGS.filter((m) => {
    if (mineral !== 'all' && m.mineral !== mineral) return false
    if (state !== 'all' && m.state !== state) return false
    if (query && !`${m.mineral} ${m.sellerName}`.toLowerCase().includes(query.toLowerCase()))
      return false
    return true
  })

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle="Every listing is verified and carries a blockchain Digital Passport."
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
          </div>
        </div>
      </Card>

      <p className="mb-3 flex items-center gap-1.5 text-sm text-forest-400">
        <ShieldCheck size={15} className="text-teal" />
        {rows.length} verified listing{rows.length === 1 ? '' : 's'} · every mineral carries a Digital Passport
      </p>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            variant="search"
            title="No listings match your filters"
            description="Try a different mineral or location."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('')
                  setMineral('all')
                  setState('all')
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((m) => {
          const p = passportOf(m)
          const verified = !!p && p.status === 'verified'
          const photo = mineralImage(m.mineral)
          return (
          <Card key={m.id} className="flex flex-col">
            {/* header: name + grade · quantity (left), verified pill (right) */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-xl font-semibold capitalize text-forest">{m.mineral}</h3>
                <p className="mt-0.5 text-sm text-forest-400">
                  Grade {m.grade}% · {m.quantity} {m.unit} available
                </p>
              </div>
              {verified ? (
                <button
                  type="button"
                  onClick={() => setPassportFor(p)}
                  title="View digital passport"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-soft px-3 py-1.5 text-xs font-bold text-teal transition-colors hover:brightness-95"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" /> Verified
                </button>
              ) : (
                <Badge tone="success" dot>Verified</Badge>
              )}
            </div>

            {/* seller */}
            <div className="mt-3 flex items-center gap-1.5 text-[15px]">
              <span className="truncate font-semibold text-forest-500">{m.sellerName}</span>
              {m.sellerVerified && <BadgeCheck size={16} className="shrink-0 text-teal" />}
            </div>

            {/* product photo */}
            <div className="my-5 flex h-48 items-center justify-center">
              {photo ? (
                <img
                  src={photo}
                  alt={m.mineral}
                  loading="lazy"
                  decoding="async"
                  className="max-h-48 w-auto select-none object-contain drop-shadow-[0_18px_30px_rgba(2,40,30,0.18)]"
                />
              ) : (
                <MineralIcon mineral={m.mineral} shape="rounded" size="xl" />
              )}
            </div>

            {/* price */}
            <p className="tnum text-2xl font-semibold text-forest">
              {money(m.priceAmount, m.priceCurrency)}
            </p>

            {/* attributes */}
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-panel px-3 py-1.5 text-xs font-medium capitalize text-forest-500">
                <Truck size={13} /> {m.deliveryMode}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-panel px-3 py-1.5 text-xs font-medium capitalize text-forest-500">
                <MapPin size={13} /> {m.state}
              </span>
              <span className="inline-flex items-center rounded-xl bg-panel px-3 py-1.5 text-xs font-medium capitalize text-forest-500">
                {m.locationType}
              </span>
            </div>

            {/* actions */}
            <div className="mt-5 grid grid-cols-5 gap-2.5 border-t border-hair pt-4">
              <GatedButton
                className="col-span-3"
                leftIcon={<ShoppingCart size={16} />}
                onClick={() => setBuyFor(m)}
                action="buy this mineral"
              >
                Buy now
              </GatedButton>
              <div className="relative col-span-2">
                <Button
                  variant="secondary"
                  block
                  onClick={() => setMenuFor(menuFor === m.id ? null : m.id)}
                  rightIcon={
                    <ChevronDown
                      size={15}
                      className={cn('transition-transform', menuFor === m.id && 'rotate-180')}
                    />
                  }
                >
                  More Actions
                </Button>
                {menuFor === m.id && (
                  <>
                    <button
                      type="button"
                      aria-hidden
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setMenuFor(null)}
                    />
                    <div className="absolute bottom-full right-0 z-20 mb-2 w-52 overflow-hidden rounded-2xl border border-hair bg-white p-1.5 shadow-soft">
                      {verified && (
                        <MenuItem
                          icon={ShieldCheck}
                          onClick={() => {
                            setMenuFor(null)
                            setPassportFor(p)
                          }}
                        >
                          View digital passport
                        </MenuItem>
                      )}
                      <MenuItem
                        icon={TestTube2}
                        onClick={() => {
                          setMenuFor(null)
                          requireVerified(() => setSampleFor(m), 'request a sample')()
                        }}
                      >
                        Request sample
                      </MenuItem>
                      <MenuItem
                        icon={Send}
                        onClick={() => {
                          setMenuFor(null)
                          requireVerified(() => setRfqFor(m), 'send an RFQ')()
                        }}
                      >
                        Send RFQ
                      </MenuItem>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
          )
        })}
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

function MenuItem({
  icon: Icon,
  onClick,
  children,
}: {
  icon: LucideIcon
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-forest-500 transition-colors hover:bg-panel"
    >
      <Icon size={15} className="shrink-0 text-forest-400" />
      {children}
    </button>
  )
}
