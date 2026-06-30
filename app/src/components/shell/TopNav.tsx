import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, Building2, Check, ChevronDown, ChevronRight, CornerDownLeft, LogOut, Palette, Search, Shield, UserRound } from 'lucide-react'
import { Logo, Mark } from '@/components/Logo'
import { Avatar, MineralIcon } from '@/components/ui'
import { ROLE_META, ROLES, ROLE_NAV, ROLE_TAGLINE } from '@/data/nav'
import { BUYER_CO, CURRENT_USER, MARKET_LISTINGS, SELLER_CO } from '@/data/mock'
import { useStore } from '@/store/AppStore'
import type { Role, UserAccount } from '@/data/types'
import { money } from '@/lib/format'
import { cn } from '@/lib/cn'

function CloseLayer({ onClose }: { onClose: () => void }) {
  return <button aria-hidden tabIndex={-1} onClick={onClose} className="fixed inset-0 z-40 cursor-default" />
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1)

interface SearchResult {
  id: string
  label: string
  sub: string
  to: string
  mineral?: string
  kind: 'page' | 'data'
}

function useSearchIndex(role: Role): SearchResult[] {
  const store = useStore()
  return useMemo(() => {
    const pages: SearchResult[] = ROLE_NAV[role].map((n) => ({
      id: `page-${n.to}`,
      label: n.label,
      sub: 'Jump to page',
      to: n.to,
      kind: 'page',
    }))
    const data: SearchResult[] = []
    const push = (r: SearchResult) => data.push(r)

    if (role === 'seller') {
      store.inventory.forEach((i) =>
        push({ id: i.id, label: `${cap(i.mineral)} — inventory`, sub: `${i.available} ${i.unit} · ${i.state}`, to: '/seller/inventory', mineral: i.mineral, kind: 'data' }),
      )
      store.listings.forEach((l) =>
        push({ id: l.id, label: `${cap(l.mineral)} listing`, sub: `${l.status} · ${money(l.priceAmount, l.priceCurrency)}`, to: '/seller/listings', mineral: l.mineral, kind: 'data' }),
      )
      store.trades.filter((t) => t.seller === SELLER_CO).forEach((t) =>
        push({ id: t.id, label: t.orderNumber, sub: `${cap(t.mineral)} · ${t.batchId}`, to: '/seller/trades', mineral: t.mineral, kind: 'data' }),
      )
      store.testingRequests.filter((r) => r.requesterRole === 'seller').forEach((r) =>
        push({ id: r.id, label: r.batchId, sub: `${cap(r.mineral)} test · ${r.status}`, to: '/seller/qca', mineral: r.mineral, kind: 'data' }),
      )
    } else if (role === 'buyer') {
      MARKET_LISTINGS.forEach((m) =>
        push({ id: m.id, label: `${cap(m.mineral)} — ${m.sellerName}`, sub: `${money(m.priceAmount, m.priceCurrency)} · ${m.state}`, to: '/buyer/marketplace', mineral: m.mineral, kind: 'data' }),
      )
      store.rfqs.forEach((r) =>
        push({ id: r.id, label: `RFQ — ${cap(r.mineral)}`, sub: `${r.seller} · ${r.status}`, to: '/buyer/rfq', mineral: r.mineral, kind: 'data' }),
      )
      store.trades.filter((t) => t.buyer === BUYER_CO).forEach((t) =>
        push({ id: t.id, label: t.orderNumber, sub: `${cap(t.mineral)} · ${t.batchId}`, to: '/buyer/trades', mineral: t.mineral, kind: 'data' }),
      )
      store.sampleRequests.forEach((s) =>
        push({ id: s.id, label: `${cap(s.mineral)} sample`, sub: `${s.seller} · ${s.status}`, to: '/buyer/samples', mineral: s.mineral, kind: 'data' }),
      )
    } else if (role === 'lab') {
      store.testingRequests.forEach((r) =>
        push({ id: r.id, label: r.batchId, sub: `${cap(r.mineral)} · ${r.status}`, to: '/lab/requests', mineral: r.mineral, kind: 'data' }),
      )
      store.testResults.forEach((r) =>
        push({ id: r.id, label: r.batchId, sub: `${cap(r.mineral)} result · ${r.status}`, to: '/lab/history', mineral: r.mineral, kind: 'data' }),
      )
    } else {
      store.passports.forEach((p) =>
        push({ id: p.id, label: p.number, sub: `${cap(p.mineral)} · ${p.status.replace('_', ' ')}`, to: `/compliance/passports?focus=${p.id}`, mineral: p.mineral, kind: 'data' }),
      )
      store.miningSites.forEach((si) =>
        push({ id: si.id, label: si.name, sub: `${si.region} · ${si.type}`, to: '/compliance/sites', kind: 'data' }),
      )
    }
    return [...pages, ...data]
  }, [role, store])
}

function GlobalSearch({ role }: { role: Role }) {
  const index = useSearchIndex(role)
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
      if (e.key === '/' && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return index.filter((r) => r.kind === 'page').slice(0, 5)
    return index
      .filter((r) => `${r.label} ${r.sub}`.toLowerCase().includes(q))
      .slice(0, 8)
  }, [query, index])

  const go = (to: string) => {
    setOpen(false)
    setQuery('')
    inputRef.current?.blur()
    navigate(to)
  }

  return (
    <div className="relative mx-auto hidden w-full max-w-xl md:block">
      <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-forest-300" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].to)
          if (e.key === 'Escape') {
            setOpen(false)
            inputRef.current?.blur()
          }
        }}
        placeholder="Search minerals, batches, orders…"
        className="h-11 w-full rounded-2xl border border-hair bg-panel/70 pl-11 pr-12 text-sm text-forest placeholder:text-forest-300 transition-all focus:border-forest-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-lime-100"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-hair bg-white px-1.5 py-0.5 text-[11px] font-semibold text-forest-400">
        /
      </kbd>

      {open && (
        <>
          <CloseLayer onClose={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 max-h-[60vh] w-full origin-top animate-pop overflow-y-auto rounded-3xl border border-hair bg-white p-2 shadow-pop">
            {results.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-forest-400">
                No matches for “{query}”.
              </div>
            ) : (
              results.map((r) => (
                <button
                  key={`${r.kind}-${r.id}`}
                  onClick={() => go(r.to)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-panel"
                >
                  {r.mineral ? (
                    <MineralIcon mineral={r.mineral} size="sm" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-panel text-forest-400">
                      <Search size={14} />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-forest">{r.label}</span>
                    <span className="block truncate text-xs text-forest-400">{r.sub}</span>
                  </span>
                  {r.kind === 'page' && (
                    <span className="rounded-md bg-panel px-1.5 py-0.5 text-[10px] font-bold uppercase text-forest-300">
                      Page
                    </span>
                  )}
                </button>
              ))
            )}
            <div className="mt-1 flex items-center gap-1.5 border-t border-hair px-3 py-2 text-[11px] text-forest-300">
              <CornerDownLeft size={12} /> to open · <kbd className="rounded border border-hair px-1">esc</kbd> to close
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function RoleSwitcher({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { accounts, activeAccountId, switchAccount } = useStore()
  const activeAccount = accounts.find((a) => a.id === activeAccountId && a.role === role)

  const pickDemo = (r: Role) => {
    setOpen(false)
    switchAccount(null)
    navigate(ROLE_META[r].base)
  }
  const pickAccount = (a: UserAccount) => {
    setOpen(false)
    switchAccount(a.id)
    navigate(ROLE_META[a.role].base)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full border border-hair bg-white py-1 pl-1.5 pr-2.5 text-sm font-semibold text-forest transition-colors hover:bg-panel"
      >
        <span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-bold text-forest-500">{ROLE_META[role].label}</span>
        {activeAccount && (
          <span className="hidden max-w-[140px] truncate text-xs font-semibold text-forest-500 sm:block">
            {activeAccount.company}
          </span>
        )}
        <ChevronDown size={15} className="text-forest-300" />
      </button>
      {open && (
        <>
          <CloseLayer onClose={() => setOpen(false)} />
          <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-72 origin-top-left animate-pop rounded-3xl border border-hair bg-white p-2 shadow-pop">
            <p className="px-3 pb-1.5 pt-2 text-[11px] font-bold uppercase tracking-wide text-forest-400">
              Demo interfaces
            </p>
            {ROLES.map((r) => {
              const m = ROLE_META[r]
              const Icon = ROLE_TAGLINE[r].icon
              const active = activeAccountId === null && r === role
              return (
                <button
                  key={r}
                  onClick={() => pickDemo(r)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors',
                    active ? 'bg-forest-50' : 'hover:bg-panel',
                  )}
                >
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', active ? 'bg-forest text-lime' : 'bg-panel text-forest-500')}>
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-forest">{m.label}</span>
                    <span className="block truncate text-xs text-forest-400">{m.company}</span>
                  </span>
                  {active && <Check size={16} className="text-forest" />}
                </button>
              )
            })}

            {accounts.length > 0 && (
              <>
                <p className="px-3 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wide text-forest-400">
                  Your accounts
                </p>
                {accounts.map((a) => {
                  const active = a.id === activeAccountId
                  return (
                    <button
                      key={a.id}
                      onClick={() => pickAccount(a)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors',
                        active ? 'bg-forest-50' : 'hover:bg-panel',
                      )}
                    >
                      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl', active ? 'bg-forest text-lime' : 'bg-panel text-forest-500')}>
                        <Building2 size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-forest">{a.company}</span>
                        <span className="block truncate text-xs text-forest-400">
                          {ROLE_META[a.role].label} · {a.kyc === 'verified' ? 'Verified' : 'Unverified'}
                        </span>
                      </span>
                      {active && <Check size={16} className="text-forest" />}
                    </button>
                  )
                })}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function NotificationsBell({ role }: { role: Role }) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const mine = notifications.filter((n) => n.audience === role)
  const unread = mine.filter((n) => !n.read).length

  const openNotif = (id: string, link?: string) => {
    markNotificationRead(id)
    setOpen(false)
    if (link) navigate(link)
  }
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={unread > 0 ? `Notifications · ${unread} unread` : 'Notifications'}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-hair bg-white text-forest-500 transition-colors hover:bg-panel"
      >
        <Bell size={18} className={cn(unread > 0 && 'gx-bell')} />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-orange/70 gx-ping" />
            <span className="relative inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
              {unread > 9 ? '9+' : unread}
            </span>
          </span>
        )}
      </button>
      {open && (
        <>
          <CloseLayer onClose={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-80 origin-top-right animate-pop rounded-3xl border border-hair bg-white p-2 shadow-pop">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-forest">
                Notifications
                {unread > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-soft px-1.5 text-[11px] font-bold text-orange-600">
                    {unread}
                  </span>
                )}
              </p>
              {unread > 0 ? (
                <button onClick={() => markAllNotificationsRead(role)} className="text-xs font-semibold text-teal hover:underline">
                  Mark all read
                </button>
              ) : (
                <span className="text-xs text-forest-300">All caught up</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mine.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-forest-400">No notifications yet.</p>
              ) : (
                mine.slice(0, 6).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => openNotif(n.id, n.link)}
                    className="flex w-full gap-3 rounded-2xl px-3 py-2.5 text-left transition-[background-color,transform] hover:bg-panel active:scale-[0.99]"
                  >
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-hair' : 'bg-orange')} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-forest">{n.title}</span>
                      <span className="block text-xs leading-snug text-forest-400">{n.body}</span>
                      <span className="mt-0.5 block text-[11px] text-forest-300">{n.time}</span>
                    </span>
                    {n.link && <ChevronRight size={14} className="mt-1 shrink-0 text-forest-300" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ProfileMenu({ role }: { role: Role }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const base = ROLE_META[role].base

  const items = [
    { label: 'Profile', icon: UserRound, section: 'profile' },
    { label: 'Account', icon: Building2, section: 'account' },
    { label: 'Notifications', icon: Bell, section: 'notifications' },
    { label: 'Security', icon: Shield, section: 'security' },
    { label: 'Appearance', icon: Palette, section: 'appearance' },
  ]

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-hair bg-white py-1 pl-1 pr-2 transition-colors hover:bg-panel sm:pr-2.5"
      >
        <Avatar name={CURRENT_USER.name} size="sm" />
        <span className="hidden text-sm font-semibold text-forest sm:block">{CURRENT_USER.firstName}</span>
        <ChevronDown size={15} className="hidden text-forest-300 sm:block" />
      </button>
      {open && (
        <>
          <CloseLayer onClose={() => setOpen(false)} />
          <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 origin-top-right animate-pop rounded-3xl border border-hair bg-white p-2 shadow-pop">
            <div className="flex items-center gap-3 px-3 py-2.5">
              <Avatar name={CURRENT_USER.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-forest">{CURRENT_USER.name}</p>
                <p className="truncate text-xs text-forest-400">{CURRENT_USER.email}</p>
              </div>
            </div>
            <div className="my-1 border-t border-hair" />
            {items.map((it) => {
              const Icon = it.icon
              return (
                <button
                  key={it.section}
                  onClick={() => go(`${base}/settings?section=${it.section}`)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-panel"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel text-forest-500">
                    <Icon size={16} />
                  </span>
                  <span className="text-sm font-semibold text-forest">{it.label}</span>
                  <ChevronRight size={14} className="ml-auto text-forest-300" />
                </button>
              )
            })}
            <div className="my-1 border-t border-hair" />
            <button
              onClick={() => go('/')}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-rose-soft"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-panel text-rose-ink">
                <LogOut size={16} />
              </span>
              <span className="text-sm font-semibold text-rose-ink">Sign out</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function TopNav({ role }: { role: Role }) {
  return (
    <header className="sticky top-0 z-30 border-b border-hair bg-white/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <Link to="/" className="flex items-center text-forest">
            <Logo className="hidden h-7 sm:block" />
            <Mark className="h-7 w-7 sm:hidden" />
          </Link>
          <RoleSwitcher role={role} />
        </div>

        <GlobalSearch role={role} />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <NotificationsBell role={role} />
          <ProfileMenu role={role} />
        </div>
      </div>
    </header>
  )
}
