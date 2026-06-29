import {
  ArrowLeftRight,
  BadgeCheck,
  Bell,
  Boxes,
  ClipboardList,
  FileText,
  FlaskConical,
  History,
  Inbox,
  LayoutDashboard,
  Store,
  TestTube2,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import type { KycStatus, Role } from './types'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

export interface RoleMeta {
  label: string
  company: string
  kyc: KycStatus
  base: string
}

export const ROLE_META: Record<Role, RoleMeta> = {
  seller: {
    label: 'Seller',
    company: 'Jos Highland Minerals Ltd',
    kyc: 'verified',
    base: '/seller',
  },
  buyer: {
    label: 'Buyer',
    company: 'Atlantic Metals Trading',
    kyc: 'verified',
    base: '/buyer',
  },
  lab: {
    label: 'Lab',
    company: 'Geneva Assay Laboratories',
    kyc: 'under_review',
    base: '/lab',
  },
}

export const ROLE_NAV: Record<Role, NavItem[]> = {
  seller: [
    { label: 'Dashboard', to: '/seller', icon: LayoutDashboard, end: true },
    { label: 'Inventory', to: '/seller/inventory', icon: Boxes },
    { label: 'Listings', to: '/seller/listings', icon: Store },
    { label: 'Buyer Requests', to: '/seller/requests', icon: Inbox },
    { label: 'Trade History', to: '/seller/trades', icon: ArrowLeftRight },
    { label: 'Quality Control', to: '/seller/qca', icon: BadgeCheck },
  ],
  buyer: [
    { label: 'Dashboard', to: '/buyer', icon: LayoutDashboard, end: true },
    { label: 'Wallet', to: '/buyer/wallet', icon: Wallet },
    { label: 'Marketplace', to: '/buyer/marketplace', icon: Store },
    { label: 'RFQ', to: '/buyer/rfq', icon: FileText },
    { label: 'Trades', to: '/buyer/trades', icon: ArrowLeftRight },
    { label: 'Sample Requests', to: '/buyer/samples', icon: TestTube2 },
  ],
  lab: [
    { label: 'Dashboard', to: '/lab', icon: LayoutDashboard, end: true },
    { label: 'Testing Requests', to: '/lab/requests', icon: Inbox },
    { label: 'Conduct Test', to: '/lab/conduct', icon: FlaskConical },
    { label: 'Test History', to: '/lab/history', icon: History },
    { label: 'Wallet', to: '/lab/wallet', icon: Wallet },
    { label: 'Notifications', to: '/lab/notifications', icon: Bell },
  ],
}

export const ROLES: Role[] = ['seller', 'buyer', 'lab']

export const ROLE_TAGLINE: Record<Role, { icon: LucideIcon; blurb: string }> = {
  seller: {
    icon: Store,
    blurb: 'List mineral inventory, request testing, and sell to verified buyers.',
  },
  buyer: {
    icon: ClipboardList,
    blurb: 'Discover certified listings, send RFQs, and trade with escrow protection.',
  },
  lab: {
    icon: FlaskConical,
    blurb: 'Receive testing requests, run assays, and publish signed certificates.',
  },
}
