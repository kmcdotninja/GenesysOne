import { Fragment, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import {
  Avatar,
  Button,
  DatePicker,
  Field,
  FileField,
  Input,
  Select,
  SectionLabel,
  Textarea,
  faceUrl,
  useToast,
} from '@/components/ui'
import { ID_DOCUMENT_TYPE, INCORPORATION_TYPE } from '@/data/types'
import { DIRECTORS, NIGERIAN_STATES, lgasFor } from '@/data/mock'
import { newId } from '@/store/AppStore'
import { cn } from '@/lib/cn'

function titleCase(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

interface KycPerson {
  id: string
  firstName: string
  lastName: string
  role: string
  dob: string
  nationality: string
  email: string
  phone: string
}

type PersonForm = Omit<KycPerson, 'id' | 'role'>

const EMPTY_FORM: PersonForm = {
  firstName: '',
  lastName: '',
  dob: '',
  nationality: 'Nigeria',
  email: '',
  phone: '',
}

const fullName = (p: KycPerson) => `${p.firstName} ${p.lastName}`.trim()

function seedPeople(): KycPerson[] {
  return DIRECTORS.map((d) => {
    const [firstName, ...rest] = d.name.split(' ')
    return {
      id: d.id,
      firstName,
      lastName: rest.join(' '),
      role: d.role,
      dob: '',
      nationality: 'Nigeria',
      email: '',
      phone: '',
    }
  })
}

function VerifyChip({ label }: { label: string }) {
  const [verified, setVerified] = useState(label === 'NIN' || label === 'BVN')
  return (
    <button
      type="button"
      onClick={() => setVerified((v) => !v)}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
        verified ? 'bg-teal-soft text-teal' : 'border border-hair bg-white text-forest-400 hover:border-forest-300',
      )}
    >
      {verified ? <Check size={13} strokeWidth={3} /> : null}
      {label} {verified ? 'verified' : '· verify'}
    </button>
  )
}

function HStepper({
  steps,
  current,
  onSelect,
}: {
  steps: { title: string; label: string }[]
  current: number
  onSelect: (i: number) => void
}) {
  return (
    <div className="flex items-center">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        const last = i === steps.length - 1
        return (
          <Fragment key={s.title}>
            <button onClick={() => onSelect(i)} className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold transition-all',
                  done && 'bg-forest text-white',
                  active && 'bg-forest text-white ring-4 ring-lime-100',
                  !done && !active && 'bg-panel text-forest-300',
                )}
              >
                {done ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={cn('hidden text-sm font-semibold sm:block', active ? 'text-forest' : done ? 'text-forest-500' : 'text-forest-300')}>
                {s.label}
              </span>
            </button>
            {!last && <span className={cn('mx-3 h-px flex-1', done ? 'bg-forest-200' : 'bg-hair')} />}
          </Fragment>
        )
      })}
    </div>
  )
}

export function KycFlow({
  variant = 'company',
  onClose,
}: {
  variant?: 'company' | 'lab'
  onClose?: () => void
}) {
  const toast = useToast()
  const [step, setStep] = useState(0)
  const [state, setState] = useState('Plateau')
  const [lga, setLga] = useState(lgasFor('Plateau')[0])
  const [people, setPeople] = useState<KycPerson[]>(seedPeople)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PersonForm>(EMPTY_FORM)

  const isLab = variant === 'lab'
  const profileLabel = isLab ? 'Lab Profile' : 'Company Profile'
  const peopleLabel = isLab ? 'Authorized Personnel' : 'Directors'
  const personLabel = isLab ? 'personnel' : 'director'

  const setField = (key: keyof PersonForm, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const startEdit = (p: KycPerson) => {
    setEditingId(p.id)
    setForm({
      firstName: p.firstName,
      lastName: p.lastName,
      dob: p.dob,
      nationality: p.nationality,
      email: p.email,
      phone: p.phone,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const savePerson = () => {
    if (!form.firstName.trim() && !form.lastName.trim()) {
      toast.error('Name required', `Enter the ${personLabel}'s name to continue.`)
      return
    }
    const name = `${form.firstName} ${form.lastName}`.trim()
    if (editingId) {
      setPeople((ps) => ps.map((p) => (p.id === editingId ? { ...p, ...form } : p)))
      toast.success(`${titleCase(personLabel)} updated`, `${name}'s details were saved.`)
    } else {
      setPeople((ps) => [...ps, { id: newId('dir'), role: titleCase(personLabel), ...form }])
      toast.success(`${titleCase(personLabel)} added`, `${name} was added to ${peopleLabel.toLowerCase()}.`)
    }
    cancelEdit()
  }

  const removePerson = (id: string) => {
    setPeople((ps) => ps.filter((p) => p.id !== id))
    if (editingId === id) cancelEdit()
  }

  const steps = [
    { title: 'Step 1', label: profileLabel },
    { title: 'Step 2', label: peopleLabel },
    { title: 'Step 3', label: 'Verification' },
  ]

  const submit = () => {
    toast.success('KYC submitted', 'Your verification is now under review.')
    onClose?.()
  }

  return (
    <div>
      <HStepper steps={steps} current={step} onSelect={setStep} />

      <div className="mt-7">
        {step === 0 && (
          <div>
            <SectionLabel hint={`Submit the ${isLab ? 'lab' : 'company'}'s registration details exactly as they appear on the documents.`}>
              {profileLabel}
            </SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={isLab ? 'Lab Name' : 'Company Name'} required className="sm:col-span-2">
                <Input defaultValue={isLab ? 'Geneva Assay Laboratories' : 'Jos Highland Minerals Ltd'} />
              </Field>
              <Field label="Description" optional className="sm:col-span-2">
                <Textarea rows={3} defaultValue="Accredited minerals operation across Nigeria's tin belt." />
              </Field>
              <Field label="Address" required className="sm:col-span-2">
                <Input defaultValue="Plot 14, Mining Belt Road" />
              </Field>
              <Field label="State" required>
                <Select value={state} onChange={(e) => { setState(e.target.value); setLga(lgasFor(e.target.value)[0]) }}>
                  {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="LGA" required hint="Filtered by the selected state">
                <Select value={lga} onChange={(e) => setLga(e.target.value)}>
                  {lgasFor(state).map((l) => <option key={l}>{l}</option>)}
                </Select>
              </Field>
              {isLab && (
                <Field label="Country" required>
                  <Select defaultValue="Nigeria"><option>Nigeria</option><option>Ghana</option><option>South Africa</option></Select>
                </Field>
              )}
            </div>

            <hr className="my-6 border-hair" />
            <SectionLabel>Other {isLab ? 'Lab' : 'Company'} Details</SectionLabel>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Incorporation Type" required>
                <Select>{INCORPORATION_TYPE.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}</Select>
              </Field>
              <Field label="Incorporation Date" required>
                <DatePicker defaultValue="2019-04-12" />
              </Field>
              <Field label="TIN" optional>
                <Input placeholder="e.g. 01234567-0001" />
              </Field>
              <Field label="Incorporation Document" required>
                <FileField label="CAC certificate" />
              </Field>
              {isLab && (
                <Field label="Accreditation Documents" required className="sm:col-span-2">
                  <FileField label="Accreditation documents" multiple caption="PDF, JPG, PNG or CSV · up to 10MB each" />
                </Field>
              )}
              <Field label="Proof of Business Address" optional className="sm:col-span-2">
                <FileField label="Utility bill or bank statement" />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <SectionLabel hint={`Add at least one ${personLabel}.`}>{peopleLabel}' Details</SectionLabel>
            <div className="space-y-3">
              {people.length === 0 && (
                <p className="rounded-2xl border border-dashed border-hair px-4 py-6 text-center text-sm text-forest-400">
                  No {personLabel}s added yet.
                </p>
              )}
              {people.map((p) => {
                const editing = editingId === p.id
                return (
                  <div
                    key={p.id}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border p-3 transition-colors',
                      editing ? 'border-forest-300 bg-lime-50/60' : 'border-hair bg-panel/50',
                    )}
                  >
                    <Avatar name={fullName(p)} src={faceUrl(p.id)} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-forest">{fullName(p)}</p>
                      <p className="truncate text-xs text-forest-400">
                        {p.role}{p.email ? ` · ${p.email}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-forest-500 shadow-card transition-colors hover:text-forest"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removePerson(p.id)}
                      aria-label={`Remove ${fullName(p)}`}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-forest-300 transition-colors hover:bg-rose-soft hover:text-rose-ink"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
            <div
              className={cn(
                'mt-5 rounded-2xl border border-dashed p-4 transition-colors',
                editingId ? 'border-forest-300 bg-lime-50/40' : 'border-hair',
              )}
            >
              <p className="mb-4 text-sm font-semibold text-forest">
                {editingId ? `Edit ${personLabel}` : `Add a ${personLabel}`}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First Name" required>
                  <Input placeholder="First name" value={form.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                </Field>
                <Field label="Last Name" required>
                  <Input placeholder="Last name" value={form.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                </Field>
                <Field label="Date of Birth" required>
                  <DatePicker placeholder="Select date of birth" value={form.dob} onChange={(v) => setField('dob', v)} />
                </Field>
                <Field label="Nationality" required>
                  <Select value={form.nationality} onChange={(e) => setField('nationality', e.target.value)}>
                    <option>Nigeria</option><option>Ghana</option><option>United Kingdom</option>
                  </Select>
                </Field>
                <Field label="Email" required>
                  <Input type="email" placeholder="name@company.com" value={form.email} onChange={(e) => setField('email', e.target.value)} />
                </Field>
                <Field label="Phone" required>
                  <Input placeholder="+234 800 000 0000" value={form.phone} onChange={(e) => setField('phone', e.target.value)} />
                </Field>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="subtle"
                  size="sm"
                  onClick={savePerson}
                  leftIcon={editingId ? <Check size={15} /> : <Plus size={15} />}
                >
                  {editingId ? 'Save changes' : `Add ${personLabel}`}
                </Button>
                {editingId && (
                  <Button variant="ghost" size="sm" onClick={cancelEdit}>Cancel</Button>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <SectionLabel hint={`Provide each ${personLabel}'s phone, NIN and BVN to complete verification.`}>
              {peopleLabel} Verification
            </SectionLabel>
            <div className="space-y-3">
              {people.map((p) => (
                <div key={p.id} className="rounded-2xl border border-hair p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-forest">{fullName(p)}</p>
                    <span className="text-xs text-forest-400">{p.role}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <VerifyChip label="Phone" />
                    <VerifyChip label="NIN" />
                    <VerifyChip label="BVN" />
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label="ID Document Type" required>
                      <Select>{ID_DOCUMENT_TYPE.map((t) => <option key={t} value={t}>{titleCase(t)}</option>)}</Select>
                    </Field>
                    <Field label="ID Document Upload" required>
                      <FileField label="Identity document" />
                    </Field>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-lime-50 p-4">
              <ShieldCheck className="text-teal" size={20} />
              <p className="text-sm text-forest-500">
                Submitting moves your KYC to <span className="font-semibold">submitted</span> for review. PII is
                encrypted at rest and never shown in full.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-7 flex items-center justify-between border-t border-hair pt-5">
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} leftIcon={<ArrowLeft size={16} />}>
          Back
        </Button>
        {step < 2 ? (
          <Button onClick={() => setStep((s) => Math.min(2, s + 1))} rightIcon={<ArrowRight size={16} />}>
            Save and continue
          </Button>
        ) : (
          <Button variant="lime" leftIcon={<ShieldCheck size={16} />} onClick={submit}>
            Submit → Verify KYC
          </Button>
        )}
      </div>
    </div>
  )
}
