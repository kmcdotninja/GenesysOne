import type {
  ComplianceAgent,
  Director,
  InventoryItem,
  Listing,
  KycStatus,
  KycSubmission,
  MarketListing,
  Mineral,
  MiningSite,
  NotificationItem,
  Passport,
  Role,
  RFQ,
  SampleRequest,
  SamplingRequest,
  TestResult,
  TestingRequest,
  Trade,
  Transaction,
} from './types'

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]

const LGA_MAP: Record<string, string[]> = {
  Plateau: ['Jos North', 'Jos South', 'Barkin Ladi', 'Bukuru', 'Riyom'],
  Nasarawa: ['Lafia', 'Karu', 'Keffi', 'Akwanga', 'Nasarawa Eggon'],
  Kaduna: ['Kaduna North', 'Kaduna South', 'Zaria', 'Birnin Gwari', 'Kafanchan'],
  Niger: ['Minna', 'Bida', 'Suleja', 'Kontagora', 'Borgu'],
  Kogi: ['Lokoja', 'Okene', 'Kabba', 'Idah', 'Ankpa'],
  Zamfara: ['Gusau', 'Anka', 'Maru', 'Bukkuyum', 'Talata Mafara'],
  Oyo: ['Ibadan North', 'Ogbomosho', 'Oyo', 'Saki', 'Iseyin'],
  'FCT - Abuja': ['Abuja Municipal', 'Bwari', 'Gwagwalada', 'Kuje', 'Abaji'],
  Bauchi: ['Bauchi', 'Azare', 'Misau', 'Tafawa Balewa', 'Toro'],
  Ekiti: ['Ado Ekiti', 'Ikere', 'Ijero', 'Ise/Orun', 'Efon'],
}

export function lgasFor(state: string): string[] {
  return LGA_MAP[state] ?? ['Central', 'North', 'South', 'East', 'West']
}

// ---- price series for charts (deterministic) ----
export const PRICE_SERIES = [
  98.2, 97.6, 99.1, 98.4, 96.9, 97.8, 95.2, 94.6, 95.9, 94.1, 92.8, 93.6,
  91.9, 90.4, 92.1, 90.8, 89.2, 91.0, 93.4, 92.1, 90.6, 91.8, 90.2, 89.6,
  90.9, 92.3, 91.1, 90.4, 91.6, 90.8, 91.9, 90.6,
]

export const VOLUME_SERIES = [
  12, 18, 14, 22, 19, 27, 24, 31, 28, 35, 33, 41, 38, 44, 49, 46, 52, 58,
]

function spark(seed: number): number[] {
  return Array.from({ length: 16 }, (_, i) =>
    50 + Math.sin((i + seed) * 0.7) * 12 + (i % 3) * 3 + seed,
  )
}

// ---- KYC / company ----
// The three demo accounts. These identities are what let actions taken in one
// interface (e.g. a buyer placing an order) surface on the counterparty's account.
export const SELLER_CO = 'Jos Highland Minerals Ltd'
export const BUYER_CO = 'Atlantic Metals Trading'

/** The signed-in human operating the account (shown in the top-bar profile menu). */
export const CURRENT_USER = {
  firstName: 'Tunde',
  lastName: 'Alabi',
  name: 'Tunde Alabi',
  email: 'tunde.alabi@genesysone.africa',
  phone: '+234 803 555 0142',
  title: 'Trading Operations Lead',
  location: 'Lagos, Nigeria',
}
export const LAB_CO = 'Geneva Assay Laboratories'

export const COMPANY = {
  seller: { name: SELLER_CO, kyc: 'verified' as const },
  buyer: { name: BUYER_CO, kyc: 'verified' as const },
  lab: { name: LAB_CO, kyc: 'under_review' as const },
}

export const DIRECTORS: Director[] = [
  {
    id: 'd1',
    name: 'Amara Okwuosa',
    role: 'Managing Director',
    nin: '20184792013',
    bvn: '22193845011',
    verification: 'verified',
  },
  {
    id: 'd2',
    name: 'Ibrahim Suleiman',
    role: 'Operations Director',
    nin: '30197462200',
    bvn: '22456710093',
    verification: 'verified',
  },
  {
    id: 'd3',
    name: 'Ngozi Eze',
    role: 'Compliance Officer',
    nin: '40128873641',
    bvn: '22781209934',
    verification: 'pending',
  },
]

// ---- Seller ----
export const INVENTORY: InventoryItem[] = [
  { id: 'inv1', mineral: 'tin', grade: 71.4, available: 120, unit: 'ton', supplyFrequency: 'monthly', locationType: 'mine', deliveryMode: 'delivery', state: 'Plateau', lga: 'Barkin Ladi', updatedAt: '2 days ago' },
  { id: 'inv2', mineral: 'columbite', grade: 64.2, available: 80, unit: 'ton', supplyFrequency: 'monthly', locationType: 'mine', deliveryMode: 'pickup', state: 'Nasarawa', lga: 'Nasarawa Eggon', updatedAt: '5 days ago' },
  { id: 'inv3', mineral: 'lithium', grade: 5.8, available: 240, unit: 'ton', supplyFrequency: 'weekly', locationType: 'warehouse', deliveryMode: 'delivery', state: 'Nasarawa', lga: 'Karu', updatedAt: '1 day ago' },
  { id: 'inv4', mineral: 'tantalite', grade: 38.5, available: 45, unit: 'ton', supplyFrequency: 'quarterly', locationType: 'mine', deliveryMode: 'delivery', state: 'Kaduna', lga: 'Birnin Gwari', updatedAt: '1 week ago' },
  { id: 'inv5', mineral: 'lead', grade: 82.0, available: 310, unit: 'ton', supplyFrequency: 'monthly', locationType: 'warehouse', deliveryMode: 'pickup', state: 'Ebonyi', lga: 'Central', updatedAt: '3 days ago' },
  { id: 'inv6', mineral: 'gold', grade: 91.6, available: 18, unit: 'kg', supplyFrequency: 'monthly', locationType: 'mine', deliveryMode: 'delivery', state: 'Zamfara', lga: 'Anka', updatedAt: '6 hours ago' },
]

export const LISTINGS: Listing[] = [
  { id: 'lst1', mineral: 'tin', grade: 71.4, quantity: 60, unit: 'ton', priceAmount: 28500000, priceCurrency: 'NGN', state: 'Plateau', status: 'approved', certified: true, createdAt: '12 Feb 2025' },
  { id: 'lst2', mineral: 'columbite', grade: 64.2, quantity: 40, unit: 'ton', priceAmount: 19200000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'approved', certified: false, createdAt: '10 Feb 2025' },
  { id: 'lst3', mineral: 'lithium', grade: 5.8, quantity: 120, unit: 'ton', priceAmount: 8400000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'approved', certified: true, createdAt: '08 Feb 2025' },
  { id: 'lst4', mineral: 'tantalite', grade: 38.5, quantity: 20, unit: 'ton', priceAmount: 41000000, priceCurrency: 'NGN', state: 'Kaduna', status: 'completed', certified: true, createdAt: '02 Feb 2025' },
  { id: 'lst5', mineral: 'lead', grade: 82.0, quantity: 150, unit: 'ton', priceAmount: 12750000, priceCurrency: 'NGN', state: 'Ebonyi', status: 'approved', certified: false, createdAt: '14 Feb 2025' },
  { id: 'lst6', mineral: 'gold', grade: 91.6, quantity: 10, unit: 'kg', priceAmount: 96900000, priceCurrency: 'NGN', state: 'Zamfara', status: 'completed', certified: false, createdAt: '01 Feb 2025' },
]

export const SAMPLING_REQUESTS: SamplingRequest[] = [
  { id: 'sr1', mineral: 'tin', date: '18 Feb 2025', time: '10:00', contactName: 'Sani Bello', state: 'Plateau', lga: 'Jos South', status: 'delivered' },
  { id: 'sr2', mineral: 'lithium', date: '20 Feb 2025', time: '13:30', contactName: 'Grace Madu', state: 'Nasarawa', lga: 'Karu', status: 'shipped' },
  { id: 'sr3', mineral: 'gold', date: '22 Feb 2025', time: '09:00', contactName: 'Sani Bello', state: 'Zamfara', lga: 'Anka', status: 'pending' },
]

// ---- Trades (shared, viewed from each side) ----
// Each trade names both the seller and buyer so it can surface on the right
// account: the seller view filters on `seller === SELLER_CO`, the buyer view on
// `buyer === BUYER_CO`. Trades between the two demo accounts (t1, t3) show on both.
export const TRADES: Trade[] = [
  { id: 't1', orderNumber: 'GEN-24817', batchId: 'BTH-TIN-0091', mineral: 'tin', grade: 71.4, quantity: 60, unit: 'ton', value: 28500000, currency: 'NGN', seller: SELLER_CO, buyer: BUYER_CO, escrow: 'funded', status: 'ongoing', certified: true, createdAt: '12 Feb 2025' },
  { id: 't2', orderNumber: 'GEN-24790', batchId: 'BTH-TAN-0042', mineral: 'tantalite', grade: 38.5, quantity: 20, unit: 'ton', value: 41000000, currency: 'NGN', seller: SELLER_CO, buyer: BUYER_CO, escrow: 'released', status: 'completed', certified: true, createdAt: '02 Feb 2025' },
  { id: 't3', orderNumber: 'GEN-24755', batchId: 'BTH-LIT-0188', mineral: 'lithium', grade: 5.8, quantity: 120, unit: 'ton', value: 8400000, currency: 'NGN', seller: SELLER_CO, buyer: BUYER_CO, escrow: 'funded', status: 'ongoing', certified: true, createdAt: '08 Feb 2025' },
  { id: 't4', orderNumber: 'GEN-24612', batchId: 'BTH-COL-0021', mineral: 'columbite', grade: 64.2, quantity: 35, unit: 'ton', value: 16800000, currency: 'NGN', seller: SELLER_CO, buyer: BUYER_CO, escrow: 'released', status: 'completed', certified: true, createdAt: '21 Jan 2025' },
  { id: 't5', orderNumber: 'GEN-24588', batchId: 'BTH-GLD-0007', mineral: 'gold', grade: 91.6, quantity: 6, unit: 'kg', value: 58140000, currency: 'NGN', seller: SELLER_CO, buyer: BUYER_CO, escrow: 'refunded', status: 'cancelled', certified: false, createdAt: '15 Jan 2025' },
]

// ---- Lab: testing requests ----
export const TESTING_REQUESTS: TestingRequest[] = [
  { id: 'tr1', batchId: 'BTH-TIN-0091', mineral: 'tin', gradeClaimed: 71.4, quantity: 60, unit: 'ton', requester: 'Jos Highland Minerals Ltd', requesterRole: 'seller', date: '18 Feb 2025', time: '10:00', state: 'Plateau', lga: 'Barkin Ladi', address: 'Plot 14, Mining Belt Rd', deliveryMode: 'on_site_sampling', contactName: 'Sani Bello', contactPhone: '+234 803 221 0091', status: 'incoming' },
  { id: 'tr2', batchId: 'BTH-LIT-0188', mineral: 'lithium', gradeClaimed: 5.8, quantity: 120, unit: 'ton', requester: 'Jos Highland Minerals Ltd', requesterRole: 'seller', date: '19 Feb 2025', time: '14:00', state: 'Nasarawa', lga: 'Karu', address: 'Km 8, Keffi Expressway', deliveryMode: 'courier', contactName: 'Grace Madu', contactPhone: '+234 701 884 2210', status: 'incoming' },
  { id: 'tr3', batchId: 'BTH-TAN-0042', mineral: 'tantalite', gradeClaimed: 38.5, quantity: 20, unit: 'ton', requester: 'Atlantic Metals Trading', requesterRole: 'buyer', date: '15 Feb 2025', time: '11:30', state: 'Kaduna', lga: 'Birnin Gwari', address: 'Warehouse 3, Industrial Layout', deliveryMode: 'on_site_sampling', contactName: 'Musa Danjuma', contactPhone: '+234 809 110 4521', status: 'in_progress' },
  { id: 'tr4', batchId: 'BTH-COL-0021', mineral: 'columbite', gradeClaimed: 64.2, quantity: 35, unit: 'ton', requester: BUYER_CO, requesterRole: 'buyer', date: '12 Feb 2025', time: '09:30', state: 'Nasarawa', lga: 'Nasarawa Eggon', address: 'Block C, Industrial Layout', deliveryMode: 'courier', contactName: 'Tunde Bakare', contactPhone: '+234 802 553 7741', status: 'accepted' },
]

export const TEST_RESULTS: TestResult[] = [
  { id: 'res1', batchId: 'BTH-TAN-0042', mineral: 'tantalite', gradeMeasured: 38.1, purity: 'Ta₂O₅ 38.1% · Nb₂O₅ 9.4% · trace Fe', method: 'xrf', signedBy: 'Dr. Hauwa Lawal', signedAt: '03 Feb 2025', status: 'completed' },
  { id: 'res2', batchId: 'BTH-COL-0021', mineral: 'columbite', gradeMeasured: 63.8, purity: 'Nb₂O₅ 63.8% · low Ta · moisture 0.4%', method: 'assay', signedBy: 'Dr. Hauwa Lawal', signedAt: '22 Jan 2025', status: 'completed' },
  { id: 'res3', batchId: 'BTH-LED-0114', mineral: 'lead', gradeMeasured: 79.2, purity: 'Pb 79.2% · Ag trace · within spec', method: 'xrf', signedBy: 'Emeka Obi', signedAt: '18 Jan 2025', status: 'completed' },
  { id: 'res4', batchId: 'BTH-GLD-0007', mineral: 'gold', gradeMeasured: 0, purity: 'Sample failed chain-of-custody check', method: 'assay', signedBy: 'Emeka Obi', signedAt: '16 Jan 2025', status: 'rejected' },
]

// ---- Buyer: marketplace ----
export const MARKET_LISTINGS: MarketListing[] = [
  { id: 'm1', mineral: 'tin', grade: 71.4, quantity: 60, unit: 'ton', priceAmount: 28500000, priceCurrency: 'NGN', state: 'Plateau', status: 'approved', certified: true, sellerName: 'Jos Highland Minerals Ltd', sellerVerified: true, sellerRating: 4.8, deliveryMode: 'delivery', locationType: 'mine', trend: spark(2), createdAt: '12 Feb 2025', passportNumber: 'GO-SN-2026-000150' },
  { id: 'm2', mineral: 'lithium', grade: 5.8, quantity: 120, unit: 'ton', priceAmount: 8400000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'approved', certified: true, sellerName: 'Jos Highland Minerals Ltd', sellerVerified: true, sellerRating: 4.8, deliveryMode: 'delivery', locationType: 'warehouse', trend: spark(5), createdAt: '08 Feb 2025', passportNumber: 'GO-LI-2026-000124' },
  { id: 'm3', mineral: 'gold', grade: 91.6, quantity: 12, unit: 'kg', priceAmount: 116000000, priceCurrency: 'NGN', state: 'Zamfara', status: 'approved', certified: true, sellerName: SELLER_CO, sellerVerified: true, sellerRating: 4.6, deliveryMode: 'pickup', locationType: 'mine', trend: spark(1), createdAt: '11 Feb 2025', passportNumber: 'GO-AU-2026-000140' },
  { id: 'm4', mineral: 'lead', grade: 82.0, quantity: 200, unit: 'ton', priceAmount: 16800000, priceCurrency: 'NGN', state: 'Ebonyi', status: 'approved', certified: true, sellerName: SELLER_CO, sellerVerified: true, sellerRating: 4.3, deliveryMode: 'delivery', locationType: 'warehouse', trend: spark(7), createdAt: '09 Feb 2025', passportNumber: 'GO-PB-2026-000148' },
  { id: 'm5', mineral: 'zinc', grade: 55.3, quantity: 90, unit: 'ton', priceAmount: 9600000, priceCurrency: 'NGN', state: 'Kogi', status: 'approved', certified: true, sellerName: SELLER_CO, sellerVerified: true, sellerRating: 4.4, deliveryMode: 'delivery', locationType: 'mine', trend: spark(3), createdAt: '07 Feb 2025', passportNumber: 'GO-ZN-2026-000142' },
  { id: 'm6', mineral: 'columbite', grade: 64.2, quantity: 50, unit: 'ton', priceAmount: 24000000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'approved', certified: true, sellerName: SELLER_CO, sellerVerified: true, sellerRating: 4.7, deliveryMode: 'pickup', locationType: 'mine', trend: spark(4), createdAt: '06 Feb 2025', passportNumber: 'GO-NB-2026-000145' },
]

// ---- Buyer: RFQs ----
export const RFQS: RFQ[] = [
  { id: 'r1', mineral: 'tin', quantity: 50, unit: 'ton', seller: SELLER_CO, buyer: BUYER_CO, incoterms: 'fob', paymentTerms: 'wallet', deliveryState: 'Lagos', timeline: '28 Feb 2025', status: 'negotiation', quotedPrice: 28250000, messages: [
    { id: 'rm1', from: 'buyer', author: BUYER_CO, body: 'Keen on the full 50 tons delivered to Lagos. Any movement on price if we commit to monthly volume?', at: '13 Feb 2025' },
    { id: 'rm2', from: 'seller', author: SELLER_CO, body: 'We can do ₦565,000/ton FOB — ₦28.25M for the lot. Volume terms are on the table for a 6-month commitment.', price: 28250000, at: '13 Feb 2025' },
  ], createdAt: '13 Feb 2025' },
  { id: 'r2', mineral: 'gold', quantity: 8, unit: 'kg', seller: SELLER_CO, buyer: BUYER_CO, incoterms: 'cif', paymentTerms: 'letter_of_credit', deliveryState: 'Lagos', timeline: '05 Mar 2025', status: 'responded', createdAt: '12 Feb 2025' },
  { id: 'r3', mineral: 'lithium', quantity: 100, unit: 'ton', seller: SELLER_CO, buyer: BUYER_CO, incoterms: 'exw', paymentTerms: 'bank_transfer', deliveryState: 'Ogun', timeline: '02 Mar 2025', status: 'pending', createdAt: '14 Feb 2025' },
  { id: 'r4', mineral: 'lead', quantity: 150, unit: 'ton', seller: SELLER_CO, buyer: BUYER_CO, incoterms: 'fob', paymentTerms: 'wallet', deliveryState: 'Rivers', timeline: '20 Feb 2025', status: 'closed', createdAt: '04 Feb 2025' },
]

export const SAMPLE_REQUESTS: SampleRequest[] = [
  { id: 'sm1', mineral: 'tin', quantity: 5, unit: 'kg', seller: SELLER_CO, buyer: BUYER_CO, courier: 'GIG Logistics', status: 'shipped', createdAt: '13 Feb 2025' },
  { id: 'sm2', mineral: 'gold', quantity: 1, unit: 'kg', seller: SELLER_CO, buyer: BUYER_CO, courier: 'DHL Express', status: 'delivered', createdAt: '10 Feb 2025' },
  { id: 'sm3', mineral: 'lithium', quantity: 10, unit: 'kg', seller: SELLER_CO, buyer: BUYER_CO, courier: 'Red Star', status: 'pending', createdAt: '15 Feb 2025' },
]

// ---- Wallet ----
export const WALLET = {
  balanceNGN: 184250000,
  balanceUSD: 42600,
}
export const LAB_WALLET = {
  balanceNGN: 7850000,
  balanceUSD: 0,
}

export const TRANSACTIONS: Transaction[] = [
  { id: 'tx1', type: 'deposit', method: 'bank_transfer', amount: 50000000, currency: 'NGN', status: 'completed', reference: 'DEP-9F2A1C', createdAt: '14 Feb 2025 · 09:12' },
  { id: 'tx2', type: 'escrow_hold', amount: 28500000, currency: 'NGN', status: 'completed', reference: 'ESC-24817', createdAt: '12 Feb 2025 · 16:40' },
  { id: 'tx3', type: 'deposit', method: 'card', amount: 12500, currency: 'USD', status: 'completed', reference: 'DEP-1B77E0', createdAt: '11 Feb 2025 · 11:05' },
  { id: 'tx4', type: 'escrow_release', amount: 41000000, currency: 'NGN', status: 'completed', reference: 'ESC-24790', createdAt: '03 Feb 2025 · 14:22' },
  { id: 'tx5', type: 'withdrawal', method: 'bank_transfer', amount: 5000000, currency: 'NGN', status: 'pending', reference: 'WTH-3C0D9A', createdAt: '14 Feb 2025 · 18:30' },
  { id: 'tx6', type: 'deposit', method: 'stablecoin', amount: 30000, currency: 'USD', status: 'completed', reference: 'DEP-USDC-44', createdAt: '06 Feb 2025 · 08:50' },
]

export const LAB_TRANSACTIONS: Transaction[] = [
  { id: 'lx1', type: 'payment', amount: 1250000, currency: 'NGN', status: 'completed', reference: 'PAY-TAN-0042', createdAt: '03 Feb 2025 · 15:00' },
  { id: 'lx2', type: 'payment', amount: 980000, currency: 'NGN', status: 'completed', reference: 'PAY-COL-0021', createdAt: '22 Jan 2025 · 10:18' },
  { id: 'lx3', type: 'withdrawal', method: 'bank_transfer', amount: 1500000, currency: 'NGN', status: 'completed', reference: 'WTH-LAB-77', createdAt: '20 Jan 2025 · 12:40' },
  { id: 'lx4', type: 'payment', amount: 1120000, currency: 'NGN', status: 'pending', reference: 'PAY-LED-0114', createdAt: '18 Jan 2025 · 09:30' },
]

// ---- Notifications (scoped to the account that should see them) ----
export const NOTIFICATIONS: NotificationItem[] = [
  // Lab
  { id: 'n1', audience: 'lab', category: 'test_request', title: 'New testing request', body: 'Jos Highland Minerals requested a tin assay (BTH-TIN-0091).', read: false, time: '4m ago', link: '/lab/requests?focus=tr1' },
  { id: 'n2', audience: 'lab', category: 'payment', title: 'Payment received', body: '₦1,250,000 credited for completed test BTH-TAN-0042.', read: false, time: '1h ago', link: '/lab/wallet' },
  { id: 'n3', audience: 'lab', category: 'kyc', title: 'KYC under review', body: 'Your accreditation documents are being verified.', read: true, time: 'Yesterday' },
  { id: 'n4', audience: 'lab', category: 'test_request', title: 'New testing request', body: 'Atlantic Metals requested a lithium assay (BTH-LIT-0188).', read: true, time: '2 days ago', link: '/lab/requests?focus=tr2' },
  // Seller
  { id: 'n5', audience: 'seller', category: 'rfq', title: 'New RFQ received', body: 'Atlantic Metals Trading requested a quote for 50 ton of tin.', read: false, time: '2m ago', link: '/seller/requests?focus=r1' },
  { id: 'n6', audience: 'seller', category: 'sample', title: 'New sample request', body: 'Atlantic Metals Trading requested a 5 kg tin sample.', read: false, time: '20m ago', link: '/seller/requests?focus=sm1' },
  { id: 'n7', audience: 'seller', category: 'trade', title: 'Order in escrow', body: 'GEN-24817 · tin · ₦28,500,000 is funded and awaiting fulfilment.', read: true, time: 'Yesterday', link: '/seller/trades?order=GEN-24817' },
  // Buyer
  { id: 'n8', audience: 'buyer', category: 'sample', title: 'Sample shipped', body: 'Jos Highland Minerals shipped your tin sample via GIG Logistics.', read: false, time: '15m ago', link: '/buyer/samples?focus=sm1' },
  { id: 'n9', audience: 'buyer', category: 'rfq', title: 'Seller responded', body: 'Jos Highland Minerals is negotiating your tin RFQ.', read: false, time: '1h ago', link: '/buyer/rfq?focus=r1' },
  { id: 'n10', audience: 'buyer', category: 'trade', title: 'Escrow funded', body: 'GEN-24755 · lithium · ₦8,400,000 is held in escrow.', read: true, time: '2 days ago', link: '/buyer/trades?order=GEN-24755' },
  // Compliance
  { id: 'n11', audience: 'compliance', category: 'passport', title: 'New passport request', body: 'Jos Highland Minerals requested a passport for a columbite batch.', read: false, time: '8m ago', link: '/compliance/passports?focus=p3' },
  { id: 'n12', audience: 'compliance', category: 'passport', title: 'Field capture complete', body: 'Agent uploaded GPS + photos for GO-SN-2026-000118 — ready to approve.', read: false, time: '40m ago', link: '/compliance/passports?focus=p2' },
]

// ---- Compliance / Digital Mineral Passport ----
export const COMPLIANCE_CO = 'GenesysOne Compliance'

/**
 * Primary element behind each tradeable mineral — drives the periodic-tile,
 * default product name, and the grade-label suffix on the passport.
 */
export const MINERAL_ELEMENT: Record<
  Mineral,
  { symbol: string; atomic: number; element: string; product: string; gradeUnit: string }
> = {
  tin: { symbol: 'Sn', atomic: 50, element: 'Tin', product: 'Cassiterite Concentrate', gradeUnit: '% Sn' },
  lithium: { symbol: 'Li', atomic: 3, element: 'Lithium', product: 'Lithium Concentrate', gradeUnit: '% Li₂O' },
  columbite: { symbol: 'Nb', atomic: 41, element: 'Niobium', product: 'Columbite Concentrate', gradeUnit: '% Nb₂O₅' },
  lead: { symbol: 'Pb', atomic: 82, element: 'Lead', product: 'Galena Concentrate', gradeUnit: '% Pb' },
  zinc: { symbol: 'Zn', atomic: 30, element: 'Zinc', product: 'Sphalerite Concentrate', gradeUnit: '% Zn' },
  copper: { symbol: 'Cu', atomic: 29, element: 'Copper', product: 'Copper Concentrate', gradeUnit: '% Cu' },
  wolframite: { symbol: 'W', atomic: 74, element: 'Tungsten', product: 'Wolframite Concentrate', gradeUnit: '% WO₃' },
  monazite: { symbol: 'Ce', atomic: 58, element: 'Cerium', product: 'Monazite Concentrate', gradeUnit: '% REO' },
  tantalite: { symbol: 'Ta', atomic: 73, element: 'Tantalum', product: 'Tantalite Concentrate', gradeUnit: '% Ta₂O₅' },
  beryllium: { symbol: 'Be', atomic: 4, element: 'Beryllium', product: 'Beryl Concentrate', gradeUnit: '% BeO' },
  gold: { symbol: 'Au', atomic: 79, element: 'Gold', product: 'Gold Concentrate', gradeUnit: '% Au' },
  spodumene: { symbol: 'Li', atomic: 3, element: 'Lithium', product: 'Spodumene Concentrate', gradeUnit: '% Li₂O' },
}

export const MINING_SITES: MiningSite[] = [
  { id: 'site1', name: 'Barkin Ladi Tin Field', region: 'Plateau', country: 'Nigeria', lga: 'Barkin Ladi', gps: { lat: 9.5361, lng: 8.9012 }, operator: SELLER_CO, type: 'mine', method: 'Alluvial / Open Pit' },
  { id: 'site2', name: 'Karu Lithium Project', region: 'Nasarawa', country: 'Nigeria', lga: 'Karu', gps: { lat: 8.9701, lng: 7.7405 }, operator: SELLER_CO, type: 'mine', method: 'Hard-Rock Pegmatite' },
  { id: 'site3', name: 'Nasarawa Eggon Columbite', region: 'Nasarawa', country: 'Nigeria', lga: 'Nasarawa Eggon', gps: { lat: 8.7333, lng: 8.5500 }, operator: SELLER_CO, type: 'mine', method: 'Open Pit' },
]

export const COMPLIANCE_AGENTS: ComplianceAgent[] = [
  { id: 'ag1', name: 'Tunde Bakare', region: 'North Central', status: 'available', assignments: 2 },
  { id: 'ag2', name: 'Aisha Mohammed', region: 'Plateau / Nasarawa', status: 'on_assignment', assignments: 3 },
  { id: 'ag3', name: 'Chidi Okafor', region: 'North West', status: 'available', assignments: 1 },
]

const ethHash = (s: string) => `0x${s}`

/** Compact builder for a fully-verified, anchored passport (marketplace seed). */
function marketPassport(
  number: string,
  mineral: Mineral,
  productName: string,
  grade: number,
  gradeLabel: string,
  quantity: number,
  unit: Passport['unit'],
  seller: string,
  siteName: string,
  region: string,
  gps: { lat: number; lng: number },
  method: string,
  batchId: string,
  composition: Passport['composition'],
  esg: NonNullable<Passport['esg']>,
  carbonTotal: number,
  carbonIntensity: number,
): Passport {
  const h = Array.from(number).map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  return {
    id: `mp_${number}`,
    number,
    status: 'verified',
    mineral,
    productName,
    grade,
    gradeLabel,
    quantity,
    unit,
    miningMethod: method,
    batchId,
    seller,
    siteName,
    region,
    country: 'Nigeria',
    gps,
    requestedAt: '04 May 2026',
    extractedAt: '08 May 2026',
    verifiedAt: '12 May 2026',
    updatedAt: '12 May 2026',
    esg,
    carbonTotal,
    carbonIntensity,
    composition,
    journey: [
      { key: 'extraction', date: '08 May 2026', location: siteName },
      { key: 'processing', date: '09 May 2026', location: `${region} Plant` },
      { key: 'transport', date: '11 May 2026', location: `${region} → Lagos Port` },
      { key: 'export', date: '12 May 2026', location: 'Lagos Port' },
    ],
    custody: [
      { id: `${number}-c1`, label: 'Sample sealed in tamper-proof QR bag', actor: 'Field agent · Compliance', at: '08 May 2026', txHash: `0x${(h + '0'.repeat(64)).slice(0, 64)}` },
      { id: `${number}-c2`, label: 'Passport approved & anchored on Ethereum', actor: COMPLIANCE_CO, at: '12 May 2026' },
    ],
    chain: 'Ethereum',
    txHash: `0x${(h + 'a1f5c2b9d8e74630aa12bd3490e7f8c1ee2299aa44bb55cc66dd77ee88ff0011').slice(0, 64)}`,
    anchoredAt: '12 May 2026',
  }
}

export const PASSPORTS: Passport[] = [
  {
    id: 'p1',
    number: 'GO-LI-2026-000124',
    status: 'verified',
    inventoryId: 'inv3',
    mineral: 'lithium',
    productName: 'Lithium Concentrate',
    grade: 5.2,
    gradeLabel: '5.2% Li₂O',
    quantity: 120.45,
    unit: 'ton',
    miningMethod: 'Hard-Rock Pegmatite',
    batchId: 'BTH-LIT-0188',
    seller: SELLER_CO,
    siteId: 'site2',
    siteName: 'Karu Lithium Project',
    region: 'Nasarawa',
    country: 'Nigeria',
    gps: { lat: 8.9701, lng: 7.7405 },
    agentId: 'ag2',
    agentName: 'Aisha Mohammed',
    requestedAt: '08 May 2026',
    extractedAt: '12 May 2026',
    verifiedAt: '15 May 2026',
    updatedAt: '15 May 2026',
    esg: { overall: 92, environmental: 94, social: 90, governance: 91, supplyChain: 93 },
    carbonTotal: 18.6,
    carbonIntensity: 2.35,
    testResultId: undefined,
    composition: [
      { label: 'Lithium Oxide', formula: 'Li₂O', value: 5.2 },
      { label: 'Iron Oxide', formula: 'Fe₂O₃', value: 0.85 },
      { label: 'Silica', formula: 'SiO₂', value: 68.4 },
      { label: 'Alumina', formula: 'Al₂O₃', value: 1.25 },
      { label: 'Moisture', formula: 'H₂O', value: 0.45 },
    ],
    journey: [
      { key: 'extraction', date: '12 May 2026', location: 'Karu Lithium Project' },
      { key: 'processing', date: '13 May 2026', location: 'Karu Processing Plant' },
      { key: 'transport', date: '14 May 2026', location: 'Karu → Lagos Port' },
      { key: 'export', date: '15 May 2026', location: 'Lagos Port' },
    ],
    custody: [
      { id: 'c1', label: 'Sample sealed in tamper-proof QR bag', actor: 'Aisha Mohammed · Agent', at: '12 May 2026 · 10:20', txHash: ethHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855') },
      { id: 'c2', label: 'Lab assay completed & signed off', actor: 'Geneva Assay Laboratories', at: '14 May 2026 · 16:05', txHash: ethHash('a1f5c2b9d8e74630aa12bd3490e7f8c1ee2299aa44bb55cc66dd77ee88ff0011') },
      { id: 'c3', label: 'Passport approved & anchored', actor: 'GenesysOne Compliance', at: '15 May 2026 · 09:12', txHash: ethHash('9b74c9897bac770ffc029102a200c5de2dd5f3f1f3a7b9c0e1d2c3b4a5968778') },
    ],
    chain: 'Ethereum',
    txHash: ethHash('9b74c9897bac770ffc029102a200c5de2dd5f3f1f3a7b9c0e1d2c3b4a5968778'),
    anchoredAt: '15 May 2026 · 09:12',
  },
  {
    id: 'p2',
    number: 'GO-SN-2026-000118',
    status: 'in_verification',
    inventoryId: 'inv1',
    mineral: 'tin',
    productName: 'Cassiterite Concentrate',
    grade: 71.4,
    gradeLabel: '71.4% Sn',
    quantity: 60,
    unit: 'ton',
    miningMethod: 'Alluvial / Open Pit',
    batchId: 'BTH-TIN-0091',
    seller: SELLER_CO,
    siteId: 'site1',
    siteName: 'Barkin Ladi Tin Field',
    region: 'Plateau',
    country: 'Nigeria',
    gps: { lat: 9.5361, lng: 8.9012 },
    agentId: 'ag2',
    agentName: 'Aisha Mohammed',
    requestedAt: '02 Jun 2026',
    extractedAt: '05 Jun 2026',
    updatedAt: '06 Jun 2026',
    esg: { overall: 88, environmental: 86, social: 89, governance: 90, supplyChain: 87 },
    carbonTotal: 9.2,
    carbonIntensity: 1.8,
    composition: [
      { label: 'Tin', formula: 'Sn', value: 71.4 },
      { label: 'Silica', formula: 'SiO₂', value: 18.6 },
      { label: 'Iron', formula: 'Fe', value: 2.1 },
      { label: 'Tantalum Oxide', formula: 'Ta₂O₅', value: 0.4 },
      { label: 'Moisture', formula: 'H₂O', value: 0.6 },
    ],
    journey: [
      { key: 'extraction', date: '05 Jun 2026', location: 'Barkin Ladi Tin Field' },
      { key: 'processing', date: '06 Jun 2026', location: 'Jos Processing Yard' },
    ],
    custody: [
      { id: 'c1', label: 'Sample sealed in tamper-proof QR bag', actor: 'Aisha Mohammed · Agent', at: '05 Jun 2026 · 11:40', txHash: ethHash('44bb55cc66dd77ee88ff0011a1f5c2b9d8e74630aa12bd3490e7f8c1ee2299aa') },
    ],
    chain: 'Ethereum',
  },
  {
    id: 'p3',
    number: 'GO-NB-2026-000131',
    status: 'pending',
    inventoryId: 'inv2',
    mineral: 'columbite',
    productName: 'Columbite Concentrate',
    grade: 64.2,
    gradeLabel: '64.2% Nb₂O₅',
    quantity: 40,
    unit: 'ton',
    miningMethod: 'Open Pit',
    batchId: 'BTH-COL-0021',
    seller: SELLER_CO,
    siteId: 'site3',
    siteName: 'Nasarawa Eggon Columbite',
    region: 'Nasarawa',
    country: 'Nigeria',
    gps: { lat: 8.7333, lng: 8.55 },
    requestedAt: '26 Jun 2026',
    updatedAt: '26 Jun 2026',
    chain: 'Ethereum',
  },
  marketPassport('GO-SN-2026-000150', 'tin', 'Cassiterite Concentrate', 71.4, '71.4% Sn', 60, 'ton', 'Jos Highland Minerals Ltd', 'Barkin Ladi Tin Field', 'Plateau', { lat: 9.5361, lng: 8.9012 }, 'Alluvial / Open Pit', 'BTH-TIN-0150',
    [{ label: 'Tin', formula: 'Sn', value: 71.4 }, { label: 'Iron Oxide', formula: 'Fe₂O₃', value: 4.8 }, { label: 'Silica', formula: 'SiO₂', value: 18.2 }, { label: 'Tantalum Oxide', formula: 'Ta₂O₅', value: 0.9 }, { label: 'Moisture', formula: 'H₂O', value: 0.4 }],
    { overall: 90, environmental: 89, social: 91, governance: 92, supplyChain: 90 }, 9.4, 1.5),
  marketPassport('GO-PB-2026-000148', 'lead', 'Galena Concentrate', 82.0, '82.0% Pb', 200, 'ton', SELLER_CO, 'Ishiagu Lead Field', 'Ebonyi', { lat: 5.8667, lng: 7.5167 }, 'Open Pit', 'BTH-PBL-0148',
    [{ label: 'Lead', formula: 'Pb', value: 82.0 }, { label: 'Zinc', formula: 'Zn', value: 6.5 }, { label: 'Silver', formula: 'Ag', value: 0.4 }, { label: 'Silica', formula: 'SiO₂', value: 10.1 }, { label: 'Moisture', formula: 'H₂O', value: 0.5 }],
    { overall: 87, environmental: 86, social: 88, governance: 89, supplyChain: 87 }, 13.1, 1.6),
  marketPassport('GO-AU-2026-000140', 'gold', 'Gold Concentrate', 91.6, '91.6% Au', 12, 'kg', SELLER_CO, 'Anka Gold Field', 'Zamfara', { lat: 12.1136, lng: 5.9281 }, 'Alluvial', 'BTH-GLD-0140',
    [{ label: 'Gold', formula: 'Au', value: 91.6 }, { label: 'Silver', formula: 'Ag', value: 6.2 }, { label: 'Copper', formula: 'Cu', value: 1.1 }, { label: 'Moisture', formula: 'H₂O', value: 0.3 }],
    { overall: 90, environmental: 88, social: 91, governance: 92, supplyChain: 89 }, 6.1, 1.4),
  marketPassport('GO-ZN-2026-000142', 'zinc', 'Sphalerite Concentrate', 55.3, '55.3% Zn', 90, 'ton', SELLER_CO, 'Lokoja Zinc Project', 'Kogi', { lat: 7.8023, lng: 6.7333 }, 'Open Pit', 'BTH-ZNC-0142',
    [{ label: 'Zinc', formula: 'Zn', value: 55.3 }, { label: 'Iron', formula: 'Fe', value: 7.4 }, { label: 'Silica', formula: 'SiO₂', value: 12.1 }, { label: 'Sulphur', formula: 'S', value: 30.2 }, { label: 'Moisture', formula: 'H₂O', value: 0.5 }],
    { overall: 89, environmental: 90, social: 88, governance: 90, supplyChain: 88 }, 12.4, 1.6),
  marketPassport('GO-NB-2026-000145', 'columbite', 'Columbite Concentrate', 64.2, '64.2% Nb₂O₅', 50, 'ton', SELLER_CO, 'Nasarawa Eggon Field', 'Nasarawa', { lat: 8.7333, lng: 8.55 }, 'Open Pit', 'BTH-COL-0145',
    [{ label: 'Niobium Oxide', formula: 'Nb₂O₅', value: 64.2 }, { label: 'Tantalum Oxide', formula: 'Ta₂O₅', value: 8.9 }, { label: 'Iron', formula: 'Fe', value: 9.1 }, { label: 'Moisture', formula: 'H₂O', value: 0.6 }],
    { overall: 91, environmental: 92, social: 90, governance: 91, supplyChain: 92 }, 10.2, 1.7),
]

// ---- KYC / KYB review queue (all submissions land with Compliance) ----
export const KYC_SUBMISSIONS: KycSubmission[] = [
  {
    id: 'kyc0',
    company: SELLER_CO,
    role: 'seller',
    type: 'miner',
    contactName: 'Amara Okwuosa',
    contactEmail: 'kyc@joshighland.ng',
    state: 'Plateau',
    lga: 'Barkin Ladi',
    incorporationType: 'registered_company',
    incorporationDate: '12 Apr 2019',
    tin: '01234567-0001',
    license: { kind: 'Mining License', number: 'SMDF/ML/2019/0421', expiry: 'Apr 2027' },
    documents: [
      { name: 'Certificate of incorporation', kind: 'Incorporation', status: 'verified' },
      { name: 'Mining license (SMDF)', kind: 'License', status: 'received' },
      { name: 'Proof of business address', kind: 'Address', status: 'received' },
    ],
    directors: [
      { name: 'Amara Okwuosa', role: 'Managing Director', nin: '20184792013', bvn: '22193845011', verification: 'verified' },
      { name: 'Ibrahim Suleiman', role: 'Operations Director', nin: '30197462200', bvn: '22456710093', verification: 'pending' },
    ],
    status: 'under_review',
    submittedAt: '25 Jun 2026',
  },
  {
    id: 'kyc3',
    company: 'Geneva Assay Laboratories',
    role: 'lab',
    type: 'lab',
    contactName: 'Dr. Hauwa Lawal',
    contactEmail: 'lab@genevaassay.ng',
    state: 'FCT - Abuja',
    lga: 'Abuja Municipal',
    incorporationType: 'registered_company',
    incorporationDate: '19 Jan 2017',
    tin: '55512388-0001',
    license: { kind: 'ISO/IEC 17025 Accreditation', number: 'ANAB-L2241', expiry: 'Jul 2026' },
    documents: [
      { name: 'Certificate of incorporation', kind: 'Incorporation', status: 'verified' },
      { name: 'ISO/IEC 17025 accreditation', kind: 'Accreditation', status: 'flagged' },
      { name: 'Equipment calibration records', kind: 'Technical', status: 'received' },
    ],
    directors: [
      { name: 'Dr. Hauwa Lawal', role: 'Lab Director', nin: '60771224590', bvn: '22019384756', verification: 'verified' },
      { name: 'Emeka Obi', role: 'QC Officer', nin: '70881345672', bvn: '22556677889', verification: 'pending' },
    ],
    status: 'under_review',
    submittedAt: '21 Jun 2026',
  },
]

/** Per-account KYC status — Compliance can change a counterparty's status live. */
export const KYC_STATUS: Record<Role, KycStatus> = {
  seller: 'under_review',
  buyer: 'not_started',
  lab: 'under_review',
  compliance: 'verified',
}
