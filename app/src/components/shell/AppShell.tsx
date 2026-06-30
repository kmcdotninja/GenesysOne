import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ArrowRight, Info } from 'lucide-react'
import { RoleContext } from './RoleContext'
import { KycDrawerContext } from './KycDrawerContext'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'
import { Button, Drawer } from '@/components/ui'
import { KycFlow } from '@/components/KycFlow'
import { KycStatus } from '@/components/KycStatus'
import { useStore } from '@/store/AppStore'
import { ROLE_META, ROLE_NAV } from '@/data/nav'
import type { Role } from '@/data/types'
import { cn } from '@/lib/cn'

function MobileNav({ role }: { role: Role }) {
  const nav = ROLE_NAV[role]
  return (
    <div className="-mx-4 mb-5 overflow-x-auto px-4 lg:hidden">
      <div className="flex w-max gap-2">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
                  isActive ? 'border-forest bg-forest text-white' : 'border-hair bg-white text-forest-500',
                )
              }
            >
              <Icon size={15} />
              {item.label}
            </NavLink>
          )
        })}
      </div>
    </div>
  )
}

function KycBanner({ status, onResume }: { status: string; onResume: () => void }) {
  if (status === 'verified') return null
  return (
    <div className="mb-6 flex items-center gap-3 rounded-3xl border border-orange/30 bg-orange-soft/60 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
        <Info size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-forest">Complete your KYC to unlock all features</p>
        <p className="text-xs text-forest-400">
          Your verification is <span className="font-semibold">{status.replace(/_/g, ' ')}</span>. Testing,
          trading and withdrawals stay locked until verified.
        </p>
      </div>
      <button
        onClick={onResume}
        className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-forest px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-forest-600 sm:flex"
      >
        Resume KYC
        <ArrowRight size={15} />
      </button>
    </div>
  )
}

export function AppShell({ role }: { role: Role }) {
  const [formOpen, setFormOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const meta = ROLE_META[role]
  const { kyc } = useStore()
  const kycStatus = kyc[role]

  const openForm = () => {
    setStatusOpen(false)
    setFormOpen(true)
  }
  const openStatus = () => setStatusOpen(true)

  return (
    <RoleContext.Provider value={role}>
      <KycDrawerContext.Provider value={{ openForm, openStatus }}>
        <div className="min-h-screen bg-canvas">
          <TopNav role={role} />
          <div className="mx-auto flex w-full max-w-[1440px]">
            <Sidebar role={role} />
            <main className="min-w-0 flex-1 px-4 pb-24 pt-8 sm:px-6 lg:px-8">
              <MobileNav role={role} />
              <KycBanner status={kycStatus} onResume={openForm} />
              <Outlet />
            </main>
          </div>

          {/* KYC status portal */}
          <Drawer
            open={statusOpen}
            onClose={() => setStatusOpen(false)}
            title="KYC verification"
            subtitle={`${meta.company} · ${kycStatus.replace(/_/g, ' ')}`}
            size="lg"
            footer={
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-forest-400">Encrypted at rest · masked in the UI</span>
                <Button onClick={openForm}>
                  {kycStatus === 'verified' ? 'Edit details' : 'Update KYC'}
                </Button>
              </div>
            }
          >
            <KycStatus role={role} onEdit={openForm} status={kycStatus} />
          </Drawer>

          {/* KYC edit form */}
          <Drawer
            open={formOpen}
            onClose={() => setFormOpen(false)}
            title="Complete your KYC"
            subtitle="Verify your business to unlock trading, testing and withdrawals."
            size="xl"
          >
            <KycFlow variant={role === 'lab' ? 'lab' : 'company'} onClose={() => setFormOpen(false)} />
          </Drawer>
        </div>
      </KycDrawerContext.Provider>
    </RoleContext.Provider>
  )
}
