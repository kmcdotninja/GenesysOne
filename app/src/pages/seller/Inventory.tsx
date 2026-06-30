import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, ChevronRight, ExternalLink, Plus, Share2, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  MineralIcon,
  StatusPill,
  useToast,
  type Column,
} from '@/components/ui'
import { MineralModal, SamplingModal } from '@/components/modals'
import { GatedButton, useAccount } from '@/components/shell/AccountContext'
import { useStore } from '@/store/AppStore'
import type { InventoryItem } from '@/data/types'

export function SellerInventory() {
  const { inventory: allInventory, samplingRequests: allSampling, passports, requestPassport } = useStore()
  const { verified } = useAccount()
  // No inventory or sampling history until the account is verified.
  const inventory = verified ? allInventory : []
  const samplingRequests = verified ? allSampling : []
  const toast = useToast()
  const [mineralDrawer, setMineralDrawer] = useState<{ item: InventoryItem | null } | null>(null)
  const [sampleOpen, setSampleOpen] = useState(false)

  const passportFor = (id: string) => passports.find((p) => p.inventoryId === id && p.status !== 'rejected')

  const stop = (e: React.MouseEvent) => e.stopPropagation()

  const sharePassport = (e: React.MouseEvent, number: string) => {
    stop(e)
    const url = `${window.location.origin}/passport/${number}`
    navigator.clipboard?.writeText(url)
    toast.success('Public link copied', url)
  }

  const onRequest = (e: React.MouseEvent, item: InventoryItem) => {
    stop(e)
    requestPassport(item.id)
    toast.success('Passport requested', `${item.mineral} sent to compliance for verification.`)
  }

  const columns: Column<InventoryItem>[] = [
    {
      key: 'mineral',
      header: 'Mineral',
      cell: (r) => (
        <div className="flex items-center gap-3">
          <MineralIcon mineral={r.mineral} src={r.image} shape="rounded" size="lg" />
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
      key: 'vetting',
      header: 'Review',
      cell: (r) => <StatusPill status={r.vetting === 'pending' ? 'pending' : 'approved'} />,
    },
    {
      key: 'passport',
      header: 'Passport',
      cell: (r) => {
        const p = passportFor(r.id)
        if (!p) {
          return (
            <Button size="sm" variant="secondary" leftIcon={<ShieldCheck size={14} />} onClick={(e) => onRequest(e, r)}>
              Request
            </Button>
          )
        }
        if (p.status === 'verified') {
          return (
            <div className="flex items-center gap-2" onClick={stop}>
              <Badge tone="success" dot>Verified</Badge>
              <Link
                to={`/passport/${p.number}`}
                target="_blank"
                onClick={stop}
                className="text-forest-300 transition-colors hover:text-forest"
                title="View public passport"
              >
                <ExternalLink size={15} />
              </Link>
              <button onClick={(e) => sharePassport(e, p.number)} className="text-forest-300 transition-colors hover:text-forest" title="Copy public link">
                <Share2 size={15} />
              </button>
            </div>
          )
        }
        return <StatusPill status={p.status} />
      },
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
            <GatedButton variant="secondary" leftIcon={<CalendarClock size={16} />} onClick={() => setSampleOpen(true)}>
              Request sampling
            </GatedButton>
            <GatedButton leftIcon={<Plus size={16} />} onClick={() => setMineralDrawer({ item: null })}>
              Add mineral
            </GatedButton>
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
                <GatedButton leftIcon={<Plus size={16} />} onClick={() => setMineralDrawer({ item: null })}>
                  Add mineral
                </GatedButton>
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
