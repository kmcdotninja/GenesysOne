import { createContext, useContext } from 'react'
import type { Role } from '@/data/types'

export const RoleContext = createContext<Role>('seller')

export function useRole(): Role {
  return useContext(RoleContext)
}
