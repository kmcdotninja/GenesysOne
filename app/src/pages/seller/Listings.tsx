import { useMemo, useState } from 'react'
import { BadgeCheck, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Button,
  ButtonLink,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  KeyValue,
  MineralIcon,
  StatusPill,
  Tally,
  type Column,
} from '@/components/ui'
import { CreateListingModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import type { Listing, ListingStatus } from '@/data/types'
import { compactMoney, money } from '@/lib/format'
import { cn } from '@/lib/cn'

const FILTERS: { key: ListingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
]

const TALLY_META: { key: ListingStatus | 'total'; label: string; accent: string }[] = [
  { key: 'total', label: 'Total', accent: '#023729' },
  { key: 'pending', label: 'Pending', accent: '#ff8a3c' },
  { key: 'approved', label: 'Approved', accent: '#34b489' },
  { key: 'rejected', label: 'Rejected', accent: '#c2362f' },
  { key: 'completed', label: 'Completed', accent: '#8cd230' },
]

export function SellerListings() {
  const { listings } = useStore()
  const [filter, setFilter] = useState<ListingStatus | 'all'>('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [active, setActive] = useState<Listing | null>(null)

  const tallies = useMemo(() => {
    const sumValue = (s?: ListingStatus) =>
      listings.filter((l) => !s || l.status === s).reduce((a, l) => a + l.priceAmount, 0)
    const count = (s?: ListingStatus) => listings.filter((l) => !s || l.status === s).length
    return TALLY_META.map((t) => ({
      ...t,
      count: t.key === 'total' ? count() : count(t.key),
      value: compactMoney(t.key === 'total' ? sumValue() : sumValue(t.key)),
    }))
  }, [listings])

  const rows = filter === 'all' ? listings : listings.filter((l) => l.status === filter)

  const columns: Column<Listing>[] = [
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
            <p className="text-xs text-forest-400">{r.createdAt}</p>
          </div>
        </div>
      ),
    },
    { key: 'grade', header: 'Grade', align: 'right', cell: (r) => <span className="tnum">{r.grade}%</span> },
    {
      key: 'qty',
      header: 'Quantity',
      align: 'right',
      cell: (r) => <span className="tnum">{r.quantity} {r.unit}</span>,
    },
    {
      key: 'unitprice',
      header: 'Price / unit',
      align: 'right',
      cell: (r) => (
        <span className="tnum text-forest-500">
          {compactMoney(Math.round(r.priceAmount / r.quantity), r.priceCurrency)}
        </span>
      ),
    },
    {
      key: 'value',
      header: 'Listing value',
      align: 'right',
      cell: (r) => <span className="tnum font-semibold text-forest">{money(r.priceAmount, r.priceCurrency)}</span>,
    },
    { key: 'status', header: 'Status', align: 'right', cell: (r) => <StatusPill status={r.status} /> },
  ]

  return (
    <div>
      <PageHeader
        title="Listings"
        subtitle="Publish inventory to the marketplace and track approvals."
        actions={
          <>
            <ButtonLink to="/seller/qca" variant="secondary" leftIcon={<BadgeCheck size={16} />}>
              Quality control
            </ButtonLink>
            <Button leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Create listing
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tallies.map((t) => (
          <Tally key={t.key} label={t.label} count={t.count} value={t.value} accent={t.accent} />
        ))}
      </div>

      <div className="mb-4 mt-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors',
              filter === f.key
                ? 'bg-forest text-white'
                : 'border border-hair bg-white text-forest-500 hover:bg-panel',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card pad={false} className="p-2 sm:p-3">
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          onRowClick={setActive}
          empty={
            <EmptyListings onCreate={() => setCreateOpen(true)} filter={filter} />
          }
        />
      </Card>

      <CreateListingModal open={createOpen} onClose={() => setCreateOpen(false)} />

      <Drawer
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `${active.mineral[0].toUpperCase()}${active.mineral.slice(1)} listing` : ''}
        subtitle={active ? `Created ${active.createdAt}` : ''}
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
              <KeyValue label="Listing value" value={money(active.priceAmount, active.priceCurrency)} />
              <KeyValue
                label="Price / unit"
                value={money(Math.round(active.priceAmount / active.quantity), active.priceCurrency)}
              />
              <KeyValue label="Location" value={active.state} />
              <KeyValue label="Certified" value={active.certified ? 'Yes' : 'Not yet'} />
            </dl>
          </div>
        )}
      </Drawer>
    </div>
  )
}

function EmptyListings({
  onCreate,
  filter,
}: {
  onCreate: () => void
  filter: string
}) {
  return (
    <EmptyState
      title={filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
      description="Publish a mineral from your inventory to start receiving RFQs."
      action={
        <Button leftIcon={<Plus size={16} />} onClick={onCreate}>
          Create listing
        </Button>
      }
    />
  )
}
