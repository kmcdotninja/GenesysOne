import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ArrowRight, Info, ShieldCheck } from 'lucide-react'
import { RoleContext } from './RoleContext'
import { KycDrawerContext } from './KycDrawerContext'
import { AccountContext } from './AccountContext'
import { TopNav } from './TopNav'
import { Sidebar } from './Sidebar'
import { Button, Drawer, Modal } from '@/components/ui'
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

function bannerCopy(status: string): { title: string; body: string; cta: string } {
  switch (status) {
    case 'submitted':
    case 'under_review':
      return {
        title: 'Verification pending — under review by Compliance',
        body: "We're reviewing your submission. Trading, listings and withdrawals unlock once you're approved.",
        cta: 'View status',
      }
    case 'info_requested':
      return {
        title: 'Compliance requested more information',
        body: 'Provide the requested details to continue your verification.',
        cta: 'Update details',
      }
    case 'rejected':
      return {
        title: 'Verification was declined',
        body: 'Review the compliance notes and resubmit your details.',
        cta: 'Resubmit',
      }
    default:
      return {
        title: 'Complete verification to unlock GenesysOne',
        body: 'Submit your details for compliance review. Every feature stays locked until your account is verified.',
        cta: 'Complete verification',
      }
  }
}

function KycBanner({ status, onResume }: { status: string; onResume: () => void }) {
  if (status === 'verified') return null
  const copy = bannerCopy(status)
  return (
    <div className="mb-6 flex items-center gap-3 rounded-3xl border border-orange/30 bg-orange-soft/60 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
        <Info size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-forest">{copy.title}</p>
        <p className="text-xs text-forest-400">{copy.body}</p>
      </div>
      <button
        onClick={onResume}
        className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-forest px-3.5 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-forest-600 sm:flex"
      >
        {copy.cta}
        <ArrowRight size={15} />
      </button>
    </div>
  )
}

export function AppShell({ role }: { role: Role }) {
  const [formOpen, setFormOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const meta = ROLE_META[role]
  const { kyc, accounts, activeAccountId } = useStore()
  // The created account in view (if any) overrides the demo identity for this role.
  const activeAccount = accounts.find((a) => a.id === activeAccountId && a.role === role)
  const company = activeAccount?.company ?? meta.company
  const kycStatus = activeAccount ? activeAccount.kyc : kyc[role]
  const accountInfo = {
    role,
    company,
    contactName: activeAccount?.contactName,
    kyc: kycStatus,
    verified: kycStatus === 'verified',
    isDemo: !activeAccount,
  }

  const [verifyPromptFor, setVerifyPromptFor] = useState<string | null>(null)
  const pendingReview = kycStatus === 'submitted' || kycStatus === 'under_review'

  const openForm = () => {
    setStatusOpen(false)
    setVerifyPromptFor(null)
    setFormOpen(true)
  }
  const openStatus = () => setStatusOpen(true)
  const openVerifyPrompt = (action?: string) => setVerifyPromptFor(action ?? '')

  return (
    <RoleContext.Provider value={role}>
      <AccountContext.Provider value={accountInfo}>
      <KycDrawerContext.Provider value={{ openForm, openStatus, openVerifyPrompt }}>
        <div className="min-h-screen bg-canvas">
          <TopNav role={role} />
          <div className="mx-auto flex w-full max-w-[1440px]">
            <Sidebar role={role} />
            <main className="min-w-0 flex-1 px-4 pb-24 pt-8 sm:px-6 lg:px-8">
              <MobileNav role={role} />
              <KycBanner status={kycStatus} onResume={pendingReview ? openStatus : openForm} />
              <Outlet />
            </main>
          </div>

          {/* KYC status portal */}
          <Drawer
            open={statusOpen}
            onClose={() => setStatusOpen(false)}
            title="KYC verification"
            subtitle={`${company} · ${kycStatus.replace(/_/g, ' ')}`}
            size="lg"
            footer={
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-forest-400">Encrypted at rest · masked in the UI</span>
                <Button onClick={openForm}>
                  {kycStatus === 'verified' ? 'Edit details' : kycStatus === 'not_started' ? 'Start verification' : 'Update KYC'}
                </Button>
              </div>
            }
          >
            <KycStatus role={role} onEdit={openForm} status={kycStatus} account={activeAccount} />
          </Drawer>

          {/* KYC edit form */}
          <Drawer
            open={formOpen}
            onClose={() => setFormOpen(false)}
            title="Complete your KYC"
            subtitle="Verify your business to unlock trading, testing and withdrawals."
            size="xl"
          >
            <KycFlow variant={role === 'lab' ? 'lab' : 'company'} role={role} onClose={() => setFormOpen(false)} />
          </Drawer>

          {/* Verification required — shown when a restricted action is attempted */}
          <Modal
            open={verifyPromptFor !== null}
            onClose={() => setVerifyPromptFor(null)}
            title={pendingReview ? 'Verification in review' : 'Verification required'}
            subtitle={
              verifyPromptFor
                ? `You need to be verified before you can ${verifyPromptFor}.`
                : 'You need to be verified before you can use this feature.'
            }
            footer={
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setVerifyPromptFor(null)}>Not now</Button>
                {pendingReview ? (
                  <Button leftIcon={<ShieldCheck size={16} />} onClick={() => { setVerifyPromptFor(null); openStatus() }}>
                    View status
                  </Button>
                ) : (
                  <Button leftIcon={<ShieldCheck size={16} />} onClick={openForm}>
                    Complete verification
                  </Button>
                )}
              </div>
            }
          >
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-soft text-orange-600">
                <ShieldCheck size={22} />
              </span>
              <p className="text-sm leading-relaxed text-forest-500">
                {pendingReview
                  ? 'Your KYC is with the compliance team. Once they approve your account, this and every other feature will unlock.'
                  : 'Submit your business details for compliance review. Once the compliance team approves your account, trading, listings and withdrawals will unlock.'}
              </p>
            </div>
          </Modal>
        </div>
      </KycDrawerContext.Provider>
      </AccountContext.Provider>
    </RoleContext.Provider>
  )
}
