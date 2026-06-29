import { MapPin, Pickaxe, Warehouse } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import { Badge, Card, KeyValue } from '@/components/ui'
import { useStore } from '@/store/AppStore'

export function ComplianceSites() {
  const { miningSites, passports } = useStore()

  const passportsForSite = (siteId: string) => passports.filter((p) => p.siteId === siteId).length

  return (
    <div>
      <PageHeader
        title="Mining site registry"
        subtitle="Verified mine sites and warehouses our field agents work with, with GPS on record."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {miningSites.map((s) => {
          const Icon = s.type === 'mine' ? Pickaxe : Warehouse
          return (
            <Card key={s.id} className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-lime">
                    <Icon size={20} />
                  </span>
                  <div>
                    <p className="font-semibold text-forest">{s.name}</p>
                    <p className="text-xs capitalize text-forest-400">{s.type} · {s.method}</p>
                  </div>
                </div>
                <Badge tone="success" dot>{passportsForSite(s.id)} passports</Badge>
              </div>

              <div className="my-4 flex items-start gap-2 rounded-2xl bg-panel/50 p-3 text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0 text-forest-300" />
                <div>
                  <p className="text-forest-500">{s.lga ? `${s.lga}, ` : ''}{s.region}, {s.country}</p>
                  <p className="mt-0.5 font-mono text-xs text-forest-400">
                    {s.gps.lat.toFixed(4)}, {s.gps.lng.toFixed(4)}
                  </p>
                </div>
              </div>

              <KeyValue label="Operator" value={s.operator} />
            </Card>
          )
        })}
      </div>
    </div>
  )
}
