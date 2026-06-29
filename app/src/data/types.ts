export type Role = 'seller' | 'buyer' | 'lab'

export const MINERALS = [
  'tin',
  'lithium',
  'columbite',
  'lead',
  'zinc',
  'copper',
  'wolframite',
  'monazite',
  'tantalite',
  'beryllium',
  'gold',
  'spodumene',
] as const
export type Mineral = (typeof MINERALS)[number]

export const UNITS = ['ton', 'kg', 'pound', 'oz'] as const
export type Unit = (typeof UNITS)[number]

export const SUPPLY_FREQUENCY = ['daily', 'weekly', 'monthly', 'quarterly'] as const
export const DELIVERY_MODE = ['delivery', 'pickup'] as const
export const LOCATION_TYPE = ['warehouse', 'mine'] as const
export const INCORPORATION_TYPE = ['business_name', 'registered_company'] as const
export const ID_DOCUMENT_TYPE = [
  'international_passport',
  'drivers_license',
  'pvc',
  'nin_card',
] as const
export const INCOTERMS = ['fob', 'cif', 'exw'] as const
export const PAYMENT_TERMS = ['wallet', 'letter_of_credit', 'bank_transfer'] as const
export const FUNDING_METHOD = ['bank_transfer', 'card', 'stablecoin'] as const
export const TEST_METHOD = ['xrf', 'assay', 'other'] as const

export type Currency = 'NGN' | 'USD'

export const CURRENCY_OPTIONS = [
  { value: 'NGN', label: '₦ NGN' },
  { value: 'USD', label: '$ USD' },
] as const

export type ListingStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'completed'
export type TradeStatus = 'ongoing' | 'completed' | 'cancelled'
export type RFQStatus = 'pending' | 'responded' | 'negotiation' | 'accepted' | 'closed'
export type SampleStatus = 'pending' | 'shipped' | 'delivered'
export type TestingStatus =
  | 'incoming'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'rejected'
export type EscrowStatus = 'unfunded' | 'funded' | 'released' | 'refunded'
export type KycStatus =
  | 'not_started'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected'

export interface InventoryItem {
  id: string
  mineral: Mineral
  grade: number
  available: number
  unit: Unit
  supplyFrequency: (typeof SUPPLY_FREQUENCY)[number]
  locationType: (typeof LOCATION_TYPE)[number]
  deliveryMode: (typeof DELIVERY_MODE)[number]
  state: string
  lga: string
  updatedAt: string
}

export interface Listing {
  id: string
  mineral: Mineral
  grade: number
  quantity: number
  unit: Unit
  priceAmount: number
  priceCurrency: Currency
  state: string
  status: ListingStatus
  certified: boolean
  createdAt: string
}

export interface Trade {
  id: string
  orderNumber: string
  batchId: string
  mineral: Mineral
  grade: number
  quantity: number
  unit: Unit
  value: number
  currency: Currency
  seller: string
  buyer: string
  escrow: EscrowStatus
  status: TradeStatus
  certified: boolean
  /** Seller has acknowledged the order and is preparing fulfilment. */
  accepted?: boolean
  createdAt: string
}

export interface TestingRequest {
  id: string
  batchId: string
  mineral: Mineral
  gradeClaimed: number
  quantity: number
  unit: Unit
  requester: string
  requesterRole: Role
  date: string
  time: string
  state: string
  lga: string
  address: string
  deliveryMode: 'courier' | 'on_site_sampling'
  contactName: string
  contactPhone: string
  status: TestingStatus
}

export interface SamplingRequest {
  id: string
  mineral: Mineral
  date: string
  time: string
  contactName: string
  state: string
  lga: string
  status: SampleStatus
}

export interface MarketListing extends Listing {
  sellerName: string
  sellerVerified: boolean
  sellerRating: number
  deliveryMode: (typeof DELIVERY_MODE)[number]
  locationType: (typeof LOCATION_TYPE)[number]
  trend: number[]
}

export interface RfqMessage {
  id: string
  from: Role
  author: string
  body: string
  price?: number
  /** A system line (e.g. "agreement reached") rather than a typed message. */
  system?: boolean
  at: string
}

export interface RFQ {
  id: string
  mineral: Mineral
  quantity: number
  unit: Unit
  seller: string
  buyer: string
  incoterms: (typeof INCOTERMS)[number]
  paymentTerms: (typeof PAYMENT_TERMS)[number]
  deliveryState: string
  timeline: string
  status: RFQStatus
  quotedPrice?: number
  messages?: RfqMessage[]
  createdAt: string
}

export interface SampleRequest {
  id: string
  mineral: Mineral
  quantity: number
  unit: Unit
  seller: string
  buyer: string
  courier: string
  status: SampleStatus
  createdAt: string
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'payment'
  method?: (typeof FUNDING_METHOD)[number]
  amount: number
  currency: Currency
  status: 'pending' | 'completed' | 'failed'
  reference: string
  createdAt: string
}

export interface TestResult {
  id: string
  batchId: string
  mineral: Mineral
  gradeMeasured: number
  purity: string
  method: (typeof TEST_METHOD)[number]
  signedBy: string
  signedAt: string
  status: 'completed' | 'rejected'
}

export interface Director {
  id: string
  name: string
  role: string
  nin: string
  bvn: string
  verification: 'pending' | 'verified' | 'failed'
}

export interface NotificationItem {
  id: string
  audience: Role
  category: 'kyc' | 'trade' | 'payment' | 'test_request' | 'rfq' | 'sample' | 'system'
  title: string
  body: string
  read: boolean
  time: string
  /** Route this notification deep-links to (may include a query that opens a
   *  specific entity, e.g. `/seller/trades?order=GEN-24901`). */
  link?: string
}
