import { ArrowUpRight, FileText, ShieldCheck, Store, TestTube2, Wallet } from 'lucide-react'
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
import { BUYER_CO, MARKET_LISTINGS, VOLUME_SERIES } from '@/data/mock'
import { useStore } from '@/store/AppStore'
import { compactMoney, money } from '@/lib/format'

export function BuyerDashboard() {
  const { isDemo, verified } = useAccount()
  // Showcase data only appears once the account is verified.
  return verified && isDemo ? <DemoBuyerDashboard /> : <CreatedBuyerDashboard />
}

/** A brand-new buyer account — all cards visible, each in an empty state. */
function CreatedBuyerDashboard() {
  const { walletNGN } = useStore()
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
        <StatCard label="Wallet balance" value={compactMoney(verified ? walletNGN : 0)} sub="Fund to start trading" icon={<Wallet size={17} />} />
        <StatCard label="Active trades" value={compactMoney(0)} sub="0 in escrow" icon={<ArrowUpRight size={17} />} />
        <StatCard label="Open RFQs" value={0} sub="No quotes requested" icon={<FileText size={17} />} />
        <StatCard label="Samples in transit" value={0} sub="None on the way" icon={<TestTube2 size={17} />} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Marketplace activity" subtitle="RFQs, samples and trades will appear here" />
            <EmptyState
              compact
              variant="gem"
              title={verified ? 'Start sourcing minerals' : 'Verify to start trading'}
              description={
                verified
                  ? 'Browse certified listings, send RFQs and fund your wallet to trade with escrow protection.'
                  : 'Complete verification to unlock purchasing, RFQs, sampling and withdrawals.'
              }
              action={
                verified ? (
                  <ButtonLink to="/buyer/marketplace" leftIcon={<Store size={16} />}>Browse marketplace</ButtonLink>
                ) : (
                  <Button leftIcon={<ShieldCheck size={16} />} onClick={openForm}>Complete verification</Button>
                )
              }
            />
          </Card>
          <Card>
            <CardHeader title="Recent RFQs" />
            <EmptyState compact variant="inbox" title="No RFQs yet" description="Quotes you request from sellers will appear here." />
          </Card>
        </div>
        <div className="space-y-5">
          <KycSummary role="buyer" />
        </div>
      </div>
    </div>
  )
}

function DemoBuyerDashboard() {
  const { rfqs, sampleRequests, trades, walletNGN, walletUSD } = useStore()
  const activeTrades = trades.filter((t) => t.buyer === BUYER_CO && t.status === 'ongoing')
  const activeValue = activeTrades.reduce((s, t) => s + t.value, 0)
  const openRfqs = rfqs.filter((r) => r.status !== 'closed').length
  const samplesInTransit = sampleRequests.filter((s) => s.status === 'shipped' || s.status === 'pending').length

  return (
    <div>
      <PageHeader
        title="Welcome back, Atlantic Metals"
        subtitle="Source certified minerals, manage RFQs and keep an eye on your escrow."
        actions={
          <>
            <ButtonLink to="/buyer/wallet" variant="secondary" leftIcon={<Wallet size={16} />}>
              Wallet
            </ButtonLink>
            <ButtonLink to="/buyer/marketplace" leftIcon={<Store size={16} />}>
              Marketplace
            </ButtonLink>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Wallet balance" value={compactMoney(walletNGN)} sub={`+ ${compactMoney(walletUSD, 'USD')} available`} icon={<Wallet size={17} />} />
        <StatCard label="Active trades" value={compactMoney(activeValue)} sub={`${activeTrades.length} in escrow`} icon={<ArrowUpRight size={17} />} />
        <StatCard label="Open RFQs" value={openRfqs} delta="+2" sub="Awaiting seller quotes" icon={<FileText size={17} />} />
        <StatCard label="Samples in transit" value={samplesInTransit} sub="On the way to you" icon={<TestTube2 size={17} />} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader
              title="Procurement volume · MT"
              subtitle="Tonnage purchased over the last 18 weeks"
              action={<Badge tone="success" dot>+18%</Badge>}
            />
            <AreaChart
              data={VOLUME_SERIES}
              height={180}
              line="#2f8868"
              fill="#a6e64d"
              className="mt-4"
              labels={VOLUME_SERIES.map((_, i) => `Wk ${i + 1}`)}
              valueFormat={(v) => `${v} MT`}
            />
          </Card>

          <Card>
            <CardHeader
              title="Featured listings"
              action={
                <ButtonLink to="/buyer/marketplace" variant="ghost" size="sm">
                  Browse all
                </ButtonLink>
              }
            />
            <div className="mt-3 divide-y divide-hair">
              {MARKET_LISTINGS.slice(0, 4).map((m) => (
                <div key={m.id} className="flex items-center gap-3 py-3">
                  <MineralIcon mineral={m.mineral} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold capitalize text-forest">
                      {m.mineral} · {m.grade}%
                    </p>
                    <p className="truncate text-xs text-forest-400">{m.sellerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="tnum text-sm font-semibold text-forest">
                      {money(m.priceAmount, m.priceCurrency)}
                    </p>
                    <p className="text-xs text-forest-400">
                      {m.quantity} {m.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card dark className="overflow-hidden" pad={false}>
            <div className="p-6">
              <p className="text-sm text-white/70">Wallet balance</p>
              <p className="tnum mt-1 text-3xl font-semibold">{money(walletNGN)}</p>
              <p className="tnum mt-1 text-sm text-lime">{money(walletUSD, 'USD')}</p>
              <ButtonLink to="/buyer/wallet" variant="lime" className="mt-5" block leftIcon={<Wallet size={16} />}>
                Manage wallet
              </ButtonLink>
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent RFQs" />
            <div className="mt-3 space-y-3">
              {rfqs.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center gap-3">
                  <MineralIcon mineral={r.mineral} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold capitalize text-forest">{r.mineral}</p>
                    <p className="truncate text-xs text-forest-400">{r.seller}</p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
              ))}
            </div>
          </Card>

          <KycSummary role="buyer" />
        </div>
      </div>
    </div>
  )
}
