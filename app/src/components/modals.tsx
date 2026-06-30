import { useState, type ReactNode } from 'react'
import { BadgeCheck, Check, Download, ExternalLink, FileSignature, ImagePlus, Minus, Pencil, Plus, Save, Send, Share2, ShieldCheck, ShoppingCart, Trash2, Wallet } from 'lucide-react'
import {
  Badge,
  Button,
  DatePicker,
  Drawer,
  Field,
  FileField,
  Input,
  KeyValue,
  MineralIcon,
  SectionLabel,
  Select,
  StatusPill,
  Textarea,
  TimePicker,
  useToast,
} from '@/components/ui'
import { useStore, newId } from '@/store/AppStore'
import { BUYER_CO, DIRECTORS, NIGERIAN_STATES, lgasFor } from '@/data/mock'
import { downloadPassportCertificate } from '@/lib/certificate'
import { PassportQR } from '@/components/PassportQR'
import {
  CURRENCY_OPTIONS,
  DELIVERY_MODE,
  FUNDING_METHOD,
  INCOTERMS,
  LOCATION_TYPE,
  MINERALS,
  PAYMENT_TERMS,
  SUPPLY_FREQUENCY,
  TEST_METHOD,
  UNITS,
  type Currency,
  type InventoryItem,
  type MarketListing,
  type Mineral,
  type TestingRequest,
  type Unit,
} from '@/data/types'
import { money } from '@/lib/format'
import { SignatureModal } from '@/components/SignatureModal'

function titleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
const n = (v: string) => Number(v) || 0

const FooterButtons = ({
  onCancel,
  children,
}: {
  onCancel: () => void
  children: ReactNode
}) => (
  <div className="flex justify-end gap-2">
    <Button variant="ghost" onClick={onCancel}>
      Cancel
    </Button>
    {children}
  </div>
)

/* ---------------- Mineral details · view ⇄ edit · add ---------------- */
export function MineralModal({
  open,
  onClose,
  item,
}: {
  open: boolean
  onClose: () => void
  item?: InventoryItem | null
}) {
  const store = useStore()
  const toast = useToast()
  const isExisting = !!item
  const [mode, setMode] = useState<'view' | 'edit'>(item ? 'view' : 'edit')

  const [mineral, setMineral] = useState<Mineral>(item?.mineral ?? 'tin')
  const [grade, setGrade] = useState(item ? String(item.grade) : '')
  const [available, setAvailable] = useState(item ? String(item.available) : '')
  const [unit, setUnit] = useState<Unit>(item?.unit ?? 'ton')
  const [freq, setFreq] = useState<string>(item?.supplyFrequency ?? 'monthly')
  const [locationType, setLocationType] = useState<string>(item?.locationType ?? 'mine')
  const [deliveryMode, setDeliveryMode] = useState<string>(item?.deliveryMode ?? 'delivery')
  const [state, setState] = useState(item?.state ?? 'Plateau')
  const [lga, setLga] = useState(item?.lga ?? lgasFor('Plateau')[0])
  const [image, setImage] = useState<string | undefined>(item?.image)

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  // Discard unsaved edits and return to the read-only view.
  const resetToItem = () => {
    setMineral(item?.mineral ?? 'tin')
    setGrade(item ? String(item.grade) : '')
    setAvailable(item ? String(item.available) : '')
    setUnit(item?.unit ?? 'ton')
    setFreq(item?.supplyFrequency ?? 'monthly')
    setLocationType(item?.locationType ?? 'mine')
    setDeliveryMode(item?.deliveryMode ?? 'delivery')
    setState(item?.state ?? 'Plateau')
    setLga(item?.lga ?? lgasFor('Plateau')[0])
    setImage(item?.image)
    setMode('view')
  }

  const submit = () => {
    const fields = {
      mineral,
      grade: n(grade),
      available: n(available),
      unit,
      supplyFrequency: freq as never,
      locationType: locationType as never,
      deliveryMode: deliveryMode as never,
      state,
      lga,
      image,
    }
    if (isExisting && item) {
      store.updateInventory(item.id, fields)
      toast.success('Mineral updated', `${titleCase(mineral)} inventory saved.`)
    } else {
      const id = newId('inv')
      store.addInventory({ id, updatedAt: 'Just now', ...fields })
      // Adding a mineral sends it straight to compliance for a Digital Passport —
      // no separate "request" step.
      store.requestPassport(id)
      toast.success('Mineral submitted', `${titleCase(mineral)} was sent to compliance for verification.`)
    }
    onClose()
  }

  const inReview = !!item && store.vettingQueue.some((v) => v.inventoryId === item.id && v.status === 'pending')
  // A mineral's compliance state is driven by its Digital Passport — the single
  // source of truth for both the status pill above and the passport panel below.
  const passport = item ? store.passports.find((p) => p.inventoryId === item.id && p.status !== 'rejected') : undefined

  const submitVetting = () => {
    if (!item) return
    store.submitMineralVetting(item.id)
    toast.success('Submitted for vetting', `${titleCase(item.mineral)} was sent to compliance for review.`)
    onClose()
  }

  const title = mode === 'view' ? 'Mineral details' : isExisting ? 'Edit mineral' : 'Add mineral'
  const subtitle =
    mode === 'view'
      ? 'Review this inventory item.'
      : isExisting
        ? 'Update this inventory item.'
        : 'Stock a new mineral into your inventory.'

  const footer =
    mode === 'view' ? (
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {item?.vetting === 'pending' && !inReview && (
          <Button variant="secondary" leftIcon={<ShieldCheck size={16} />} onClick={submitVetting}>
            Submit for vetting
          </Button>
        )}
        <Button leftIcon={<Pencil size={16} />} onClick={() => setMode('edit')}>
          Edit mineral
        </Button>
      </div>
    ) : (
      <FooterButtons onCancel={isExisting ? resetToItem : onClose}>
        <Button leftIcon={isExisting ? <Save size={16} /> : <Check size={16} />} onClick={submit}>
          {isExisting ? 'Save changes' : 'Save to inventory'}
        </Button>
      </FooterButtons>
    )

  return (
    <Drawer open={open} onClose={onClose} title={title} subtitle={subtitle} footer={footer}>
      {mode === 'view' && item ? (
        <>
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-panel/60 p-4">
            <MineralIcon mineral={item.mineral} src={item.image} shape="rounded" size="xl" />
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold capitalize text-forest">{item.mineral}</p>
              <p className="mt-0.5 text-xs text-forest-400">Updated {item.updatedAt}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <StatusPill
                status={passport?.status ?? (item.vetting === 'approved' ? 'verified' : inReview ? 'in_verification' : 'pending')}
              />
            </div>
          </div>

          <SectionLabel>Product details</SectionLabel>
          <dl className="grid grid-cols-2 gap-4">
            <KeyValue label="Grade" value={`${item.grade}%`} />
            <KeyValue label="Available" value={`${item.available} ${item.unit}`} />
            <KeyValue label="Unit" value={<span className="capitalize">{item.unit}</span>} />
            <KeyValue label="Supply frequency" value={<span className="capitalize">{item.supplyFrequency}</span>} />
          </dl>

          <hr className="my-5 border-hair" />
          <SectionLabel>Storage location</SectionLabel>
          <dl className="grid grid-cols-2 gap-4">
            <KeyValue label="Location type" value={<span className="capitalize">{item.locationType}</span>} />
            <KeyValue label="Delivery mode" value={<span className="capitalize">{item.deliveryMode}</span>} />
            <KeyValue label="State" value={item.state} />
            <KeyValue label="LGA" value={item.lga} />
          </dl>

          <hr className="my-5 border-hair" />
          <SectionLabel>Digital Mineral Passport</SectionLabel>
          {(() => {
            // Created-account minerals receive their passport through Compliance vetting.
            if (item.vetting) {
              if (item.vetting === 'approved' && item.passportNumber) {
                return (
                  <div className="flex items-center justify-between rounded-2xl border border-teal/30 bg-teal-soft/40 p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-forest">Digital Passport issued</p>
                      <p className="font-mono text-xs text-forest-400">{item.passportNumber}</p>
                    </div>
                    <BadgeCheck size={20} className="text-teal" />
                  </div>
                )
              }
              return (
                <div className="rounded-2xl border border-dashed border-hair bg-panel/40 p-4 text-center">
                  <ShieldCheck size={22} className="mx-auto text-forest-300" />
                  <p className="mt-2 text-sm font-medium text-forest">{inReview ? 'Vetting in progress' : 'Awaiting vetting'}</p>
                  <p className="mt-0.5 text-xs text-forest-400">
                    {inReview
                      ? 'Compliance is reviewing this mineral. A Digital Passport is issued once approved.'
                      : 'Submit this mineral for vetting to receive a Digital Passport before listing.'}
                  </p>
                </div>
              )
            }
            if (!passport) {
              return (
                <div className="rounded-2xl border border-dashed border-hair bg-panel/40 p-4 text-center">
                  <ShieldCheck size={22} className="mx-auto text-forest-300" />
                  <p className="mt-2 text-sm font-medium text-forest">Sent to compliance</p>
                  <p className="mt-0.5 text-xs text-forest-400">
                    This batch is queued for on-field verification and a blockchain-anchored passport.
                  </p>
                </div>
              )
            }
            if (passport.status === 'verified') {
              const url = `${window.location.origin}/passport/${passport.number}`
              return (
                <div className="rounded-2xl border border-teal/30 bg-teal-soft/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <BadgeCheck size={18} className="shrink-0 text-teal" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-teal">Verified &amp; anchored</p>
                        <p className="font-mono text-xs text-forest-400">{passport.number}</p>
                      </div>
                    </div>
                    <StatusPill status={passport.status} />
                  </div>
                  <div className="mt-4 flex flex-col items-center gap-1.5">
                    <div className="rounded-2xl border border-hair bg-white p-2.5">
                      <PassportQR value={url} size={144} />
                    </div>
                    <p className="text-[11px] text-forest-400">Scan to view the public passport</p>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <Button size="sm" variant="secondary" leftIcon={<ExternalLink size={14} />} onClick={() => window.open(`/passport/${passport.number}`, '_blank')}>
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      leftIcon={<Share2 size={14} />}
                      onClick={() => {
                        navigator.clipboard?.writeText(url)
                        toast.success('Public link copied', url)
                      }}
                    >
                      Copy link
                    </Button>
                    <Button size="sm" variant="secondary" leftIcon={<Download size={14} />} onClick={() => downloadPassportCertificate(passport)}>
                      Certificate
                    </Button>
                  </div>
                </div>
              )
            }
            return (
              <div className="flex items-center justify-between rounded-2xl border border-hair bg-panel/40 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-forest">Verification in progress</p>
                  <p className="font-mono text-xs text-forest-400">{passport.number}</p>
                </div>
                <StatusPill status={passport.status} />
              </div>
            )
          })()}
        </>
      ) : (
        <>
          <SectionLabel>Product photo</SectionLabel>
          <div className="mb-5">
            {image ? (
              <div className="flex items-center gap-4">
                <img
                  src={image}
                  alt="Product"
                  className="h-24 w-24 rounded-2xl object-cover outline outline-1 -outline-offset-1 outline-black/10"
                />
                <div className="flex flex-col gap-2">
                  <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-hair px-3 py-2 text-xs font-semibold text-forest-500 transition-colors hover:bg-panel">
                    <ImagePlus size={14} /> Change photo
                    <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
                  </label>
                  <button
                    type="button"
                    onClick={() => setImage(undefined)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-hair px-3 py-2 text-xs font-semibold text-rose-ink transition-colors hover:bg-rose-soft/40"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-hair bg-panel/40 text-center transition-colors hover:border-forest-300 hover:bg-panel">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-forest-400 shadow-card">
                  <ImagePlus size={18} />
                </span>
                <span className="text-sm font-semibold text-forest">Add a product photo</span>
                <span className="text-xs text-forest-400">PNG or JPG · shown on inventory &amp; listings</span>
                <input type="file" accept="image/*" className="hidden" onChange={onPickImage} />
              </label>
            )}
          </div>

          <SectionLabel>Product details</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Mineral" required className="sm:col-span-2">
              <Select value={mineral} onChange={(e) => setMineral(e.target.value as Mineral)}>
                {MINERALS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
              </Select>
            </Field>
            <Field label="Grade (%)" required>
              <Input type="number" placeholder="0 – 100" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </Field>
            <Field label="Unit" required>
              <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </Select>
            </Field>
            <Field label="Available quantity" required>
              <Input type="number" placeholder="0" value={available} onChange={(e) => setAvailable(e.target.value)} />
            </Field>
            <Field label="Supply frequency" required>
              <Select value={freq} onChange={(e) => setFreq(e.target.value)}>
                {SUPPLY_FREQUENCY.map((f) => <option key={f} value={f} className="capitalize">{f}</option>)}
              </Select>
            </Field>
          </div>

          <hr className="my-5 border-hair" />
          <SectionLabel>Storage location</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Location type" required>
              <Select value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                {LOCATION_TYPE.map((l) => <option key={l} value={l} className="capitalize">{l}</option>)}
              </Select>
            </Field>
            <Field label="Delivery mode" required>
              <Select value={deliveryMode} onChange={(e) => setDeliveryMode(e.target.value)}>
                {DELIVERY_MODE.map((d) => <option key={d} value={d} className="capitalize">{d}</option>)}
              </Select>
            </Field>
            <Field label="State" required>
              <Select value={state} onChange={(e) => { setState(e.target.value); setLga(lgasFor(e.target.value)[0]) }}>
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="LGA" required>
              <Select value={lga} onChange={(e) => setLga(e.target.value)}>
                {lgasFor(state).map((l) => <option key={l}>{l}</option>)}
              </Select>
            </Field>
          </div>
        </>
      )}
    </Drawer>
  )
}

/* ---------------- Request Sampling ---------------- */
export function SamplingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore()
  const toast = useToast()
  const [mineral, setMineral] = useState<Mineral>('tin')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [contact, setContact] = useState('')
  const [state, setState] = useState('Plateau')
  const [lga, setLga] = useState(lgasFor('Plateau')[0])

  const submit = () => {
    store.addSampling({
      id: newId('sr'),
      mineral,
      date: date || 'Just now',
      time: time || '—',
      contactName: contact || 'Contact',
      state,
      lga,
      status: 'pending',
    })
    toast.success('Sampling scheduled', `On-site sampling booked for ${titleCase(mineral)}.`)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Request sampling"
      subtitle="Schedule an on-site sampling visit."
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Check size={16} />} onClick={submit}>Schedule visit</Button>
        </FooterButtons>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mineral" required className="sm:col-span-2">
          <Select value={mineral} onChange={(e) => setMineral(e.target.value as Mineral)}>
            {MINERALS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
          </Select>
        </Field>
        <Field label="Date" required><DatePicker value={date} onChange={setDate} /></Field>
        <Field label="Time" required><TimePicker value={time} onChange={setTime} /></Field>
        <Field label="Contact person" required><Input placeholder="First and last name" value={contact} onChange={(e) => setContact(e.target.value)} /></Field>
        <Field label="Contact phone" required><Input placeholder="+234 800 000 0000" /></Field>
        <Field label="State" required>
          <Select value={state} onChange={(e) => { setState(e.target.value); setLga(lgasFor(e.target.value)[0]) }}>
            {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="LGA" required>
          <Select value={lga} onChange={(e) => setLga(e.target.value)}>
            {lgasFor(state).map((l) => <option key={l}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Sampling address" required className="sm:col-span-2"><Input placeholder="Street, area" /></Field>
        <Field label="Landmark" optional className="sm:col-span-2"><Input placeholder="Nearby landmark" /></Field>
      </div>
    </Drawer>
  )
}

/* ---------------- Create Listing ---------------- */
export function CreateListingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore()
  const toast = useToast()
  // Only vetted (approved) minerals can be listed on the marketplace.
  const vettedMinerals = [...new Set(store.inventory.filter((i) => i.vetting !== 'pending').map((i) => i.mineral))]
  const noVetted = vettedMinerals.length === 0
  const [mineral, setMineral] = useState<Mineral>(vettedMinerals[0] ?? 'tin')
  const [grade, setGrade] = useState('71.4')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<Unit>('ton')
  const [currency, setCurrency] = useState<Currency>('NGN')
  const [amount, setAmount] = useState('')
  const [state, setState] = useState('Plateau')

  const submit = () => {
    if (noVetted) {
      toast.error('No vetted minerals', 'Add a mineral and pass review before publishing a listing.')
      return
    }
    const qty = n(quantity) || 1
    const image = store.inventory.find((i) => i.mineral === mineral)?.image
    store.addListing({
      id: newId('lst'),
      mineral,
      grade: n(grade),
      quantity: qty,
      unit,
      priceAmount: n(amount) * qty,
      priceCurrency: currency,
      state,
      // The mineral already carries a verified passport, so the listing goes
      // live on the marketplace immediately — no separate approval step.
      status: 'approved',
      certified: false,
      image,
      createdAt: 'Just now',
    })
    toast.success('Listing published', `${titleCase(mineral)} is now live on the marketplace.`)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Create listing"
      subtitle="Only vetted minerals from your inventory can be listed."
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Plus size={16} />} onClick={submit} disabled={noVetted}>Publish listing</Button>
        </FooterButtons>
      }
    >
      <SectionLabel>Add your product</SectionLabel>
      {noVetted && (
        <div className="mb-4 rounded-2xl border border-orange/30 bg-orange-soft/40 px-4 py-3 text-sm text-forest-500">
          You don't have any vetted minerals yet. Add a mineral and submit it for vetting — once approved it can be listed.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mineral" required hint="Vetted inventory only" className="sm:col-span-2">
          <Select value={mineral} onChange={(e) => setMineral(e.target.value as Mineral)}>
            {vettedMinerals.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
          </Select>
        </Field>
        <Field label="Grade (%)" required><Input type="number" value={grade} onChange={(e) => setGrade(e.target.value)} /></Field>
        <Field label="Unit" required>
          <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </Select>
        </Field>
        <Field label="Available quantity" required hint="Must not exceed inventory" className="sm:col-span-2">
          <Input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </Field>
        <Field label="Delivery mode" required>
          <Select>{DELIVERY_MODE.map((d) => <option key={d} className="capitalize">{d}</option>)}</Select>
        </Field>
        <Field label="Location type" required>
          <Select>{LOCATION_TYPE.map((l) => <option key={l} className="capitalize">{l}</option>)}</Select>
        </Field>
        <Field label="State" required>
          <Select value={state} onChange={(e) => setState(e.target.value)}>
            {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Address" required><Input placeholder="Pickup / delivery address" /></Field>
      </div>

      <hr className="my-5 border-hair" />
      <SectionLabel>Pricing</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Currency" required>
          <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
            {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </Select>
        </Field>
        <Field label="Amount (per unit)" required>
          <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <Badge tone="lime" dot>Per-unit pricing</Badge>
        <span className="text-xs text-forest-400">Stored in the smallest currency unit.</span>
      </div>
    </Drawer>
  )
}

/* ---------------- Request Testing ---------------- */
export function RequestTestingModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore()
  const toast = useToast()
  const [mineral, setMineral] = useState<Mineral>('tin')
  const [grade, setGrade] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [state, setState] = useState('Plateau')
  const [lga, setLga] = useState(lgasFor('Plateau')[0])
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')

  const submit = () => {
    store.addTestingRequest({
      id: newId('tr'),
      batchId: `BTH-${mineral.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      mineral,
      gradeClaimed: n(grade),
      quantity: 0,
      unit: 'ton',
      requester: 'Jos Highland Minerals Ltd',
      requesterRole: 'seller',
      date: date || 'Scheduled',
      time: time || '—',
      state,
      lga,
      address: 'Sampling location',
      deliveryMode: 'on_site_sampling',
      contactName: contact || 'Contact',
      contactPhone: phone || '+234 800 000 0000',
      status: 'incoming',
    })
    toast.success('Testing request sent', `${titleCase(mineral)} batch is in the lab queue.`)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Request testing"
      subtitle="An accredited lab will sample and certify this batch."
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Send size={16} />} onClick={submit}>Submit request</Button>
        </FooterButtons>
      }
    >
      <SectionLabel>Mineral information</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mineral" required>
          <Select value={mineral} onChange={(e) => setMineral(e.target.value as Mineral)}>
            {MINERALS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
          </Select>
        </Field>
        <Field label="Grade (claimed %)" optional>
          <Input type="number" placeholder="e.g. 71.4" value={grade} onChange={(e) => setGrade(e.target.value)} />
        </Field>
      </div>
      <hr className="my-5 border-hair" />
      <SectionLabel>Test schedule</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date" required><DatePicker value={date} onChange={setDate} /></Field>
        <Field label="Time" required><TimePicker value={time} onChange={setTime} /></Field>
      </div>
      <hr className="my-5 border-hair" />
      <SectionLabel>Sampling location</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="State" required>
          <Select value={state} onChange={(e) => { setState(e.target.value); setLga(lgasFor(e.target.value)[0]) }}>
            {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="LGA" required>
          <Select value={lga} onChange={(e) => setLga(e.target.value)}>
            {lgasFor(state).map((l) => <option key={l}>{l}</option>)}
          </Select>
        </Field>
        <Field label="Address" required className="sm:col-span-2"><Input placeholder="Sampling address" /></Field>
      </div>
      <hr className="my-5 border-hair" />
      <SectionLabel>Contact details</SectionLabel>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Contact person" required><Input placeholder="Full name" value={contact} onChange={(e) => setContact(e.target.value)} /></Field>
        <Field label="Contact phone" required><Input placeholder="+234 800 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
      </div>
    </Drawer>
  )
}

/* ---------------- Conduct Test → Record results ---------------- */
export function ConductResultModal({
  open,
  onClose,
  request,
}: {
  open: boolean
  onClose: () => void
  request: TestingRequest | null
}) {
  const store = useStore()
  const toast = useToast()
  const [grade, setGrade] = useState('')
  const [purity, setPurity] = useState('')
  const [method, setMethod] = useState('xrf')
  const [signedBy, setSignedBy] = useState(DIRECTORS[0].name)
  const [signature, setSignature] = useState<string | null>(null)
  const [sigOpen, setSigOpen] = useState(false)

  const submit = () => {
    if (!request) return
    store.submitTestResult({
      requestId: request.id,
      batchId: request.batchId,
      mineral: request.mineral,
      gradeMeasured: n(grade) || request.gradeClaimed,
      purity: purity || 'Within specification',
      method: method as never,
      signedBy,
    })
    toast.success('Results published', `Certificate for ${request.batchId} is now linked.`)
    setSignature(null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Conduct test & upload results"
      subtitle={request ? `${request.batchId} · ${request.requester}` : ''}
      size="lg"
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Send size={16} />} onClick={submit} disabled={!signature}>
            Submit results
          </Button>
        </FooterButtons>
      }
    >
      {request && (
        <>
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-panel/60 p-4">
            <MineralIcon mineral={request.mineral} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold capitalize text-forest">{request.mineral}</p>
              <p className="font-mono text-xs text-forest-400">{request.batchId}</p>
            </div>
            <KeyValue label="Claimed" value={`${request.gradeClaimed}%`} />
          </div>

          <SectionLabel>Input test results</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Grade (measured %)" required>
              <Input type="number" placeholder="0 – 100" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </Field>
            <Field label="Method of testing" required>
              <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                {TEST_METHOD.map((m) => <option key={m} value={m} className="uppercase">{m}</option>)}
              </Select>
            </Field>
            {method === 'other' && (
              <Field label="Specify method" required className="sm:col-span-2">
                <Input placeholder="Describe the testing method" />
              </Field>
            )}
            <Field label="Purity / contaminants report" required className="sm:col-span-2">
              <Textarea rows={4} placeholder="Describe purity, contaminants and anomalies…" value={purity} onChange={(e) => setPurity(e.target.value)} />
            </Field>
          </div>

          <hr className="my-5 border-hair" />
          <SectionLabel>Attachments</SectionLabel>
          <div className="grid gap-4">
            <Field label="Supporting documents" required hint="At least one PDF or CSV">
              <FileField label="Assay reports" multiple caption="PDF or CSV · up to 10MB each" />
            </Field>
            <Field label="Images" optional>
              <FileField label="Sample images" multiple caption="JPG or PNG · up to 10MB each" />
            </Field>
          </div>

          <hr className="my-5 border-hair" />
          <SectionLabel>Sign-off</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Signing personnel" required>
              <Select value={signedBy} onChange={(e) => setSignedBy(e.target.value)}>
                {DIRECTORS.map((d) => <option key={d.id}>{d.name}</option>)}
              </Select>
            </Field>
            <Field label="Digital sign-off" required>
              {signature ? (
                <button
                  type="button"
                  onClick={() => setSigOpen(true)}
                  className="group flex h-12 w-full items-center gap-3 rounded-2xl border border-teal/30 bg-teal-soft p-1.5 pr-3.5 text-sm font-semibold text-teal transition-colors"
                >
                  <span className="flex h-9 w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white outline outline-1 -outline-offset-1 outline-black/10">
                    <img src={signature} alt="Signature" className="h-8 w-auto max-w-full object-contain" />
                  </span>
                  <span className="flex items-center gap-1.5"><Check size={15} /> Signed</span>
                  <span className="ml-auto text-xs font-medium text-teal/70 group-hover:underline">Replace</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setSigOpen(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-hair bg-panel/40 text-sm font-semibold text-forest-500 transition-colors hover:border-forest-300"
                >
                  <FileSignature size={16} />
                  Tap to sign
                </button>
              )}
            </Field>
          </div>
        </>
      )}

      <SignatureModal open={sigOpen} onClose={() => setSigOpen(false)} onSave={setSignature} />
    </Drawer>
  )
}

/* ---------------- Add Funds ---------------- */
export function AddFundsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore()
  const toast = useToast()
  const [method, setMethod] = useState('bank_transfer')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<Currency>('NGN')

  const submit = () => {
    const value = n(amount)
    if (value <= 0) {
      toast.error('Enter an amount', 'Please enter a deposit amount greater than zero.')
      return
    }
    store.deposit(value, currency, method as never)
    toast.success('Funds added', `${money(value, currency)} added to your wallet.`)
    onClose()
    setAmount('')
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add funds"
      subtitle="Top up your wallet to fund trades."
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Check size={16} />} onClick={submit}>Confirm deposit</Button>
        </FooterButtons>
      }
    >
      <div className="space-y-4">
        <Field label="Funding method" required>
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            {FUNDING_METHOD.map((m) => <option key={m} value={m} className="capitalize">{m.replace(/_/g, ' ')}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-[1fr_130px] gap-3">
          <Field label="Amount" required>
            <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Currency" required>
            <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
              {CURRENCY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
          </Field>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="lime" dot>Idempotent</Badge>
          <span className="text-xs text-forest-400">Each deposit uses a unique reference key.</span>
        </div>
      </div>
    </Drawer>
  )
}

/* ---------------- Withdraw ---------------- */
export function WithdrawModal({
  open,
  onClose,
  lab,
  balance,
}: {
  open: boolean
  onClose: () => void
  lab?: boolean
  balance: number
}) {
  const store = useStore()
  const toast = useToast()
  const [amount, setAmount] = useState('')

  const submit = () => {
    const value = n(amount)
    const ok = store.withdraw(value, 'NGN', lab)
    if (ok) {
      toast.success('Withdrawal requested', `${money(value)} is on its way to your account.`)
      onClose()
      setAmount('')
    } else {
      toast.error('Withdrawal failed', 'Amount must be positive and within your balance.')
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Withdraw funds"
      subtitle="Send available balance to a destination account."
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Minus size={16} />} onClick={submit}>Confirm withdrawal</Button>
        </FooterButtons>
      }
    >
      <div className="space-y-4">
        <div className="rounded-2xl bg-panel/60 px-4 py-3 text-sm">
          <span className="text-forest-400">Available · </span>
          <span className="tnum font-semibold text-forest">{money(balance)}</span>
        </div>
        <Field label="Amount" required hint="Cannot exceed available balance">
          <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Destination account" required>
          <Input placeholder="Bank account number" />
        </Field>
      </div>
    </Drawer>
  )
}

/* ---------------- Send RFQ ---------------- */
export function RfqModal({
  open,
  onClose,
  mineral: initialMineral,
  seller,
}: {
  open: boolean
  onClose: () => void
  mineral?: string
  seller?: string
}) {
  const store = useStore()
  const toast = useToast()
  const [mineral, setMineral] = useState<Mineral>((initialMineral as Mineral) ?? 'tin')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<Unit>('ton')
  const [incoterms, setIncoterms] = useState('fob')
  const [payment, setPayment] = useState('wallet')
  const [state, setState] = useState('Lagos')
  const [timeline, setTimeline] = useState('')

  const submit = () => {
    store.addRfq({
      id: newId('r'),
      mineral,
      quantity: n(quantity) || 1,
      unit,
      seller: seller ?? 'Marketplace seller',
      buyer: BUYER_CO,
      incoterms: incoterms as never,
      paymentTerms: payment as never,
      deliveryState: state,
      timeline: timeline || 'TBD',
      status: 'pending',
      createdAt: 'Just now',
    })
    toast.success('RFQ sent', `Quote requested from ${seller ?? 'the seller'}.`)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Send RFQ"
      subtitle={seller ? `Request a quote from ${seller}` : 'Request a quote for a mineral'}
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Send size={16} />} onClick={submit}>Send request</Button>
        </FooterButtons>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mineral type" required className="sm:col-span-2">
          <Select value={mineral} onChange={(e) => setMineral(e.target.value as Mineral)}>
            {MINERALS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
          </Select>
        </Field>
        <Field label="Quantity" required><Input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
        <Field label="Unit" required>
          <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </Select>
        </Field>
        <Field label="Preferred incoterms" required>
          <Select value={incoterms} onChange={(e) => setIncoterms(e.target.value)}>
            {INCOTERMS.map((i) => <option key={i} value={i}>{i.toUpperCase()}</option>)}
          </Select>
        </Field>
        <Field label="Payment terms" required>
          <Select value={payment} onChange={(e) => setPayment(e.target.value)}>
            {PAYMENT_TERMS.map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
          </Select>
        </Field>
        <Field label="Delivery state" required>
          <Select value={state} onChange={(e) => setState(e.target.value)}>
            {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Expected timeline" required hint="Not in the past">
          <DatePicker value={timeline} onChange={setTimeline} />
        </Field>
        <Field label="Delivery address" required className="sm:col-span-2"><Input placeholder="Street, area" /></Field>
      </div>
    </Drawer>
  )
}

/* ---------------- Request Sample ---------------- */
export function SampleModal({
  open,
  onClose,
  mineral: initialMineral,
  seller,
}: {
  open: boolean
  onClose: () => void
  mineral?: string
  seller?: string
}) {
  const store = useStore()
  const toast = useToast()
  const [mineral, setMineral] = useState<Mineral>((initialMineral as Mineral) ?? 'tin')
  const [quantity, setQuantity] = useState('')
  const [unit, setUnit] = useState<Unit>('kg')
  const [courier, setCourier] = useState('')

  const submit = () => {
    store.addSampleRequest({
      id: newId('sm'),
      mineral,
      quantity: n(quantity) || 1,
      unit,
      seller: seller ?? 'Marketplace seller',
      buyer: BUYER_CO,
      courier: courier || 'GIG Logistics',
      status: 'pending',
      createdAt: 'Just now',
    })
    toast.success('Sample requested', `Sample request sent to ${seller ?? 'the seller'}.`)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Request sample"
      subtitle={seller ? `From ${seller}` : 'Request a physical sample from a listing'}
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<Send size={16} />} onClick={submit}>Request sample</Button>
        </FooterButtons>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mineral type" required className="sm:col-span-2">
          <Select value={mineral} onChange={(e) => setMineral(e.target.value as Mineral)}>
            {MINERALS.map((m) => <option key={m} value={m} className="capitalize">{m}</option>)}
          </Select>
        </Field>
        <Field label="Quantity" required><Input type="number" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></Field>
        <Field label="Unit" required>
          <Select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </Select>
        </Field>
        <Field label="Delivery address" required className="sm:col-span-2"><Input placeholder="Where should we ship the sample?" /></Field>
        <Field label="Preferred courier" optional className="sm:col-span-2">
          <Input placeholder="e.g. GIG Logistics, DHL" value={courier} onChange={(e) => setCourier(e.target.value)} />
        </Field>
        <Field label="Contact person" required><Input placeholder="Full name" /></Field>
        <Field label="Contact phone" required><Input placeholder="+234 800 000 0000" /></Field>
      </div>
    </Drawer>
  )
}

/* ---------------- Buy / Checkout ---------------- */
export function BuyModal({
  open,
  onClose,
  listing,
}: {
  open: boolean
  onClose: () => void
  listing: MarketListing | null
}) {
  const store = useStore()
  const toast = useToast()
  const [qty, setQty] = useState('')

  if (!listing) return null

  const unitPrice = Math.round(listing.priceAmount / listing.quantity)
  const quantity = Math.min(Math.max(n(qty) || listing.quantity, 1), listing.quantity)
  const value = unitPrice * quantity
  const balance = listing.priceCurrency === 'NGN' ? store.walletNGN : store.walletUSD
  const insufficient = value > balance

  const submit = () => {
    const ok = store.placeOrder({
      mineral: listing.mineral,
      grade: listing.grade,
      quantity,
      unit: listing.unit,
      value,
      currency: listing.priceCurrency,
      seller: listing.sellerName,
      certified: listing.certified,
    })
    if (ok) {
      toast.success('Order placed', `${money(value, listing.priceCurrency)} held in escrow for ${listing.sellerName}.`)
      onClose()
      setQty('')
    } else {
      toast.error('Insufficient funds', 'Top up your wallet to cover the escrow amount.')
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Buy now"
      subtitle={`Order ${titleCase(listing.mineral)} from ${listing.sellerName}`}
      footer={
        <FooterButtons onCancel={onClose}>
          <Button leftIcon={<ShoppingCart size={16} />} onClick={submit} disabled={insufficient}>
            Fund escrow & order
          </Button>
        </FooterButtons>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-2xl bg-panel/60 p-4">
        <MineralIcon mineral={listing.mineral} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 font-semibold capitalize text-forest">
            {listing.mineral}
            {listing.certified && <BadgeCheck size={15} className="text-teal" />}
          </p>
          <p className="text-xs text-forest-400">Grade {listing.grade}% · {listing.state}</p>
        </div>
        <KeyValue label="Per unit" value={money(unitPrice, listing.priceCurrency)} />
      </div>

      <SectionLabel>Order quantity</SectionLabel>
      <Field label={`Quantity (${listing.unit})`} required hint={`${listing.quantity} ${listing.unit} available`}>
        <Input
          type="number"
          placeholder={String(listing.quantity)}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
      </Field>

      <hr className="my-5 border-hair" />
      <SectionLabel>Escrow summary</SectionLabel>
      <dl className="space-y-2.5 rounded-2xl border border-hair p-4 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-forest-400">{quantity} {listing.unit} × {money(unitPrice, listing.priceCurrency)}</dt>
          <dd className="tnum font-semibold text-forest">{money(value, listing.priceCurrency)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-hair pt-2.5">
          <dt className="flex items-center gap-1.5 text-forest-400"><Wallet size={14} /> Wallet balance</dt>
          <dd className={'tnum font-semibold ' + (insufficient ? 'text-rose-ink' : 'text-forest')}>
            {money(balance, listing.priceCurrency)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-lg bg-teal-soft px-2 py-1 text-xs font-semibold text-teal">
          <ShieldCheck size={12} /> Escrow protected
        </span>
        <span className="text-xs text-forest-400">
          {insufficient ? 'Not enough wallet balance to fund this order.' : 'Funds release to the seller once you confirm delivery.'}
        </span>
      </div>
    </Drawer>
  )
}
