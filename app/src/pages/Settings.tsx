import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Bell, Building2, Check, Palette, Save, Shield, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/shell/PageHeader'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Field,
  Input,
  SectionLabel,
  Segmented,
  Select,
  Textarea,
  Toggle,
  useToast,
} from '@/components/ui'
import { useRole } from '@/components/shell/RoleContext'
import { ROLE_META } from '@/data/nav'
import { CURRENT_USER } from '@/data/mock'
import { cn } from '@/lib/cn'

type SectionKey = 'profile' | 'account' | 'notifications' | 'security' | 'appearance'

const SECTIONS: { key: SectionKey; label: string; desc: string; icon: typeof UserRound }[] = [
  { key: 'profile', label: 'Profile', desc: 'Your name, photo and role', icon: UserRound },
  { key: 'account', label: 'Account', desc: 'Email, phone and company', icon: Building2 },
  { key: 'notifications', label: 'Notifications', desc: 'How we reach you', icon: Bell },
  { key: 'security', label: 'Security', desc: 'Password and access', icon: Shield },
  { key: 'appearance', label: 'Appearance', desc: 'Theme and density', icon: Palette },
]

const NOTIF_ROWS: { key: string; label: string; hint: string }[] = [
  { key: 'trades', label: 'Trades & escrow', hint: 'Orders, escrow holds and releases' },
  { key: 'rfqs', label: 'RFQs & negotiation', hint: 'New quotes and negotiation messages' },
  { key: 'samples', label: 'Sample requests', hint: 'Sample shipping and delivery updates' },
  { key: 'results', label: 'Test results', hint: 'Certificates published by labs' },
  { key: 'payments', label: 'Payments', hint: 'Deposits, withdrawals and fees' },
  { key: 'product', label: 'Product updates', hint: 'New features and occasional tips' },
]

export function Settings() {
  const role = useRole()
  const meta = ROLE_META[role]
  const toast = useToast()
  const [params, setParams] = useSearchParams()

  const raw = params.get('section') as SectionKey | null
  const section: SectionKey = SECTIONS.some((s) => s.key === raw) ? (raw as SectionKey) : 'profile'
  const setSection = (key: SectionKey) => setParams({ section: key }, { replace: true })

  // Profile / account fields
  const [firstName, setFirstName] = useState(CURRENT_USER.firstName)
  const [lastName, setLastName] = useState(CURRENT_USER.lastName)
  const [title, setTitle] = useState(CURRENT_USER.title)
  const [bio, setBio] = useState('Coordinating mineral trades across the tin belt and beyond.')
  const [email, setEmail] = useState(CURRENT_USER.email)
  const [phone, setPhone] = useState(CURRENT_USER.phone)
  const [location, setLocation] = useState(CURRENT_USER.location)

  // Notifications
  const [channelEmail, setChannelEmail] = useState(true)
  const [channelPush, setChannelPush] = useState(true)
  const [notif, setNotif] = useState<Record<string, boolean>>({
    trades: true,
    rfqs: true,
    samples: false,
    results: true,
    payments: true,
    product: false,
  })

  // Security
  const [twoFA, setTwoFA] = useState(true)

  // Appearance
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')

  const fullName = `${firstName} ${lastName}`.trim()
  const saved = (what: string) => toast.success('Changes saved', `${what} updated.`)

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile, account and preferences." />

      <div className="grid items-start gap-5 lg:grid-cols-[244px_1fr]">
        {/* Section nav */}
        <Card pad={false} className="p-2">
          <nav className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const active = s.key === section
              return (
                <button
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  className={cn(
                    'flex shrink-0 items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors lg:w-full',
                    active ? 'bg-forest-50 text-forest' : 'text-forest-500 hover:bg-panel',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                      active ? 'bg-forest text-lime' : 'bg-panel text-forest-400',
                    )}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{s.label}</span>
                    <span className="hidden text-xs text-forest-400 lg:block">{s.desc}</span>
                  </span>
                </button>
              )
            })}
          </nav>
        </Card>

        {/* Section content */}
        <Card>
          {section === 'profile' && (
            <div>
              <SectionLabel hint="This is how you appear to teammates and counterparties.">Profile</SectionLabel>
              <div className="mb-6 flex items-center gap-4">
                <Avatar name={fullName || 'User'} size="lg" />
                <div>
                  <Button variant="secondary" size="sm">Change photo</Button>
                  <p className="mt-1.5 text-xs text-forest-400">JPG or PNG · up to 4MB</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" required>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </Field>
                <Field label="Last name" required>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </Field>
                <Field label="Job title" className="sm:col-span-2">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </Field>
                <Field label="Bio" optional className="sm:col-span-2">
                  <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                </Field>
              </div>
              <div className="mt-6 flex justify-end">
                <Button leftIcon={<Save size={16} />} onClick={() => saved('Profile')}>Save changes</Button>
              </div>
            </div>
          )}

          {section === 'account' && (
            <div>
              <SectionLabel hint="Account and organisation details.">Account</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email address" required>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Phone" required>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Field>
                <Field label="Location">
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} />
                </Field>
                <Field label="Language">
                  <Select defaultValue="English">
                    <option>English</option>
                    <option>French</option>
                    <option>Hausa</option>
                  </Select>
                </Field>
                <Field label="Timezone" className="sm:col-span-2">
                  <Select defaultValue="Africa/Lagos (GMT+1)">
                    <option>Africa/Lagos (GMT+1)</option>
                    <option>Africa/Accra (GMT)</option>
                    <option>Africa/Johannesburg (GMT+2)</option>
                  </Select>
                </Field>
              </div>

              <hr className="my-6 border-hair" />
              <SectionLabel>Organisation</SectionLabel>
              <div className="flex items-center justify-between rounded-2xl bg-panel/60 px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-forest">{meta.company}</p>
                  <p className="text-xs text-forest-400">Signed in as {meta.label}</p>
                </div>
                <Badge tone={meta.kyc === 'verified' ? 'success' : 'warning'} dot className="capitalize">
                  {meta.kyc.replace(/_/g, ' ')}
                </Badge>
              </div>

              <div className="mt-6 flex justify-end">
                <Button leftIcon={<Save size={16} />} onClick={() => saved('Account')}>Save changes</Button>
              </div>
            </div>
          )}

          {section === 'notifications' && (
            <div>
              <SectionLabel hint="Choose what we notify you about and where.">Notifications</SectionLabel>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-hair px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-forest">Email</p>
                    <p className="text-xs text-forest-400">Send notifications to {email}</p>
                  </div>
                  <Toggle checked={channelEmail} onChange={setChannelEmail} />
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-hair px-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-forest">In-app & push</p>
                    <p className="text-xs text-forest-400">Show alerts in the notification bell</p>
                  </div>
                  <Toggle checked={channelPush} onChange={setChannelPush} />
                </div>
              </div>

              <hr className="my-6 border-hair" />
              <SectionLabel>What you hear about</SectionLabel>
              <div className="divide-y divide-hair">
                {NOTIF_ROWS.map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-forest">{row.label}</p>
                      <p className="truncate text-xs text-forest-400">{row.hint}</p>
                    </div>
                    <Toggle
                      checked={!!notif[row.key]}
                      onChange={(v) => setNotif((n) => ({ ...n, [row.key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <Button leftIcon={<Save size={16} />} onClick={() => saved('Notification preferences')}>
                  Save preferences
                </Button>
              </div>
            </div>
          )}

          {section === 'security' && (
            <div>
              <SectionLabel hint="Keep your account secure.">Security</SectionLabel>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Current password" className="sm:col-span-2">
                  <Input type="password" placeholder="••••••••" />
                </Field>
                <Field label="New password">
                  <Input type="password" placeholder="At least 8 characters" />
                </Field>
                <Field label="Confirm new password">
                  <Input type="password" placeholder="Re-enter new password" />
                </Field>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="secondary" size="sm" leftIcon={<Check size={15} />} onClick={() => saved('Password')}>
                  Update password
                </Button>
              </div>

              <hr className="my-6 border-hair" />
              <div className="flex items-center justify-between rounded-2xl border border-hair px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-forest">Two-factor authentication</p>
                  <p className="text-xs text-forest-400">Require a one-time code at sign-in</p>
                </div>
                <Toggle checked={twoFA} onChange={setTwoFA} />
              </div>

              <hr className="my-6 border-hair" />
              <SectionLabel>Active sessions</SectionLabel>
              <div className="space-y-2.5">
                {[
                  { device: 'MacBook Pro · Lagos', meta: 'Chrome · this device', current: true },
                  { device: 'iPhone 15 · Lagos', meta: 'GenesysOne app · 2 days ago', current: false },
                ].map((sesh) => (
                  <div key={sesh.device} className="flex items-center justify-between rounded-2xl bg-panel/50 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-forest">{sesh.device}</p>
                      <p className="text-xs text-forest-400">{sesh.meta}</p>
                    </div>
                    {sesh.current ? (
                      <Badge tone="success" dot>Current</Badge>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => toast.info('Session revoked', 'That device has been signed out.')}>
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'appearance' && (
            <div>
              <SectionLabel hint="Personalise how GenesysOne looks for you.">Appearance</SectionLabel>
              <div className="space-y-6">
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-forest-500">Theme</p>
                  <Segmented
                    options={[
                      { value: 'light', label: 'Light' },
                      { value: 'dark', label: 'Dark' },
                      { value: 'system', label: 'System' },
                    ]}
                    value={theme}
                    onChange={setTheme}
                  />
                </div>
                <div>
                  <p className="mb-2 text-[13px] font-semibold text-forest-500">Density</p>
                  <Segmented
                    options={[
                      { value: 'comfortable', label: 'Comfortable' },
                      { value: 'compact', label: 'Compact' },
                    ]}
                    value={density}
                    onChange={setDensity}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button leftIcon={<Save size={16} />} onClick={() => saved('Appearance')}>Save changes</Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
