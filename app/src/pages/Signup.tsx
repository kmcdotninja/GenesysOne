import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Logo } from '@/components/Logo'
import { Button, Field, Input, Segmented, useToast } from '@/components/ui'
import { ROLE_META, ROLES } from '@/data/nav'
import type { Role } from '@/data/types'

export function Signup() {
  const navigate = useNavigate()
  const toast = useToast()
  const [role, setRole] = useState<Role>('seller')
  const [showPw, setShowPw] = useState(false)

  return (
    <AuthLayout>
      <Logo className="mb-8 h-7 text-forest" />

      <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-forest">
        Create your account
      </h1>
      <p className="mt-1 text-[15px] text-forest-400">
        Join GenesysOne to trace, certify and trade minerals
      </p>

      <form
        className="mt-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          toast.success('Account created', `Welcome to GenesysOne, ${ROLE_META[role].label}.`)
          navigate(ROLE_META[role].base)
        }}
      >
        <Field label="Full name">
          <Input required placeholder="Amara Okwuosa" autoFocus />
        </Field>
        <Field label="Work email">
          <Input type="email" required placeholder="me@company.com" />
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

        <Field label="Account type">
          <Segmented<Role>
            block
            options={ROLES.map((r) => ({ value: r, label: ROLE_META[r].label }))}
            value={role}
            onChange={setRole}
          />
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
