import { Link } from 'react-router-dom'
import { ArrowRight, FileCheck2, Gem, ShieldCheck, Wallet } from 'lucide-react'
import { Logo, Mark } from '@/components/Logo'
import { ROLE_META, ROLES, ROLE_TAGLINE } from '@/data/nav'

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas">
      {/* soft decorative glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-lime/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[380px] w-[380px] rounded-full bg-teal/10 blur-[100px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 sm:px-8">
        {/* top bar */}
        <header className="flex items-center justify-between py-6">
          <Logo className="h-7 text-forest" />
          {/* Sign in / Create account hidden for now — re-enable later.
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-forest-500 transition-colors hover:bg-panel"
            >
              Sign in
            </Link>
            <Link
              to="/signup"
              className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-forest-600"
            >
              Create account
            </Link>
          </div>
          */}
        </header>

        {/* hero */}
        <main className="flex flex-1 flex-col justify-center py-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-hair bg-white px-3 py-1.5 text-[13px] font-semibold text-forest-500 shadow-card">
              <span className="h-2 w-2 rounded-full bg-lime-500" />
              Nigeria's verified solid-minerals marketplace
            </span>
            <h1 className="mt-6 text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] text-forest sm:text-[58px]">
            Trace, verify and trade
              <br />
              minerals with{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">confidence</span>
                <span className="absolute bottom-1.5 left-0 z-0 h-4 w-full -rotate-1 bg-lime/60" />
              </span>
              .
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-forest-400">
              GenesysOne unites sellers, buyers, accredited labs and compliance on one
              platform — every mineral KYC-verified, lab-assayed and issued a blockchain
              Digital Passport, then traded under escrow from mine to market.
            </p>
          </div>

          {/* role cards */}
          <div className="mt-12">
            <p className="mb-4 text-sm font-semibold text-forest-400">
              Choose an interface to explore the demo
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {ROLES.map((role) => {
                const meta = ROLE_META[role]
                const Icon = ROLE_TAGLINE[role].icon
                return (
                  <Link
                    key={role}
                    to={meta.base}
                    className="group relative flex flex-col rounded-4xl border border-hair bg-white p-6 transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-forest-200"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-lime transition-transform duration-200 group-hover:scale-105">
                      <Icon size={22} />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-forest">
                      {meta.label}
                    </h3>
                    <p className="mt-1.5 flex-1 text-sm leading-relaxed text-forest-400">
                      {ROLE_TAGLINE[role].blurb}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-forest">
                      Enter as {meta.label}
                      <ArrowRight
                        size={16}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* trust strip */}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-forest-400">
            <span className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-teal" />
              KYC &amp; compliance verified
            </span>
            <span className="flex items-center gap-2">
              <FileCheck2 size={17} className="text-teal" />
              Blockchain mineral passports
            </span>
            <span className="flex items-center gap-2">
              <Gem size={17} className="text-teal" />
              Lab-certified grades
            </span>
            <span className="flex items-center gap-2">
              <Wallet size={17} className="text-teal" />
              Escrow-protected trade
            </span>
          </div>
        </main>

        <footer className="flex items-center justify-between border-t border-hair py-5 text-sm text-forest-300">
          <span className="flex items-center gap-2">
            <Mark className="h-4 w-4 text-forest-300" />
            GenesysOne · demo build
          </span>
          <span>© {new Date().getFullYear()} GenesysOne</span>
        </footer>
      </div>
    </div>
  )
}
