import { createContext, useContext } from 'react'

export interface KycDrawerApi {
  /** Open the KYC form drawer (edit / continue). */
  openForm: () => void
  /** Open the KYC status drawer (review submitted details). */
  openStatus: () => void
  /** Open the "verification required" modal blocking a restricted action. */
  openVerifyPrompt: (action?: string) => void
}

export const KycDrawerContext = createContext<KycDrawerApi>({
  openForm: () => {},
  openStatus: () => {},
  openVerifyPrompt: () => {},
})

export function useKycDrawer(): KycDrawerApi {
  return useContext(KycDrawerContext)
}
