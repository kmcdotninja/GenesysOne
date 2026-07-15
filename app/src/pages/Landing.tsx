import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  ClipboardList,
  FileCheck2,
  FlaskConical,
  Handshake,
  Hash,
  Leaf,
  MapPin,
  Menu,
  Pickaxe,
  ScanLine,
  ShieldCheck,
  Store,
  X,
  type LucideIcon,
} from 'lucide-react'
import { Logo, Mark } from '@/components/Logo'
import { PassportQR } from '@/components/PassportQR'
import { mineralImage } from '@/components/ui'
import { MINERAL_ELEMENT } from '@/data/mock'
import type { Mineral } from '@/data/types'
import { cn } from '@/lib/cn'

/** External scheduling link for the "Book a demo" call-to-action. */
const BOOK_DEMO_URL = 'https://cal.com/ubaidurrahman/30min'

/** Illustrative passport number shown on the mock passport card. */
const PASSPORT_ID = 'GO-LI-2026-000124'

const NAV_LINKS = [
  { id: 'platform', label: 'Platform' },
  { id: 'how', label: 'How it works' },
  { id: 'minerals', label: 'Minerals' },
  { id: 'passport', label: 'Passport' },
] as const

/** Looping trust chips under the hero (rendered as a marquee). */
const HERO_CHIPS: { icon: LucideIcon; label: string }[] = [
  { icon: FileCheck2, label: 'Digital passports' },
  { icon: MapPin, label: 'Verified origin' },
  { icon: Leaf, label: 'ESG compliant' },
  { icon: Handshake, label: 'Trade, not software' },
  { icon: ShieldCheck, label: 'Chain of custody' },
  { icon: ScanLine, label: 'Chemical fingerprint' },
  { icon: Boxes, label: 'Export-ready lots' },
  { icon: Hash, label: 'On-chain anchored' },
]

/** How GenesysOne turns raw supply into verified, tradeable exports. */
const FEATURES: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: MapPin,
    title: 'Verify at the source',
    body: 'Our field teams confirm producers in person, log the mine site by GPS, and record the first batch.',
  },
  {
    icon: FileCheck2,
    title: 'Issue the passport',
    body: 'Every shipment earns a Digital Product Passport carrying origin, lab grade, ESG, custody and a chemical fingerprint.',
  },
  {
    icon: Boxes,
    title: 'Aggregate to scale',
    body: 'Small, scattered lots combine into verified, export-ready shipments that clear international minimums.',
  },
  {
    icon: Store,
    title: 'Reach global buyers',
    body: 'Verified supply goes live to international buyers who bid and clear diligence with a single scan.',
  },
]

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: MapPin, title: 'Verify on the ground', body: 'Field teams confirm the producer, register the site by GPS and log the first batch.' },
  { icon: ScanLine, title: 'Assay and anchor', body: 'An accredited lab signs the grade, then the passport is anchored on-chain.' },
  { icon: Boxes, title: 'Aggregate to scale', body: 'Verified lots combine into export-ready shipments under strict volume accounting.' },
  { icon: Handshake, title: 'Trade with proof', body: 'Buyers bid on verified supply and settle with a complete, auditable record.' },
]

const SHOWCASE: Mineral[] = ['lithium', 'tin', 'copper', 'columbite', 'tantalite', 'gold', 'lead', 'zinc']

/** The three things every Digital Product Passport proves. */
const PILLARS: { code: string; icon: LucideIcon; title: string; body: string }[] = [
  { code: 'ORIGIN', icon: MapPin, title: 'Where it came from', body: 'GPS-verified mine site, extraction date and a documented first-mile handover.' },
  { code: 'QUALITY', icon: FlaskConical, title: 'What it actually is', body: 'An independent, accredited lab assay and a unique chemical fingerprint, signed into the record.' },
  { code: 'ESG', icon: Leaf, title: 'How it was produced', body: 'ESG data, labour conditions and full chain of custody, captured at the source.' },
]

/** The result, for each side of the trade. */
const VALUE: { icon: LucideIcon; title: string; body: string }[] = [
  { icon: Pickaxe, title: 'Producers', body: 'Sell straight to verified global buyers and finally get paid what your minerals are worth.' },
  { icon: ClipboardList, title: 'Buyers', body: 'Buy compliant, fully traceable material and swap weeks of manual checks for a single scan.' },
  { icon: FlaskConical, title: 'Laboratories', body: 'Take on testing requests and publish signed, on-chain assay certificates.' },
  { icon: ShieldCheck, title: 'Regulators', body: 'Audit-ready records that line up with OECD, EU and Dodd-Frank expectations.' },
]

/** Shared class for the primary (forest) call-to-action. */
const CTA_PRIMARY =
  'inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white shadow-soft transition-[transform,background-color] duration-200 hover:bg-forest-600 active:scale-[0.97]'
const CTA_SECONDARY =
  'inline-flex items-center gap-2 rounded-full border border-hair bg-white px-5 py-3 text-sm font-semibold text-forest-500 shadow-card transition-[transform,background-color,border-color] duration-200 hover:border-forest-200 hover:bg-panel active:scale-[0.97]'

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function Landing() {
  return (
    <div className="relative min-h-screen bg-canvas text-forest">
      <GuideLines />
      <div className="relative z-10">
        <SiteNav />
        <Hero />
        <Features />
        <PassportSection />
        <Pillars />
        <HowItWorks />
        <Minerals />
        <Value />
        <FinalCta />
        <SiteFooter />
      </div>
    </div>
  )
}

/** Faint vertical rules framing the content column (desktop only). */
function GuideLines() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 hidden lg:block" aria-hidden>
      <div className="mx-auto h-full max-w-6xl">
        <div className="relative h-full">
          <span className="absolute inset-y-0 left-0 w-px bg-hair" />
          <span className="absolute inset-y-0 right-0 w-px bg-hair" />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ nav --- */

function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (id: string) => { setOpen(false); scrollToId(id) }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300',
        scrolled || open ? 'bg-canvas/90 shadow-card backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-8 md:h-16">
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); setOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
          className="shrink-0"
        >
          <Logo className="h-9 text-forest md:h-7" />
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => { e.preventDefault(); scrollToId(l.id) }}
              className="rounded-full px-3.5 py-2 text-sm font-semibold text-forest-400 transition-colors duration-200 hover:bg-panel hover:text-forest"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={BOOK_DEMO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white shadow-soft transition-[transform,background-color] duration-200 hover:bg-forest-600 active:scale-[0.97] md:inline-flex"
          >
            Book a demo
          </a>
          <button
            type="button"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-forest transition-colors duration-200 hover:bg-panel active:scale-[0.96] md:hidden"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-hair bg-canvas/95 backdrop-blur-md md:hidden">
          <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-5 py-3 sm:px-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => { e.preventDefault(); go(l.id) }}
                className="rounded-xl px-3 py-3 text-base font-semibold text-forest-500 transition-colors duration-200 hover:bg-panel"
              >
                {l.label}
              </a>
            ))}
            <a
              href={BOOK_DEMO_URL}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-forest px-4 py-3 text-sm font-semibold text-white shadow-soft transition-[transform,background-color] duration-200 hover:bg-forest-600 active:scale-[0.97]"
            >
              Book a demo
              <ArrowRight size={16} />
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

/* ----------------------------------------------------------------- hero --- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-lime/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 top-40 h-[380px] w-[380px] rounded-full bg-teal/10 blur-[100px]" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div className="min-w-0">
          <Reveal>
            <h1 className="text-[46px] font-semibold leading-[1.03] tracking-[-0.03em] text-forest sm:text-[48px] lg:text-[54px]">
              Verified minerals,
              <br />
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">mine to market</span>
                <span className="absolute bottom-1.5 left-0 z-0 h-4 w-full -rotate-1 bg-lime/60" />
              </span>
              .
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-5 max-w-xl text-[18px] leading-relaxed text-forest-400 sm:text-[19px]">
              GenesysOne verifies critical minerals at the source and connects trusted supply
              straight to the buyers who need proof.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href={BOOK_DEMO_URL} target="_blank" rel="noreferrer noopener" className={CTA_PRIMARY}>
                Book a demo
                <ArrowRight size={16} />
              </a>
              <a
                href="#how"
                onClick={(e) => { e.preventDefault(); scrollToId('how') }}
                className={CTA_SECONDARY}
              >
                How it works
              </a>
            </div>
          </Reveal>
          <Reveal delay={240}>
            <div
              className="relative mt-9 overflow-hidden"
              style={{
                maskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
              }}
            >
              <div className="gx-marquee flex w-max">
                {[0, 1].map((g) => (
                  <div key={g} aria-hidden={g === 1} className="flex shrink-0 items-center gap-x-8 pr-8">
                    {HERO_CHIPS.map((c) => (
                      <TrustChip key={c.label} icon={c.icon} label={c.label} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={200} className="justify-self-center lg:justify-self-end">
          <img
            src="/Export.webp"
            alt="Mineral ore moving from an African mine site to export, into the phones and batteries it powers"
            width={1400}
            height={1234}
            loading="eager"
            decoding="async"
            className="w-full max-w-[540px] select-none drop-shadow-[0_30px_60px_rgba(2,55,41,0.22)]"
          />
        </Reveal>
      </div>
    </section>
  )
}

function TrustChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm text-forest-400">
      <Icon size={17} className="text-teal" />
      {label}
    </span>
  )
}

/* ------------------------------------------------------------- features --- */

function Features() {
  return (
    <Section id="platform">
      <SectionHead
        eyebrow="The platform"
        title="Proof starts where the mineral does"
        subtitle="Field verification, a tamper-proof passport, and a marketplace that puts trusted supply in front of global buyers."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 70}>
            <article className="group h-full rounded-4xl border border-hair bg-white p-6 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card-hover">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-lime transition-transform duration-200 group-hover:scale-105">
                <f.icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-forest">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-400">{f.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* -------------------------------------------------------------- passport --- */

function PassportSection() {
  const points = [
    'GPS-verified mine site and date of extraction',
    'Independent, digitally signed lab grade',
    'ESG data, labour conditions and carbon footprint',
    'Full chain of custody and a unique chemical fingerprint',
  ]
  return (
    <Section id="passport" tint>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <Reveal className="order-2 justify-self-center lg:order-1">
          <PassportPreview />
        </Reveal>
        <Reveal delay={80} className="order-1 lg:order-2">
          <span className="text-sm font-semibold uppercase tracking-wide text-teal">Digital Product Passport</span>
          <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-forest sm:text-[40px]">
            One passport, the whole story
          </h2>
          <p className="mt-4 text-[17px] leading-relaxed text-forest-400">
            Once a batch clears verification, we mint a Digital Product Passport and lock it to the
            blockchain. A quick scan of its QR code shows any buyer, auditor or regulator exactly
            what they are holding and where it has been, no one's word required.
          </p>
          <ul className="mt-6 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-forest-500">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-soft text-teal">
                  <BadgeCheck size={13} />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </Section>
  )
}

/** A floating illustration of a Digital Product Passport. */
function PassportPreview() {
  const el = MINERAL_ELEMENT.lithium
  const img = mineralImage('lithium')
  return (
    <div className="gx-float relative w-[320px] max-w-full sm:w-[360px]">
      <div className="relative overflow-hidden rounded-4xl bg-forest p-6 text-white shadow-pop">
        <div className="pointer-events-none absolute -right-10 -top-6 h-40 w-40 rounded-full bg-lime/25 blur-3xl" />
        <div className="relative flex items-center gap-2 text-white/70">
          <Mark className="h-5 w-5 text-lime" />
          <span className="text-[11px] font-semibold uppercase tracking-wide">Digital Product Passport</span>
        </div>

        <div className="relative mt-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Passport ID</p>
            <p className="mt-1 font-mono text-lg font-semibold">{PASSPORT_ID}</p>
          </div>
          <span className="rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-forest">ACTIVE</span>
        </div>

        <div className="relative mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Mineral</p>
            <p className="mt-1 text-2xl font-semibold leading-tight">{el.product}</p>
            <p className="mt-1 text-sm text-white/60">{el.element} · 6.2% Li₂O</p>
          </div>
          <div className="flex h-[68px] w-[68px] shrink-0 flex-col justify-between rounded-2xl border border-white/20 bg-white/5 p-2">
            <span className="text-[10px] font-semibold text-lime">{el.atomic}</span>
            <span className="text-center text-2xl font-bold leading-none">{el.symbol}</span>
            <span className="text-center text-[9px] text-white/60">{el.element}</span>
          </div>
        </div>

        <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-4">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/50">
              <Hash size={12} /> On-chain anchor
            </p>
            <p className="mt-1 truncate font-mono text-[11px] text-white/70">0x9b74c9897bac770ffc0291…</p>
          </div>
          <div className="shrink-0 rounded-xl bg-white p-1.5">
            {img ? (
              <img src={img} alt="" aria-hidden className="h-12 w-12 object-contain" />
            ) : (
              <PassportQR value={PASSPORT_ID} size={48} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------- pillars --- */

function Pillars() {
  return (
    <Section>
      <SectionHead
        eyebrow="What the passport proves"
        title="Every passport proves three things"
        subtitle="Origin, quality and responsibility, verified before a mineral is ever listed."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {PILLARS.map((p, i) => (
          <Reveal key={p.code} delay={i * 80}>
            <div className="group h-full rounded-4xl border border-hair bg-white p-7 text-center shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card-hover">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-forest text-lime transition-transform duration-200 group-hover:scale-105">
                <p.icon size={28} />
              </span>
              <span className="mt-4 inline-block rounded-full bg-teal-soft px-2.5 py-1 font-mono text-[11px] font-semibold text-teal">
                {p.code}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-forest">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-400">{p.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* --------------------------------------------------------- how it works --- */

function HowItWorks() {
  return (
    <Section id="how" tint>
      <SectionHead
        eyebrow="How it works"
        title="From the pit to the port"
        subtitle="Four steps turn a raw batch into a verified, tradeable export."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal key={s.title} delay={i * 70}>
            <div className="relative h-full rounded-4xl border border-hair bg-white p-6 shadow-card">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                  <s.icon size={20} />
                </span>
                <span className="tnum text-4xl font-semibold text-hair">{i + 1}</span>
              </div>
              <h3 className="mt-5 text-base font-semibold text-forest">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-400">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------- minerals --- */

function Minerals() {
  return (
    <Section id="minerals" tint>
      <SectionHead
        eyebrow="Coverage"
        title="Built for the minerals that matter most"
        subtitle="Lithium for batteries, tin for electronics, copper for the grid, and the wider critical-mineral basket."
      />
      <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {SHOWCASE.map((m, i) => {
          const el = MINERAL_ELEMENT[m]
          const img = mineralImage(m)
          return (
            <Reveal key={m} delay={i * 50}>
              <div className="group rounded-4xl border border-hair bg-white p-3 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card-hover">
                <div className="relative flex h-32 items-center justify-center rounded-3xl bg-panel">
                  {img && (
                    <img
                      src={img}
                      alt={el.element}
                      loading="lazy"
                      decoding="async"
                      className="h-24 w-24 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.14)] transition-transform duration-200 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute right-2.5 top-2.5 rounded-lg bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-forest shadow-chip">
                    {el.symbol}
                  </span>
                </div>
                <p className="mt-3 px-1 text-sm font-semibold capitalize text-forest">{m}</p>
                <p className="px-1 pb-1 text-xs text-forest-400">{el.element} · {el.gradeUnit}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}

/* ---------------------------------------------------------------- value --- */

function Value() {
  return (
    <Section>
      <SectionHead
        eyebrow="Who it's for"
        title="Value on both sides of the trade"
        subtitle="Producers finally sell at the real price. Buyers finally source with proof."
      />
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE.map((a, i) => (
          <Reveal key={a.title} delay={i * 70}>
            <article className="h-full rounded-4xl border border-hair bg-white p-6 shadow-card">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-soft text-teal">
                <a.icon size={22} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-forest">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest-400">{a.body}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}

/* ------------------------------------------------------------ final cta --- */

function FinalCta() {
  return (
    <Section>
      <Reveal>
        <div className="relative overflow-hidden rounded-5xl border border-hair bg-gradient-to-b from-lime-50 via-canvas to-canvas shadow-card">
          <div className="pointer-events-none absolute -left-16 -top-12 h-64 w-64 rounded-full bg-lime/25 blur-[90px]" />
          {/* Marketplace product mock, peeking in from the top and fading into the CTA */}
          <div
            className="relative mx-auto w-full max-w-5xl px-6 pt-10"
            style={{
              maxHeight: 'clamp(220px, 36vw, 460px)',
              overflow: 'hidden',
              maskImage: 'linear-gradient(to bottom, black 78%, transparent)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 78%, transparent)',
            }}
          >
            <img
              src="/Marketplace.webp"
              alt="The GenesysOne buyer marketplace showing verified mineral listings with grades, prices and Digital Passports"
              width={2000}
              height={1489}
              loading="lazy"
              decoding="async"
              className="w-full select-none"
            />
          </div>
          {/* CTA content */}
          <div className="relative mx-auto max-w-2xl px-6 pb-14 pt-2 text-center sm:px-12">
            <h2 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-forest sm:text-[42px] sm:leading-[1.08]">
              Let's build the proof layer for African minerals
            </h2>
            <p className="mt-4 text-[17px] leading-relaxed text-forest-400">
              Every verified shipment moves more value back to the people who mined it. Producer,
              buyer or partner, book a call and move with us.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a href={BOOK_DEMO_URL} target="_blank" rel="noreferrer noopener" className={CTA_PRIMARY}>
                Book a demo
                <ArrowRight size={16} />
              </a>
              <a
                href="#how"
                onClick={(e) => { e.preventDefault(); scrollToId('how') }}
                className={CTA_SECONDARY}
              >
                How it works
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

/* --------------------------------------------------------------- footer --- */

function SiteFooter() {
  return (
    <footer className="mx-auto w-full max-w-6xl px-5 pb-10 pt-6 sm:px-8">
      <div className="grid gap-10 border-t border-hair py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo className="h-7 text-forest" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-forest-400">
            Verified, traceable critical minerals from Africa, connected to international buyers,
            mine to market.
          </p>
          <a
            href={BOOK_DEMO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white shadow-soft transition-[transform,background-color] duration-200 hover:bg-forest-600 active:scale-[0.97]"
          >
            Book a demo
            <ArrowRight size={15} />
          </a>
        </div>
        <FooterCol
          title="Platform"
          links={[
            { label: 'How it works', id: 'how' },
            { label: 'Digital passport', id: 'passport' },
            { label: 'Minerals', id: 'minerals' },
            { label: 'The solution', id: 'platform' },
          ]}
        />
        <div>
          <p className="text-sm font-semibold text-forest">Get started</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <a
                href={BOOK_DEMO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="text-forest-400 transition-colors duration-200 hover:text-forest"
              >
                Book a demo
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="flex flex-col items-center justify-between gap-3 border-t border-hair py-6 text-sm text-forest-300 sm:flex-row">
        <span className="flex items-center gap-2">
          <Mark className="h-4 w-4 text-forest-300" />
          GenesysOne
        </span>
        <span>© {new Date().getFullYear()} GenesysOne. All rights reserved.</span>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { label: string; id: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-forest">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <a
              href={`#${l.id}`}
              onClick={(e) => { e.preventDefault(); scrollToId(l.id) }}
              className="text-forest-400 transition-colors duration-200 hover:text-forest"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* --------------------------------------------------------- shared bits --- */

function Section({ id, tint, children }: { id?: string; tint?: boolean; children: ReactNode }) {
  return (
    <section id={id} className={cn('scroll-mt-20', tint && 'bg-panel/60')}>
      <div className="relative mx-auto w-full max-w-6xl border-t border-hair px-5 py-16 sm:px-8 lg:py-24">
        {/* lime accent segment where the horizontal and vertical rules meet */}
        <span className="absolute left-0 top-0 hidden h-10 w-0.5 -translate-y-px bg-lime lg:block" aria-hidden />
        {children}
      </div>
    </section>
  )
}

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <span className="text-sm font-semibold uppercase tracking-wide text-teal">{eyebrow}</span>
      <h2 className="mt-3 text-[36px] font-semibold leading-[1.1] tracking-[-0.02em] text-forest sm:text-[40px]">{title}</h2>
      <p className="mt-4 text-[17px] leading-relaxed text-forest-400">{subtitle}</p>
    </Reveal>
  )
}

/** Fade-and-rise a chunk into view. Skips the animation when the viewer
 *  prefers reduced motion, and reveals immediately if already on screen. */
function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce || !('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const node = ref.current
    if (!node) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-out will-change-transform',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
