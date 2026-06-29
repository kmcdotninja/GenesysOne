import { useState } from 'react'
import { CalendarClock, ChevronRight, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  MineralIcon,
  StatusPill,
  type Column,
} from '@/components/ui'
import { MineralModal, SamplingModal } from '@/components/modals'
import { useStore } from '@/store/AppStore'
import type { InventoryItem } from '@/data/types'

export function SellerInventory() {
  const { inventory, samplingRequests } = useStore()
  const [mineralDrawer, setMineralDrawer] = useState<{ item: InventoryItem | null } | null>(null)
  const [sampleOpen, setSampleOpen] = useState(false)

  const columns: Column<InventoryItem>[] = [
    {
      key: 'mineral',
      header: 'Mineral',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={r.mineral} />
          <div>
            <p className="font-semibold capitalize text-forest">{r.mineral}</p>
            <p className="text-xs capitalize text-forest-400">{r.locationType}</p>
          </div>
        </div>
      ),
    },
    { key: 'grade', header: 'Grade', align: 'right', cell: (r) => <span className="tnum">{r.grade}%</span> },
    {
      key: 'available',
      header: 'Available',
      align: 'right',
      cell: (r) => (
        <span className="tnum font-semibold text-forest">
          {r.available} {r.unit}
        </span>
      ),
    },
    {
      key: 'supply',
      header: 'Supply',
      cell: (r) => <Badge tone="neutral" className="capitalize">{r.supplyFrequency}</Badge>,
    },
    {
      key: 'location',
      header: 'Location',
      cell: (r) => <span className="text-forest-500">{r.state} · {r.lga}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      cell: () => <ChevronRight size={16} className="ml-auto text-forest-300" />,
    },
  ]

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Track stocked minerals and schedule on-site sampling visits."
        actions={
          <>
            <Button variant="secondary" leftIcon={<CalendarClock size={16} />} onClick={() => setSampleOpen(true)}>
              Request sampling
            </Button>
            <Button leftIcon={<Plus size={16} />} onClick={() => setMineralDrawer({ item: null })}>
              Add mineral
            </Button>
          </>
        }
      />

      <Card pad={false} className="p-2 sm:p-3">
        <DataTable
          columns={columns}
          rows={inventory}
          rowKey={(r) => r.id}
          onRowClick={(r) => setMineralDrawer({ item: r })}
          empty={
            <EmptyState
              variant="inbox"
              title="No minerals yet"
              description="Add your first mineral to start building listings."
              action={
                <Button leftIcon={<Plus size={16} />} onClick={() => setMineralDrawer({ item: null })}>
                  Add mineral
                </Button>
              }
            />
          }
        />
      </Card>

      <div className="mt-6">
        <h2 className="mb-3 text-[15px] font-semibold text-forest">Sampling requests</h2>
        {samplingRequests.length === 0 ? (
          <Card>
            <EmptyState compact title="No sampling requests" description="Schedule a visit to sample a batch on-site." />
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {samplingRequests.map((s) => (
              <Card key={s.id} className="flex items-center gap-3">
                <MineralIcon mineral={s.mineral} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold capitalize text-forest">{s.mineral}</p>
                  <p className="text-xs text-forest-400">{s.date} · {s.time} · {s.lga}</p>
                </div>
                <StatusPill status={s.status} />
              </Card>
            ))}
          </div>
        )}
      </div>

      <MineralModal
        key={mineralDrawer?.item?.id ?? 'new'}
        open={!!mineralDrawer}
        onClose={() => setMineralDrawer(null)}
        item={mineralDrawer?.item ?? null}
      />
      <SamplingModal open={sampleOpen} onClose={() => setSampleOpen(false)} />
    </div>
  )
}
