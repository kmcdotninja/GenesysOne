import { createContext, useContext, type ComponentProps, type MouseEventHandler } from 'react'
import { Button } from '@/components/ui'
import { useKycDrawer } from './KycDrawerContext'
import type { KycStatus, Role } from '@/data/types'

export interface AccountInfo {
  role: Role
  company: string
  contactName?: string
  kyc: KycStatus
  verified: boolean
  /** A built-in demo interface (never gated) vs a user-created account. */
  isDemo: boolean
}

export const AccountContext = createContext<AccountInfo | null>(null)

export function useAccount(): AccountInfo {
  const ctx = useContext(AccountContext)
  if (!ctx) throw new Error('useAccount must be used within AppShell')
  return ctx
}

/**
 * Whether the active account is blocked from restricted actions. Demo
 * interfaces are never blocked; a created account is blocked until verified.
 */
export function useVerifyGuard() {
  const { verified } = useAccount()
  const { openVerifyPrompt } = useKycDrawer()
  // Any account — demo or created — is locked out of actions until it's verified.
  const locked = !verified
  const requireVerified = (fn: () => void, action?: string) => () => {
    if (locked) {
      openVerifyPrompt(action)
      return
    }
    fn()
  }
  return { locked, requireVerified }
}

/**
 * A drop-in <Button> that looks and behaves normally, but for an unverified
 * created account intercepts the click and opens the "verification required"
 * modal instead of running the action.
 */
export function GatedButton({
  onClick,
  action,
  ...rest
}: ComponentProps<typeof Button> & { action?: string }) {
  const { locked } = useVerifyGuard()
  const { openVerifyPrompt } = useKycDrawer()

  const handle: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (locked) {
      openVerifyPrompt(action)
      return
    }
    onClick?.(e)
  }

  return <Button {...rest} onClick={handle} />
}
