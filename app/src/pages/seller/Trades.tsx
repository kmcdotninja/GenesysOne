import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ArrowLeftRight, BadgeCheck, Check, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Button,
  Card,
  DataTable,
  Drawer,
  KeyValue,
  MineralIcon,
  SearchInput,
  StatCard,
  StatusPill,
  useToast,
  type Column,
} from '@/components/ui'
import { SELLER_CO } from '@/data/mock'
import { useStore } from '@/store/AppStore'
import { money } from '@/lib/format'
import type { Trade } from '@/data/types'

export function SellerTrades() {
  const { trades, testResults, acceptOrder } = useStore()
  const toast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<Trade | null>(null)

  // Trades where this account is the seller.
  const myTrades = useMemo(() => trades.filter((t) => t.seller === SELLER_CO), [trades])

  // Deep-link: open a specific order drawer when arriving via ?order=<orderNumber>.
  useEffect(() => {
    const order = searchParams.get('order')
    if (!order) return
    const t = myTrades.find((x) => x.orderNumber === order)
    if (t) setActive(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, trades])

  const closeDrawer = () => {
    setActive(null)
    if (searchParams.has('order')) {
      searchParams.delete('order')
      setSearchParams(searchParams, { replace: true })
    }
  }

  const accept = () => {
    if (!active) return
    acceptOrder(active.id)
    setActive({ ...active, accepted: true })
    toast.success('Order accepted', `${active.orderNumber} is confirmed — the buyer has been notified.`)
  }

  const kpis = useMemo(() => {
    const volume = myTrades.filter((t) => t.status === 'completed' && t.unit === 'ton').reduce(
      (s, t) => s + t.quantity,
      0,
    )
    const ongoing = myTrades.filter((t) => t.status === 'ongoing').reduce((s, t) => s + t.value, 0)
    const total = myTrades.reduce((s, t) => s + t.value, 0)
    return { volume, ongoing, total }
  }, [myTrades])

  const rows = myTrades.filter((t) =>
    t.batchId.toLowerCase().includes(query.toLowerCase()) ||
    t.orderNumber.toLowerCase().includes(query.toLowerCase()),
  )

  const columns: Column<Trade>[] = [
    {
      key: 'mineral',
      header: 'Mineral',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={r.mineral} />
          <div>
            <p className="flex items-center gap-1.5 font-semibold capitalize text-forest">
              {r.mineral}
              {r.certified && <BadgeCheck size={14} className="text-teal" />}
            </p>
            <p className="text-xs text-forest-400">{r.batchId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'order',
      header: 'Order number',
      cell: (r) => <span className="font-mono text-forest-500">{r.orderNumber}</span>,
    },
    { key: 'grade', header: 'Grade', align: 'right', cell: (r) => <span className="tnum">{r.grade}%</span> },
    {
      key: 'value',
      header: 'Total trade value',
      align: 'right',
      cell: (r) => (
        <span className="tnum font-semibold text-forest">{money(r.value, r.currency)}</span>
      ),
    },
    { key: 'date', header: 'Date created', align: 'right', cell: (r) => <span className="text-forest-400">{r.createdAt}</span> },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
  ]

  const result = active ? testResults.find((r) => r.batchId === active.batchId) : undefined

  return (
    <div>
      <PageHeader
        title="Trade history"
        subtitle="Every trade where you're the seller, with escrow and certification status."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Volume traded" value={`${kpis.volume} MT`} sub="Completed trades" icon={<ArrowLeftRight size={17} />} />
        <StatCard label="Ongoing trades" value={money(kpis.ongoing)} sub="Held in escrow" />
        <StatCard label="Total trade value" value={money(kpis.total)} delta="+8%" sub="All time" />
      </div>

      <div className="mt-5">
        <SearchInput
          placeholder="Search by Batch ID or Order Number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          wrapClassName="max-w-md"
        />
      </div>

      <Card pad={false} className="mt-4 p-2 sm:p-3">
        <DataTable columns={columns} rows={rows} rowKey={(r) => r.id} onRowClick={setActive} />
      </Card>

      <Drawer
        open={!!active}
        onClose={closeDrawer}
        title={active ? `${active.orderNumber}` : ''}
        subtitle={active ? `${active.batchId} · ${active.buyer}` : ''}
        size="lg"
        footer={
          active && active.status === 'ongoing' ? (
            active.accepted ? (
              <p className="flex items-center justify-center gap-1.5 text-sm font-medium text-teal">
                <Check size={15} /> Order accepted · awaiting buyer confirmation
              </p>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-forest-400">Buyer has funded escrow for this order.</span>
                <Button leftIcon={<Check size={16} />} onClick={accept}>
                  Accept order
                </Button>
              </div>
            )
          ) : null
        }
      >
        {active && (
          <div className="space-y-5">
            <div className="flex items-center gap-4 rounded-2xl bg-panel/60 p-4">
              <MineralIcon mineral={active.mineral} size="xl" />
              <div className="flex-1">
                <p className="text-lg font-semibold capitalize text-forest">
                  {active.mineral}
                </p>
                <p className="text-sm text-forest-400">
                  {active.quantity} {active.unit} · grade {active.grade}%
                </p>
              </div>
              <StatusPill status={active.status} />
            </div>

            <dl className="grid grid-cols-2 gap-4">
              <KeyValue label="Trade value" value={money(active.value, active.currency)} />
              <KeyValue label="Buyer" value={active.buyer} />
              <KeyValue label="Created" value={active.createdAt} />
              <KeyValue
                label="Escrow"
                value={<StatusPill status={active.escrow} />}
              />
            </dl>

            <div className="rounded-2xl border border-hair p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-teal" />
                <p className="text-sm font-semibold text-forest">Certification</p>
              </div>
              {result ? (
                <div className="mt-3 space-y-1.5 text-sm">
                  <p className="text-forest-500">
                    Measured grade{' '}
                    <span className="font-semibold text-forest">{result.gradeMeasured}%</span> ·
                    method {result.method.toUpperCase()}
                  </p>
                  <p className="text-forest-400">{result.purity}</p>
                  <p className="text-xs text-forest-300">
                    Signed by {result.signedBy} · {result.signedAt}
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-forest-400">
                  No certificate linked to this batch yet.
                </p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
