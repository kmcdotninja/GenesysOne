import { MapPin, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import { Avatar, Badge, Card, StatCard } from '@/components/ui'
import { useStore } from '@/store/AppStore'

export function ComplianceAgents() {
  const { agents, passports } = useStore()

  const available = agents.filter((a) => a.status === 'available').length
  const onAssignment = agents.filter((a) => a.status === 'on_assignment').length

  const liveFor = (name: string) =>
    passports.filter((p) => p.agentName === name && p.status === 'in_verification').length

  return (
    <div>
      <PageHeader
        title="Field agents"
        subtitle="Accredited verification staff who visit mine sites, capture GPS and photos, and seal samples."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total agents" value={agents.length} sub="Across regions" icon={<ShieldCheck size={17} />} />
        <StatCard label="Available" value={available} sub="Ready to assign" />
        <StatCard label="On assignment" value={onAssignment} sub="Currently in the field" />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <Card key={a.id} className="flex items-center gap-4">
            <Avatar name={a.name} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-forest">{a.name}</p>
              <p className="flex items-center gap-1.5 text-xs text-forest-400">
                <MapPin size={13} /> {a.region}
              </p>
              <p className="mt-1 text-xs text-forest-400">
                {liveFor(a.name)} active · {a.assignments} total assignments
              </p>
            </div>
            <Badge tone={a.status === 'available' ? 'success' : 'warning'} dot>
              {a.status === 'available' ? 'Available' : 'On assignment'}
            </Badge>
          </Card>
        ))}
      </div>
    </div>
  )
}
