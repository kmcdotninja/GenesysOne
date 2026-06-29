import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Eye, EyeOff, Wallet } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { Logo } from '@/components/Logo'
import { Button, Field, Input, useToast } from '@/components/ui'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  )
}

export function Login() {
  const navigate = useNavigate()
  const toast = useToast()
  const [step, setStep] = useState<'email' | 'password'>('email')
  const [email, setEmail] = useState('')
  const [showPw, setShowPw] = useState(false)

  const signIn = () => {
    toast.success('Welcome back', 'Signed in to your GenesysOne account.')
    navigate('/seller')
  }

  return (
    <AuthLayout>
      <Logo className="mb-8 h-7 text-forest" />

      <h1 className="text-[22px] font-semibold tracking-[-0.01em] text-forest">
        Mineral trading & traceability
      </h1>
      <p className="mt-1 text-[15px] text-forest-400">Sign in to your GenesysOne account</p>

      {step === 'email' ? (
        <form
          className="mt-7"
          onSubmit={(e) => {
            e.preventDefault()
            setStep('password')
          }}
        >
          <Field label="Work email">
            <Input
              type="email"
              autoFocus
              required
              placeholder="me@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" block className="mt-4" rightIcon={<ArrowRight size={16} />}>
            Continue
          </Button>
        </form>
      ) : (
        <form
          className="mt-7"
          onSubmit={(e) => {
            e.preventDefault()
            signIn()
          }}
        >
          <button
            type="button"
            onClick={() => setStep('email')}
            className="mb-4 inline-flex items-center gap-2 rounded-xl bg-panel px-3 py-1.5 text-[13px] font-medium text-forest-500 transition-colors hover:bg-hair"
          >
            <ArrowLeft size={14} />
            {email || 'me@example.com'}
          </button>
          <Field label="Password">
            <div className="relative">
              <Input
                type={showPw ? 'text' : 'password'}
                autoFocus
                required
                placeholder="Enter your password"
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
          <div className="mt-2 text-right">
            <a className="text-[13px] font-semibold text-teal hover:underline" href="#">
              Forgot password?
            </a>
          </div>
          <Button type="submit" block className="mt-4">
            Sign in
          </Button>
        </form>
      )}

      {/* SSO */}
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-hair" />
        <span className="text-xs font-medium text-forest-300">or continue with</span>
        <span className="h-px flex-1 bg-hair" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" leftIcon={<GoogleMark />} onClick={signIn}>
          Google
        </Button>
        <Button variant="secondary" leftIcon={<Wallet size={16} className="text-teal" />} onClick={signIn}>
          Wallet
        </Button>
      </div>

      <p className="mt-7 text-[13px] leading-relaxed text-forest-300">
        By signing in, you accept our{' '}
        <a href="#" className="font-medium text-forest-400 underline underline-offset-2">
          Terms of Use
        </a>{' '}
        and confirm you've read our{' '}
        <a href="#" className="font-medium text-forest-400 underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>

      <p className="mt-6 text-sm text-forest-400">
        New to GenesysOne?{' '}
        <Link to="/signup" className="font-semibold text-forest hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
