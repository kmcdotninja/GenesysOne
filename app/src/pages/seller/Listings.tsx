import { useMemo, useState } from 'react'
import { BadgeCheck, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  ButtonLink,
  Card,
  DataTable,
  Drawer,
  EmptyState,
  KeyValue,
  MineralIcon,
  Tally,
  type Column,
} from '@/components/ui'
import { GatedButton, useAccount } from '@/components/shell/AccountContext'
import { CreateListingModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import type { Listing, ListingStatus } from '@/data/types'
import { compactMoney, money } from '@/lib/format'
import { cn } from '@/lib/cn'

const FILTERS: { key: ListingStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Live' },
  { key: 'completed', label: 'Completed' },
]

const TALLY_META: { key: ListingStatus | 'total'; label: string; accent: string }[] = [
  { key: 'total', label: 'Total', accent: '#023729' },
  { key: 'approved', label: 'Live', accent: '#34b489' },
  { key: 'completed', label: 'Completed', accent: '#8cd230' },
]

export function SellerListings() {
  const store = useStore()
  const { verified } = useAccount()
  const listings = useMemo(() => (verified ? store.listings : []), [store.listings, verified])
  const inventory = verified ? store.inventory : []
  const hasApprovedMinerals = inventory.some((i) => i.vetting !== 'pending')
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
          <MineralIcon mineral={r.mineral} src={r.image} shape="rounded" size="lg" />
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
  ]

  return (
    <div>
      <PageHeader
        title="Listings"
        subtitle="Publish passported inventory straight to the marketplace."
        actions={
          <>
            <ButtonLink to="/seller/qca" variant="secondary" leftIcon={<BadgeCheck size={16} />}>
              Quality control
            </ButtonLink>
            <GatedButton leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
              Create listing
            </GatedButton>
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
            <EmptyListings
              onCreate={() => setCreateOpen(true)}
              filter={filter}
              hasApprovedMinerals={hasApprovedMinerals}
            />
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
              <MineralIcon mineral={active.mineral} src={active.image} shape="rounded" size="xl" />
              <div className="flex-1">
                <p className="text-lg font-semibold capitalize text-forest">{active.mineral}</p>
                <p className="text-sm text-forest-400">{active.quantity} {active.unit} · grade {active.grade}%</p>
              </div>
              <Badge tone="success" dot className="capitalize">{active.status === 'approved' ? 'Live' : active.status}</Badge>
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
  hasApprovedMinerals,
}: {
  onCreate: () => void
  filter: string
  hasApprovedMinerals: boolean
}) {
  if (!hasApprovedMinerals) {
    return (
      <EmptyState
        variant="inbox"
        title="No minerals yet"
        description="Add a mineral to your inventory — it's sent to compliance for a Digital Passport, then you can publish it to the marketplace."
        action={
          <ButtonLink to="/seller/inventory" leftIcon={<Plus size={16} />}>
            Add mineral
          </ButtonLink>
        }
      />
    )
  }
  return (
    <EmptyState
      title={filter === 'all' ? 'No listings yet' : `No ${filter} listings`}
      description="Publish a passported mineral from your inventory to start receiving RFQs."
      action={
        <GatedButton leftIcon={<Plus size={16} />} onClick={onCreate}>
          Create listing
        </GatedButton>
      }
    />
  )
}
