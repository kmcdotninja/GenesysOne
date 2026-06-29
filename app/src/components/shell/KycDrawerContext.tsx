import { createContext, useContext } from 'react'

export interface KycDrawerApi {
  /** Open the KYC form drawer (edit / continue). */
  openForm: () => void
  /** Open the KYC status drawer (review submitted details). */
  openStatus: () => void
}

export const KycDrawerContext = createContext<KycDrawerApi>({
  openForm: () => {},
  openStatus: () => {},
})

export function useKycDrawer(): KycDrawerApi {
  return useContext(KycDrawerContext)
}
