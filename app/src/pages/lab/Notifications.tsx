import {
  ArrowLeftRight,
  Banknote,
  Bell,
  CheckCheck,
  ChevronRight,
  FileText,
  FlaskConical,
  ShieldCheck,
  TestTube2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shell/PageHeader'
import { Button, Card, EmptyState } from '@/components/ui'
import { useStore } from '@/store/AppStore'
import type { NotificationItem } from '@/data/types'
import { cn } from '@/lib/cn'

const CATEGORY: Record<
  NotificationItem['category'],
  { icon: LucideIcon; cls: string }
> = {
  test_request: { icon: FlaskConical, cls: 'bg-lime-100 text-forest-500' },
  payment: { icon: Banknote, cls: 'bg-teal-soft text-teal' },
  kyc: { icon: ShieldCheck, cls: 'bg-orange-soft text-orange-600' },
  rfq: { icon: FileText, cls: 'bg-forest-50 text-forest-500' },
  sample: { icon: TestTube2, cls: 'bg-forest-50 text-forest-500' },
  trade: { icon: ArrowLeftRight, cls: 'bg-forest-50 text-forest-500' },
  system: { icon: Bell, cls: 'bg-panel text-forest-400' },
}

export function LabNotifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore()
  const navigate = useNavigate()
  const labNotifications = notifications.filter((n) => n.audience === 'lab')
  const unread = labNotifications.filter((n) => !n.read).length

  const open = (n: NotificationItem) => {
    markNotificationRead(n.id)
    if (n.link) navigate(n.link)
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread · test requests, payments and KYC updates.`}
        actions={
          <Button
            variant="secondary"
            leftIcon={<CheckCheck size={16} />}
            onClick={() => markAllNotificationsRead('lab')}
            disabled={unread === 0}
          >
            Mark all read
          </Button>
        }
      />

      {labNotifications.length === 0 ? (
        <Card>
          <EmptyState title="No notifications" description="You're all caught up." />
        </Card>
      ) : (
      <Card pad={false} className="overflow-hidden">
        <div className="divide-y divide-hair">
          {labNotifications.map((n) => {
            const meta = CATEGORY[n.category]
            const Icon = meta.icon
            return (
              <button
                key={n.id}
                onClick={() => open(n)}
                className={cn(
                  'flex w-full items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-panel/50',
                  !n.read && 'bg-lime-50/40',
                )}
              >
                <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', meta.cls)}>
                  <Icon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-forest">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-orange" />}
                  </div>
                  <p className="mt-0.5 text-sm leading-relaxed text-forest-400">{n.body}</p>
                  <p className="mt-1 text-xs text-forest-300">{n.time}</p>
                </div>
                {n.link && <ChevronRight size={16} className="mt-1 shrink-0 text-forest-300" />}
              </button>
            )
          })}
        </div>
      </Card>
      )}
    </div>
  )
}
