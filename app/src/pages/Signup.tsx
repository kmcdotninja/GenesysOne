import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Logo } from '@/components/Logo'
import { Button, Field, Input, Segmented, Select, useToast } from '@/components/ui'
import { ROLE_META } from '@/data/nav'
import { useStore } from '@/store/AppStore'

type SignupRole = 'seller' | 'buyer'
const SIGNUP_ROLES: { value: SignupRole; label: string }[] = [
  { value: 'seller', label: 'Seller' },
  { value: 'buyer', label: 'Buyer' },
]
const COUNTRIES = ['Nigeria', 'Ghana', 'South Africa', 'Kenya', 'United Kingdom']

export function Signup() {
  const navigate = useNavigate()
  const toast = useToast()
  const { createAccount } = useStore()
  const [role, setRole] = useState<SignupRole>('seller')
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState(COUNTRIES[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createAccount({ role, company: company.trim(), contactName: name.trim(), email: email.trim(), country })
    toast.success('Account created', `${company.trim()} is ready — complete verification to unlock everything.`)
    navigate(ROLE_META[role].base)
  }

  return (
    <AuthLayout>
      <Logo className="mb-8 h-7 text-forest" />

      <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-forest">
        Create your account
      </h1>
      <p className="mt-1 text-[15px] text-forest-400">
        Join GenesysOne to trace, certify and trade minerals
      </p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <Field label="Account type" hint="You can add more accounts later.">
          <Segmented<SignupRole>
            block
            options={SIGNUP_ROLES}
            value={role}
            onChange={setRole}
          />
        </Field>

        <Field label="Company name">
          <Input required placeholder="Acme Minerals Ltd" value={company} onChange={(e) => setCompany(e.target.value)} autoFocus />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input required placeholder="Amara Okwuosa" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Country">
            <Select value={country} onChange={(e) => setCountry(e.target.value)}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Work email">
          <Input type="email" required placeholder="me@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <div className="relative">
            <Input
              type={showPw ? 'text' : 'password'}
              required
              placeholder="Create a password"
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-300 transition-colors hover:text-forest-500"
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <Button type="submit" block className="mt-2">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-[13px] leading-relaxed text-forest-300">
        By creating an account, you accept our{' '}
        <a href="#" className="font-medium text-forest-400 underline underline-offset-2">
          Terms of Use
        </a>{' '}
        and{' '}
        <a href="#" className="font-medium text-forest-400 underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>

      <p className="mt-5 text-sm text-forest-400">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-forest hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
