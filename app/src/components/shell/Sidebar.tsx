import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { ArrowRight, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Mark } from '@/components/Logo'
import { ROLE_META, ROLE_NAV } from '@/data/nav'
import { StatusPill } from '@/components/ui'
import { useStore } from '@/store/AppStore'
import { useKycDrawer } from './KycDrawerContext'
import type { Role } from '@/data/types'
import { cn } from '@/lib/cn'

export function Sidebar({ role }: { role: Role }) {
  const meta = ROLE_META[role]
  const nav = ROLE_NAV[role]
  const { kyc } = useStore()
  // Compliance is the verifier (admin) — it has no KYC of its own.
  const isCompliance = role === 'compliance'
  const kycStatus = kyc[role]
  const verified = kycStatus === 'verified'
  const { openForm, openStatus } = useKycDrawer()

  // Briefly pop the icon of whichever nav item was just clicked.
  const [popped, setPopped] = useState<string | null>(null)
  const pop = (to: string) => {
    setPopped(to)
    window.setTimeout(() => setPopped((p) => (p === to ? null : p)), 480)
  }

  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-[264px] shrink-0 flex-col gap-4 overflow-y-auto px-4 py-6 lg:flex">
      {/* Company card — clean */}
      <div className="rounded-3xl border border-hair bg-white p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-forest text-lime">
            <Mark className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-forest">{meta.company}</p>
            <p className="text-xs text-forest-400">{isCompliance ? 'Admin · Verification authority' : `${meta.label} account`}</p>
          </div>
        </div>
        {!isCompliance && (
          <button
            onClick={openStatus}
            className="group mt-3 flex w-full items-center justify-between border-t border-hair pt-3 transition-opacity hover:opacity-80"
          >
            <span className="text-xs font-medium text-forest-400">KYC status</span>
            <span className="flex items-center gap-1">
              <StatusPill status={kycStatus} />
              <ChevronRight size={14} className="text-forest-300 transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {nav.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => pop(item.to)}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-all duration-150',
                  isActive
                    ? 'bg-forest-50 font-semibold text-forest'
                    : 'font-medium text-forest-400 hover:bg-panel hover:text-forest-600',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-lime-500" />
                  )}
                  <Icon
                    size={18}
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive ? 'text-forest' : 'text-forest-300 group-hover:text-forest-500',
                      popped === item.to && 'gx-icon-pop',
                    )}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer nudge */}
      <div className="mt-auto">
        {isCompliance ? (
          <div className="rounded-3xl bg-forest p-4 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lime">
              <ShieldCheck size={18} />
            </span>
            <p className="mt-3 text-sm font-semibold">Compliance console</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/70">
              You verify accounts, run on-field checks and issue blockchain-anchored passports.
            </p>
          </div>
        ) : verified ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-lime-300 via-lime to-lime-200 p-4 shadow-soft">
            <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-white/40 blur-2xl" />
            <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-forest text-lime">
              <ShieldCheck size={18} />
            </span>
            <p className="relative mt-3 text-sm font-semibold text-forest">Verified business</p>
            <p className="relative mt-0.5 text-xs leading-relaxed text-forest-600">
              All trading features are unlocked for your account.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl bg-forest p-4 text-white">
            <Sparkles size={20} className="text-lime" />
            <p className="mt-2 text-sm font-semibold">Complete your KYC</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/70">
              Verify your business to unlock testing, trading and withdrawals.
            </p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/15">
              <span className="block h-full w-3/4 rounded-full bg-lime" />
            </div>
            <p className="mt-2 mb-3 text-[11px] font-medium text-white/60">75% complete</p>
            <button
              onClick={openForm}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-lime px-3 py-2 text-[13px] font-semibold text-forest transition-colors hover:bg-lime-300"
            >
              Resume KYC
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
