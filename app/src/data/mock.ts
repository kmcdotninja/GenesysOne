import type {
  Director,
  InventoryItem,
  Listing,
  MarketListing,
  NotificationItem,
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
  { id: 'lst2', mineral: 'columbite', grade: 64.2, quantity: 40, unit: 'ton', priceAmount: 19200000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'pending', certified: false, createdAt: '10 Feb 2025' },
  { id: 'lst3', mineral: 'lithium', grade: 5.8, quantity: 120, unit: 'ton', priceAmount: 8400000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'approved', certified: true, createdAt: '08 Feb 2025' },
  { id: 'lst4', mineral: 'tantalite', grade: 38.5, quantity: 20, unit: 'ton', priceAmount: 41000000, priceCurrency: 'NGN', state: 'Kaduna', status: 'completed', certified: true, createdAt: '02 Feb 2025' },
  { id: 'lst5', mineral: 'lead', grade: 82.0, quantity: 150, unit: 'ton', priceAmount: 12750000, priceCurrency: 'NGN', state: 'Ebonyi', status: 'draft', certified: false, createdAt: '14 Feb 2025' },
  { id: 'lst6', mineral: 'gold', grade: 91.6, quantity: 10, unit: 'kg', priceAmount: 96900000, priceCurrency: 'NGN', state: 'Zamfara', status: 'rejected', certified: false, createdAt: '01 Feb 2025' },
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
  { id: 't2', orderNumber: 'GEN-24790', batchId: 'BTH-TAN-0042', mineral: 'tantalite', grade: 38.5, quantity: 20, unit: 'ton', value: 41000000, currency: 'NGN', seller: SELLER_CO, buyer: 'Sahel Refiners Co.', escrow: 'released', status: 'completed', certified: true, createdAt: '02 Feb 2025' },
  { id: 't3', orderNumber: 'GEN-24755', batchId: 'BTH-LIT-0188', mineral: 'lithium', grade: 5.8, quantity: 120, unit: 'ton', value: 8400000, currency: 'NGN', seller: SELLER_CO, buyer: BUYER_CO, escrow: 'funded', status: 'ongoing', certified: true, createdAt: '08 Feb 2025' },
  { id: 't4', orderNumber: 'GEN-24612', batchId: 'BTH-COL-0021', mineral: 'columbite', grade: 64.2, quantity: 35, unit: 'ton', value: 16800000, currency: 'NGN', seller: 'Eggon Mining Coop', buyer: BUYER_CO, escrow: 'released', status: 'completed', certified: true, createdAt: '21 Jan 2025' },
  { id: 't5', orderNumber: 'GEN-24588', batchId: 'BTH-GLD-0007', mineral: 'gold', grade: 91.6, quantity: 6, unit: 'kg', value: 58140000, currency: 'NGN', seller: 'Sahel Mining Cooperative', buyer: BUYER_CO, escrow: 'refunded', status: 'cancelled', certified: false, createdAt: '15 Jan 2025' },
]

// ---- Lab: testing requests ----
export const TESTING_REQUESTS: TestingRequest[] = [
  { id: 'tr1', batchId: 'BTH-TIN-0091', mineral: 'tin', gradeClaimed: 71.4, quantity: 60, unit: 'ton', requester: 'Jos Highland Minerals Ltd', requesterRole: 'seller', date: '18 Feb 2025', time: '10:00', state: 'Plateau', lga: 'Barkin Ladi', address: 'Plot 14, Mining Belt Rd', deliveryMode: 'on_site_sampling', contactName: 'Sani Bello', contactPhone: '+234 803 221 0091', status: 'incoming' },
  { id: 'tr2', batchId: 'BTH-LIT-0188', mineral: 'lithium', gradeClaimed: 5.8, quantity: 120, unit: 'ton', requester: 'Jos Highland Minerals Ltd', requesterRole: 'seller', date: '19 Feb 2025', time: '14:00', state: 'Nasarawa', lga: 'Karu', address: 'Km 8, Keffi Expressway', deliveryMode: 'courier', contactName: 'Grace Madu', contactPhone: '+234 701 884 2210', status: 'incoming' },
  { id: 'tr3', batchId: 'BTH-TAN-0042', mineral: 'tantalite', gradeClaimed: 38.5, quantity: 20, unit: 'ton', requester: 'Atlantic Metals Trading', requesterRole: 'buyer', date: '15 Feb 2025', time: '11:30', state: 'Kaduna', lga: 'Birnin Gwari', address: 'Warehouse 3, Industrial Layout', deliveryMode: 'on_site_sampling', contactName: 'Musa Danjuma', contactPhone: '+234 809 110 4521', status: 'in_progress' },
  { id: 'tr4', batchId: 'BTH-COL-0021', mineral: 'columbite', gradeClaimed: 64.2, quantity: 35, unit: 'ton', requester: 'Lagos Alloy Works', requesterRole: 'buyer', date: '12 Feb 2025', time: '09:30', state: 'Nasarawa', lga: 'Nasarawa Eggon', address: 'Block C, Eggon Mining Coop', deliveryMode: 'courier', contactName: 'Tunde Bakare', contactPhone: '+234 802 553 7741', status: 'accepted' },
]

export const TEST_RESULTS: TestResult[] = [
  { id: 'res1', batchId: 'BTH-TAN-0042', mineral: 'tantalite', gradeMeasured: 38.1, purity: 'Ta₂O₅ 38.1% · Nb₂O₅ 9.4% · trace Fe', method: 'xrf', signedBy: 'Dr. Hauwa Lawal', signedAt: '03 Feb 2025', status: 'completed' },
  { id: 'res2', batchId: 'BTH-COL-0021', mineral: 'columbite', gradeMeasured: 63.8, purity: 'Nb₂O₅ 63.8% · low Ta · moisture 0.4%', method: 'assay', signedBy: 'Dr. Hauwa Lawal', signedAt: '22 Jan 2025', status: 'completed' },
  { id: 'res3', batchId: 'BTH-LED-0114', mineral: 'lead', gradeMeasured: 79.2, purity: 'Pb 79.2% · Ag trace · within spec', method: 'xrf', signedBy: 'Emeka Obi', signedAt: '18 Jan 2025', status: 'completed' },
  { id: 'res4', batchId: 'BTH-GLD-0007', mineral: 'gold', gradeMeasured: 0, purity: 'Sample failed chain-of-custody check', method: 'assay', signedBy: 'Emeka Obi', signedAt: '16 Jan 2025', status: 'rejected' },
]

// ---- Buyer: marketplace ----
export const MARKET_LISTINGS: MarketListing[] = [
  { id: 'm1', mineral: 'tin', grade: 71.4, quantity: 60, unit: 'ton', priceAmount: 28500000, priceCurrency: 'NGN', state: 'Plateau', status: 'approved', certified: true, sellerName: 'Jos Highland Minerals Ltd', sellerVerified: true, sellerRating: 4.8, deliveryMode: 'delivery', locationType: 'mine', trend: spark(2), createdAt: '12 Feb 2025' },
  { id: 'm2', mineral: 'lithium', grade: 5.8, quantity: 120, unit: 'ton', priceAmount: 8400000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'approved', certified: true, sellerName: 'Jos Highland Minerals Ltd', sellerVerified: true, sellerRating: 4.8, deliveryMode: 'delivery', locationType: 'warehouse', trend: spark(5), createdAt: '08 Feb 2025' },
  { id: 'm3', mineral: 'gold', grade: 91.6, quantity: 12, unit: 'kg', priceAmount: 116000000, priceCurrency: 'NGN', state: 'Zamfara', status: 'approved', certified: true, sellerName: 'Sahel Mining Cooperative', sellerVerified: true, sellerRating: 4.6, deliveryMode: 'pickup', locationType: 'mine', trend: spark(1), createdAt: '11 Feb 2025' },
  { id: 'm4', mineral: 'lead', grade: 82.0, quantity: 200, unit: 'ton', priceAmount: 16800000, priceCurrency: 'NGN', state: 'Ebonyi', status: 'approved', certified: false, sellerName: 'Eastern Ore Traders', sellerVerified: false, sellerRating: 4.1, deliveryMode: 'delivery', locationType: 'warehouse', trend: spark(7), createdAt: '09 Feb 2025' },
  { id: 'm5', mineral: 'zinc', grade: 55.3, quantity: 90, unit: 'ton', priceAmount: 9600000, priceCurrency: 'NGN', state: 'Kogi', status: 'approved', certified: true, sellerName: 'Confluence Metals', sellerVerified: true, sellerRating: 4.4, deliveryMode: 'delivery', locationType: 'mine', trend: spark(3), createdAt: '07 Feb 2025' },
  { id: 'm6', mineral: 'columbite', grade: 64.2, quantity: 50, unit: 'ton', priceAmount: 24000000, priceCurrency: 'NGN', state: 'Nasarawa', status: 'approved', certified: true, sellerName: 'Eggon Mining Coop', sellerVerified: true, sellerRating: 4.7, deliveryMode: 'pickup', locationType: 'mine', trend: spark(4), createdAt: '06 Feb 2025' },
]

// ---- Buyer: RFQs ----
export const RFQS: RFQ[] = [
  { id: 'r1', mineral: 'tin', quantity: 50, unit: 'ton', seller: SELLER_CO, buyer: BUYER_CO, incoterms: 'fob', paymentTerms: 'wallet', deliveryState: 'Lagos', timeline: '28 Feb 2025', status: 'negotiation', quotedPrice: 28250000, messages: [
    { id: 'rm1', from: 'buyer', author: BUYER_CO, body: 'Keen on the full 50 tons delivered to Lagos. Any movement on price if we commit to monthly volume?', at: '13 Feb 2025' },
    { id: 'rm2', from: 'seller', author: SELLER_CO, body: 'We can do ₦565,000/ton FOB — ₦28.25M for the lot. Volume terms are on the table for a 6-month commitment.', price: 28250000, at: '13 Feb 2025' },
  ], createdAt: '13 Feb 2025' },
  { id: 'r2', mineral: 'gold', quantity: 8, unit: 'kg', seller: 'Sahel Mining Cooperative', buyer: BUYER_CO, incoterms: 'cif', paymentTerms: 'letter_of_credit', deliveryState: 'Lagos', timeline: '05 Mar 2025', status: 'responded', createdAt: '12 Feb 2025' },
  { id: 'r3', mineral: 'lithium', quantity: 100, unit: 'ton', seller: SELLER_CO, buyer: BUYER_CO, incoterms: 'exw', paymentTerms: 'bank_transfer', deliveryState: 'Ogun', timeline: '02 Mar 2025', status: 'pending', createdAt: '14 Feb 2025' },
  { id: 'r4', mineral: 'lead', quantity: 150, unit: 'ton', seller: 'Eastern Ore Traders', buyer: BUYER_CO, incoterms: 'fob', paymentTerms: 'wallet', deliveryState: 'Rivers', timeline: '20 Feb 2025', status: 'closed', createdAt: '04 Feb 2025' },
]

export const SAMPLE_REQUESTS: SampleRequest[] = [
  { id: 'sm1', mineral: 'tin', quantity: 5, unit: 'kg', seller: SELLER_CO, buyer: BUYER_CO, courier: 'GIG Logistics', status: 'shipped', createdAt: '13 Feb 2025' },
  { id: 'sm2', mineral: 'gold', quantity: 1, unit: 'kg', seller: 'Sahel Mining Cooperative', buyer: BUYER_CO, courier: 'DHL Express', status: 'delivered', createdAt: '10 Feb 2025' },
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
]
