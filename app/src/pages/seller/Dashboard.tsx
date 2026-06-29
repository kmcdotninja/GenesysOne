import { Link } from 'react-router-dom'
import { ArrowUpRight, Boxes, Plus, Store, TrendingUp } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import { KycSummary } from '@/components/KycSummary'
import {
  AreaChart,
  Badge,
  ButtonLink,
  Card,
  CardHeader,
  MineralIcon,
  StatCard,
  StatusPill,
} from '@/components/ui'
import { PRICE_SERIES, SELLER_CO } from '@/data/mock'
import { useStore } from '@/store/AppStore'
import { compactMoney, money } from '@/lib/format'

export function SellerDashboard() {
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
            <AreaChart data={PRICE_SERIES} height={180} className="mt-4" />
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
