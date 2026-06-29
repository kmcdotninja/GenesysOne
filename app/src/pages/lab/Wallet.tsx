import { useState } from 'react'
import { ArrowUpRight, Banknote, Minus } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  AreaChart,
  Button,
  Card,
  CardHeader,
  DataTable,
  StatusPill,
  type Column,
} from '@/components/ui'
import { WithdrawModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import { VOLUME_SERIES } from '@/data/mock'
import { money } from '@/lib/format'
import type { Transaction } from '@/data/types'
import { cn } from '@/lib/cn'

export function LabWallet() {
  const { labWalletNGN, labTransactions } = useStore()
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const paymentsTotal = labTransactions
    .filter((t) => t.type === 'payment' && t.status === 'completed')
    .reduce((s, t) => s + t.amount, 0)
  const paymentsCount = labTransactions.filter((t) => t.type === 'payment').length

  const columns: Column<Transaction>[] = [
    {
      key: 'type',
      header: 'Type',
      cell: (r) => {
        const payment = r.type === 'payment'
        return (
          <div className="flex items-center gap-3">
            <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', payment ? 'bg-teal-soft text-teal' : 'bg-panel text-forest-500')}>
              {payment ? <Banknote size={16} /> : <ArrowUpRight size={16} />}
            </span>
            <div>
              <p className="font-semibold text-forest">{payment ? 'Payment' : 'Withdrawal'}</p>
              <p className="font-mono text-xs text-forest-400">{r.reference}</p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      cell: (r) => {
        const payment = r.type === 'payment'
        return (
          <span className={cn('tnum font-semibold', payment ? 'text-teal' : 'text-forest')}>
            {payment ? '+' : '−'}
            {money(r.amount, r.currency)}
          </span>
        )
      },
    },
    { key: 'status', header: 'Status', align: 'center', cell: (r) => <StatusPill status={r.status} /> },
    { key: 'date', header: 'Date', align: 'right', cell: (r) => <span className="text-forest-400">{r.createdAt}</span> },
  ]

  return (
    <div>
      <PageHeader
        title="Wallet"
        subtitle="Payments are credited automatically when a test completes."
        actions={
          <Button variant="secondary" leftIcon={<Minus size={16} />} onClick={() => setWithdrawOpen(true)}>
            Withdraw
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-[360px_1fr]">
        <div className="relative overflow-hidden rounded-4xl bg-forest p-6 text-white">
          <p className="text-sm text-white/70">Available balance</p>
          <p className="tnum mt-2 text-4xl font-semibold tracking-[-0.02em]">{money(labWalletNGN)}</p>
          <p className="mt-2 text-xs text-lime">Earned from completed tests</p>
          <AreaChart data={VOLUME_SERIES} height={56} line="#a6e64d" fill="#a6e64d" showEndDot={false} className="mt-4 -mb-2 opacity-90" />
          <Button variant="lime" className="mt-4" block leftIcon={<Minus size={16} />} onClick={() => setWithdrawOpen(true)}>
            Withdraw funds
          </Button>
        </div>
        <Card className="flex flex-col justify-center">
          <CardHeader title="Testing revenue" subtitle="All completed payments" />
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="tnum text-2xl font-semibold text-forest">{money(paymentsTotal)}</p>
              <p className="text-xs text-forest-400">Payments received</p>
            </div>
            <div>
              <p className="tnum text-2xl font-semibold text-forest">{paymentsCount}</p>
              <p className="text-xs text-forest-400">Tests paid</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-5" pad={false}>
        <div className="px-5 pt-5">
          <h3 className="text-[15px] font-semibold text-forest">Transaction history</h3>
        </div>
        <div className="p-2 sm:p-3">
          <DataTable columns={columns} rows={labTransactions} rowKey={(r) => r.id} />
        </div>
      </Card>

      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} lab balance={labWalletNGN} />
    </div>
  )
}
