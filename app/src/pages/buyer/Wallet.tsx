import { useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Lock,
  Minus,
  Plus,
  Unlock,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  AreaChart,
  Badge,
  Button,
  Card,
  DataTable,
  StatusPill,
  type Column,
} from '@/components/ui'
import { AddFundsModal, WithdrawModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import { PRICE_SERIES, VOLUME_SERIES } from '@/data/mock'
import type { Transaction } from '@/data/types'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'

const TX_META: Record<Transaction['type'], { label: string; icon: LucideIcon; positive: boolean }> = {
  deposit: { label: 'Deposit', icon: ArrowDownLeft, positive: true },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpRight, positive: false },
  escrow_hold: { label: 'Escrow hold', icon: Lock, positive: false },
  escrow_release: { label: 'Escrow release', icon: Unlock, positive: true },
  payment: { label: 'Payment', icon: Banknote, positive: true },
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'deposit', label: 'Deposits' },
  { key: 'withdrawal', label: 'Withdrawals' },
  { key: 'escrow', label: 'Escrows' },
] as const

function BalanceCard({
  label,
  amount,
  currency,
  dark,
  trend,
}: {
  label: string
  amount: number
  currency: 'NGN' | 'USD'
  dark?: boolean
  trend?: number[]
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-4xl p-6', dark ? 'bg-forest text-white' : 'border border-hair bg-white')}>
      <p className={cn('text-sm font-medium', dark ? 'text-white/70' : 'text-forest-400')}>{label}</p>
      <p className={cn('tnum mt-2 text-4xl font-semibold tracking-[-0.02em]', dark ? 'text-white' : 'text-forest')}>
        {money(amount, currency)}
      </p>
      <p className={cn('mt-2 text-xs', dark ? 'text-lime' : 'text-teal')}>Available to spend</p>
      {trend && (
        <AreaChart
          data={trend}
          height={60}
          line={dark ? '#a6e64d' : '#2f8868'}
          fill="#a6e64d"
          showEndDot={false}
          className="mt-4 -mb-2 opacity-90"
        />
      )}
    </div>
  )
}

export function BuyerWallet() {
  const { transactions, walletNGN, walletUSD } = useStore()
  const [tab, setTab] = useState<(typeof FILTERS)[number]['key']>('all')
  const [addOpen, setAddOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const rows = transactions.filter((t) => {
    if (tab === 'all') return true
    if (tab === 'escrow') return t.type === 'escrow_hold' || t.type === 'escrow_release'
    return t.type === tab
  })

  const columns: Column<Transaction>[] = [
    {
      key: 'type',
      header: 'Type',
      cell: (r) => {
        const m = TX_META[r.type]
        const Icon = m.icon
        return (
          <div className="flex items-center gap-3">
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', m.positive ? 'bg-teal-soft text-teal' : 'bg-panel text-forest-500')}>
              <Icon size={16} />
            </span>
            <div>
              <p className="font-semibold text-forest">{m.label}</p>
              <p className="font-mono text-xs text-forest-400">{r.reference}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'method',
      header: 'Method',
      cell: (r) => <span className="capitalize text-forest-400">{r.method ? r.method.replace(/_/g, ' ') : '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (r) => {
        const m = TX_META[r.type]
        return (
          <span className={cn('tnum font-semibold', m.positive ? 'text-teal' : 'text-forest')}>
            {m.positive ? '+' : '−'}
            {money(r.amount, r.currency)}
          </span>
        )
      },
    },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date', align: 'right', cell: (r) => <span className="text-forest-400">{r.createdAt}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Wallet"
        subtitle="Fund your wallet, manage escrow and review every transaction."
        actions={
          <>
            <Button variant="secondary" leftIcon={<Minus size={16} />} onClick={() => setWithdrawOpen(true)}>
              Withdraw
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
              Add funds
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <BalanceCard label="Naira balance" amount={walletNGN} currency="NGN" dark trend={PRICE_SERIES} />
        <BalanceCard label="Dollar balance" amount={walletUSD} currency="USD" trend={VOLUME_SERIES} />
      </div>

      <Card className="mt-5" pad={false}>
        <div className="flex flex-wrap items-center gap-2 px-5 pt-5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setTab(f.key)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
                tab === f.key ? 'bg-forest text-white' : 'bg-panel text-forest-500 hover:bg-hair',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="p-2 sm:p-3">
          <DataTable
            columns={columns}
            rows={rows}
            rowKey={(r) => r.id}
            empty={<TxEmpty />}
          />
        </div>
      </Card>

      <AddFundsModal open={addOpen} onClose={() => setAddOpen(false)} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} balance={walletNGN} />
    </div>
  )
}

function TxEmpty() {
  return (
    <div className="flex flex-col items-center gap-1 py-6">
      <Badge tone="lime" dot>No transactions</Badge>
      <p className="mt-2 text-sm text-forest-400">Transactions of this type will appear here.</p>
    </div>
  )
}
