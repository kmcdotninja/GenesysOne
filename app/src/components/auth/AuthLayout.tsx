import type { ReactNode } from 'react'
import { BadgeCheck, Lock, ShieldCheck } from 'lucide-react'
import { Mark } from '@/components/Logo'
import { Avatar, faceUrl } from '@/components/ui'

const NAMES = [
  'Amara Okwuosa', 'Ibrahim Suleiman', 'Ngozi Eze', 'Tunde Bakare',
  'Grace Madu', 'Musa Danjuma', 'Sani Bello', 'Hauwa Lawal',
  'Emeka Obi', 'Kemi Adeyemi', 'Chidi Uche', 'Bola Lawson',
  'Obi Femi', 'Rita Williams', 'David Ade', 'Yusuf Kano',
  'Peace Etim', 'James Taiwo', 'Zara Mohammed', 'Femi Nwosu',
  'Wale Ojo', 'Lara Koko', 'Vera Chukwu', 'Bashir Umar',
]

const PARTNERS = [
  'Plateau Minerals',
  'Sahel Co-op',
  'Atlantic Metals',
  'Confluence Ltd',
  'Lagos Alloy',
  'Eastern Ore',
]

const BADGES = [
  { icon: ShieldCheck, label: 'KYC Verified' },
  { icon: Lock, label: 'Escrow Protected' },
  { icon: BadgeCheck, label: 'Lab Certified' },
]

function BrandPanel() {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-4xl border border-hair bg-gradient-to-b from-lime-50/70 via-white to-white p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-lime/25 blur-[90px]" />

      <div className="relative flex flex-1 flex-col items-center justify-center text-center">
        {/* avatar grid */}
        <div className="grid grid-cols-8 gap-2.5">
          {NAMES.map((name, i) => (
            <Avatar key={name} name={name} src={faceUrl(`auth-${i}`)} size="lg" className="h-11 w-11" />
          ))}
        </div>

        <h2 className="mt-10 max-w-sm text-[28px] font-semibold leading-tight tracking-[-0.02em] text-forest">
          Trusted across Nigeria's solid-minerals value chain
        </h2>

        {/* partner "logos" */}
        <div className="mt-10 grid w-full max-w-md grid-cols-3 gap-x-6 gap-y-7">
          {PARTNERS.map((p) => (
            <span
              key={p}
              className="text-center text-[15px] font-bold tracking-[-0.01em] text-forest-300"
            >
              {p}
            </span>
          ))}
        </div>

        {/* compliance badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          {BADGES.map((b) => {
            const Icon = b.icon
            return (
              <span
                key={b.label}
                className="inline-flex items-center gap-2 rounded-2xl border border-hair bg-white px-3.5 py-2.5 text-[13px] font-semibold text-forest-500 shadow-card"
              >
                <Icon size={16} className="text-teal" />
                {b.label}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* form column */}
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:px-16">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[380px]">{children}</div>
        </div>
        <footer className="flex items-center gap-2 pt-6 text-xs text-forest-300">
          <Mark className="h-4 w-4 text-forest-300" />
          GenesysOne · demo build
        </footer>
      </div>

      {/* brand panel */}
      <div className="hidden p-3 lg:block lg:w-[48%]">
        <BrandPanel />
      </div>
    </div>
  )
}
