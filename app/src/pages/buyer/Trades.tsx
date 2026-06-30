import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ExternalLink, Package, ShieldCheck, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Button,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  KeyValue,
  MineralIcon,
  SearchInput,
  Segmented,
  StatCard,
  StatusPill,
  useToast,
  type Column,
} from '@/components/ui'
import { BUYER_CO } from '@/data/mock'
import { useStore } from '@/store/AppStore'
import { useAccount } from '@/components/shell/AccountContext'
import { money } from '@/lib/format'
import type { Trade } from '@/data/types'

export function BuyerTrades() {
  const { trades, testResults, releaseEscrow, passports } = useStore()
  const { verified } = useAccount()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<'active' | 'history'>('active')
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Trade | null>(null)
  const result = active ? testResults.find((r) => r.batchId === active.batchId) : undefined

  // Trades where this account is the buyer — empty until verified.
  const myTrades = (verified ? trades : []).filter((t) => t.buyer === BUYER_CO)

  // Deep-link: open a specific order drawer when arriving via ?order=<orderNumber>.
  useEffect(() => {
    const order = searchParams.get('order')
    if (!order) return
    const t = myTrades.find((x) => x.orderNumber === order)
    if (t) {
      setActive(t)
      setTab(t.status === 'ongoing' ? 'active' : 'history')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, trades])

  const closeDrawer = () => {
    setActive(null)
    if (searchParams.has('order')) {
      searchParams.delete('order')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const release = () => {
    if (!active) return
    releaseEscrow(active.id)
    setActive({ ...active, escrow: 'released', status: 'completed' })
    toast.success('Escrow released', `${active.orderNumber} is complete — funds sent to ${active.seller}.`)
  }
  const volume = myTrades.filter((t) => t.unit === 'ton').reduce((s, t) => s + t.quantity, 0)
  const value = myTrades.reduce((s, t) => s + t.value, 0)
  const completed = myTrades.filter((t) => t.status === 'completed').length

  const rows = myTrades.filter((t) => {
    const inTab = tab === 'active' ? t.status === 'ongoing' : t.status !== 'ongoing'
    const match =
      !query ||
      t.batchId.toLowerCase().includes(query.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(query.toLowerCase())
    return inTab && match
  })

  const columns: Column<Trade>[] = [
    {
      key: 'order',
      header: 'Order ID',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={r.mineral} />
          <div>
            <p className="font-mono font-semibold text-forest">{r.orderNumber}</p>
            <p className="text-xs capitalize text-forest-400">
              {r.mineral} · {r.batchId}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'grade', header: 'Grade', align: 'right', cell: (r) => <span className="tnum">{r.grade}%</span> },
    {
      key: 'qty',
      header: 'Quantity',
      align: 'right',
      cell: (r) => (
        <span className="tnum">
          {r.quantity} {r.unit}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Trade value',
      align: 'right',
      cell: (r) => <span className="tnum font-semibold text-forest">{money(r.value, r.currency)}</span>,
    },
    { key: 'seller', header: 'Seller', cell: (r) => <span className="text-forest-500">{r.seller}</span> },
    { key: 'escrow', header: 'Escrow', align: 'center', cell: (r) => <StatusPill status={r.escrow} /> },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Trades"
        subtitle="Track active deals in escrow and review your purchase history."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Volume purchased" value={`${volume} MT`} sub="All trades" icon={<Package size={17} />} />
        <StatCard label="Value purchased" value={money(value)} delta="+9%" sub="All time" icon={<Wallet size={17} />} />
        <StatCard label="Completed trades" value={completed} sub="Settled & released" icon={<CheckCircle2 size={17} />} />
      </div>

      <div className="mt-5 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          options={[
            { value: 'active', label: 'Active trades' },
            { value: 'history', label: 'Trade history' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <SearchInput
          placeholder="Search Batch ID / Order Number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          wrapClassName="sm:max-w-xs"
        />
      </div>

      <Card pad={false} className="p-2 sm:p-3">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={setActive}
          empty={
            <EmptyState
              title={tab === 'active' ? 'No active trades' : 'No past trades'}
              description="Trades you open from accepted RFQs will appear here."
            />
          }
        />
      </Card>

      <Drawer
        open={!!active}
        onClose={closeDrawer}
        title={active?.orderNumber ?? ''}
        subtitle={active ? `${active.batchId} · ${active.seller}` : ''}
        size="lg"
        footer={
          active && active.status === 'ongoing' ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-forest-400">
                {active.accepted ? 'Seller has accepted — confirm when delivered.' : 'Funds held safely in escrow.'}
              </span>
              <Button leftIcon={<ShieldCheck size={16} />} onClick={release}>
                Confirm delivery & release
              </Button>
            </div>
          ) : null
        }
      >
        {active && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
              <MineralIcon mineral={active.mineral} size="xl" />
              <div className="flex-1">
                <p className="text-lg font-semibold capitalize text-forest">{active.mineral}</p>
                <p className="text-sm text-forest-400">{active.quantity} {active.unit} · grade {active.grade}%</p>
              </div>
              <StatusPill status={active.status} />
            </div>
            <dl className="grid grid-cols-2 gap-4">
              <KeyValue label="Trade value" value={money(active.value, active.currency)} />
              <KeyValue label="Seller" value={active.seller} />
              <KeyValue label="Created" value={active.createdAt} />
              <KeyValue label="Escrow" value={<StatusPill status={active.escrow} />} />
            </dl>
            <div className="rounded-2xl border border-hair p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal" />
                <p className="text-sm font-semibold text-forest">Certification</p>
              </div>
              {result ? (
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="text-forest-500">
                    Measured grade <span className="font-semibold text-forest">{result.gradeMeasured}%</span> · {result.method.toUpperCase()}
                  </p>
                  <p className="text-forest-400">{result.purity}</p>
                  <p className="text-xs text-forest-300">Signed by {result.signedBy} · {result.signedAt}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-forest-400">No certificate linked to this batch yet.</p>
              )}
              {(() => {
                const passport = passports.find((p) => p.batchId === active.batchId && p.status === 'verified')
                if (!passport) return null
                return (
                  <Link
                    to={`/passport/${passport.number}`}
                    target="_blank"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-forest px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-forest-600"
                  >
                    <ShieldCheck size={15} className="text-lime" /> View Digital Mineral Passport
                    <ExternalLink size={13} />
                  </Link>
                )
              })()}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
