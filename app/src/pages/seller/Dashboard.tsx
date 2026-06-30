import { Link } from 'react-router-dom'
import { ArrowUpRight, Boxes, Plus, ShieldCheck, Store, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import { KycSummary } from '@/components/KycSummary'
import {
  AreaChart,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  MineralIcon,
  StatCard,
  StatusPill,
} from '@/components/ui'
import { useAccount } from '@/components/shell/AccountContext'
import { useKycDrawer } from '@/components/shell/KycDrawerContext'
import { PRICE_SERIES, SELLER_CO } from '@/data/mock'
import { useStore } from '@/store/AppStore'
import { compactMoney, money } from '@/lib/format'

export function SellerDashboard() {
  const { isDemo, verified } = useAccount()
  // Showcase data only appears once the account is verified.
  return verified && isDemo ? <DemoSellerDashboard /> : <CreatedSellerDashboard />
}

/** A brand-new seller account — all cards visible, each in an empty state. */
function CreatedSellerDashboard() {
  const { inventory, listings } = useStore()
  const { company, contactName, verified } = useAccount()
  const { openForm } = useKycDrawer()
  const greet = contactName?.split(' ')[0] || company

  return (
    <div>
      <PageHeader
        title={`Welcome, ${greet}`}
        subtitle="Here's your account. Complete verification to start trading."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Inventory items" value={verified ? inventory.length : 0} sub="Nothing stocked yet" icon={<Boxes size={17} />} />
        <StatCard label="Active listings" value={verified ? listings.filter((l) => l.status === 'approved').length : 0} sub="No live listings" icon={<Store size={17} />} />
        <StatCard label="Ongoing trades" value={compactMoney(0)} sub="0 in escrow" icon={<TrendingUp size={17} />} />
        <StatCard label="Volume traded" value="0 MT" sub="No trades yet" icon={<ArrowUpRight size={17} />} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Activity" subtitle="Listings and trades will appear here" />
            <EmptyState
              compact
              variant="gem"
              title={verified ? 'No activity yet' : 'Verify to start trading'}
              description={
                verified
                  ? 'Add a mineral and create a listing to start receiving RFQs from verified buyers.'
                  : 'Complete verification to unlock inventory, listings, trading and your dashboard insights.'
              }
              action={
                verified ? (
                  <ButtonLink to="/seller/inventory" leftIcon={<Plus size={16} />}>Add mineral</ButtonLink>
                ) : (
                  <Button leftIcon={<ShieldCheck size={16} />} onClick={openForm}>Complete verification</Button>
                )
              }
            />
          </Card>
          <Card>
            <CardHeader title="Recent trades" />
            <EmptyState compact variant="inbox" title="No trades yet" description="Your ongoing and completed trades will show up here." />
          </Card>
        </div>
        <div className="space-y-5">
          <KycSummary role="seller" />
        </div>
      </div>
    </div>
  )
}

function DemoSellerDashboard() {
  const { inventory, listings, trades } = useStore()
  const myTrades = trades.filter((t) => t.seller === SELLER_CO)
  const activeListings = listings.filter((l) => l.status === 'approved').length
  const ongoing = myTrades.filter((t) => t.status === 'ongoing')
  const ongoingValue = ongoing.reduce((s, t) => s + t.value, 0)
  const volume = myTrades.filter((t) => t.status === 'completed' && t.unit === 'ton').reduce(
    (s, t) => s + t.quantity,
    0,
  )

  return (
    <div>
      <PageHeader
        title="Welcome back, Jos Highland"
        subtitle="Here's what's moving across your inventory, listings and trades today."
        actions={
          <>
            <ButtonLink to="/seller/inventory" variant="secondary" leftIcon={<Boxes size={16} />}>
              Inventory
            </ButtonLink>
            <ButtonLink to="/seller/listings" leftIcon={<Plus size={16} />}>
              New listing
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Inventory items"
          value={inventory.length}
          sub={`${new Set(inventory.map((i) => i.mineral)).size} minerals stocked`}
          icon={<Boxes size={17} />}
        />
        <StatCard
          label="Active listings"
          value={activeListings}
          delta="+1"
          sub="Live on the marketplace"
          icon={<Store size={17} />}
        />
        <StatCard
          label="Ongoing trades"
          value={compactMoney(ongoingValue)}
          sub={`${ongoing.length} trades in escrow`}
          icon={<TrendingUp size={17} />}
        />
        <StatCard
          label="Volume traded"
          value={`${volume} MT`}
          delta="+12%"
          sub="Last 90 days"
          icon={<ArrowUpRight size={17} />}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Tin price · ₦/ton"
              subtitle="Spot reference for your top mineral"
              action={<Badge tone="success" dot>+4.2%</Badge>}
            />
            <div className="mt-2 flex items-end gap-3">
              <span className="tnum text-3xl font-semibold tracking-[-0.02em] text-forest">
                ₦475,000
              </span>
              <span className="mb-1 text-sm font-medium text-forest-400">/ ton</span>
            </div>
            <AreaChart
              data={PRICE_SERIES}
              height={180}
              className="mt-4"
              labels={PRICE_SERIES.map((_, i) => `Day ${i + 1}`)}
              valueFormat={(v) => `₦${Math.round(v * 5240).toLocaleString()}`}
            />
          </Card>

          <Card>
            <CardHeader title="Recent trades" action={
              <Link to="/seller/trades" className="text-sm font-semibold text-teal hover:underline">
                View all
              </Link>
            } />
            <div className="mt-3 divide-y divide-hair">
              {myTrades.slice(0, 4).map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-3">
                  <MineralIcon mineral={t.mineral} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold capitalize text-forest">
                      {t.mineral} · {t.quantity}
                      {t.unit}
                    </p>
                    <p className="text-xs text-forest-400">
                      {t.orderNumber} · {t.buyer}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="tnum text-sm font-semibold text-forest">
                      {money(t.value, t.currency)}
                    </p>
                    <StatusPill status={t.status} className="mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <KycSummary role="seller" />
          <Card dark className="overflow-hidden" pad={false}>
            <div className="p-6">
              <Store size={22} className="text-lime" />
              <h3 className="mt-3 text-lg font-semibold">Add your products</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/70">
                Stock a mineral, then publish a listing to start receiving RFQs from
                verified buyers.
              </p>
              <ButtonLink
                to="/seller/inventory"
                variant="lime"
                className="mt-5"
                block
                leftIcon={<Plus size={16} />}
              >
                Add mineral
              </ButtonLink>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
