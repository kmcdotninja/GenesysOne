import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as mock from '@/data/mock'
import { BUYER_CO, COMPLIANCE_CO, MINERAL_ELEMENT, SELLER_CO } from '@/data/mock'
import type {
  ComplianceAgent,
  Currency,
  CustodyEvent,
  EsgScore,
  InventoryItem,
  Listing,
  MiningSite,
  NotificationItem,
  Passport,
  RFQ,
  RfqMessage,
  RFQStatus,
  Role,
  SampleRequest,
  SampleStatus,
  SamplingRequest,
  TestingRequest,
  TestingStatus,
  Trade,
  Transaction,
  TestResult,
} from '@/data/types'
import { money } from '@/lib/format'

const KEY = 'genesys.store.v3'

interface StoreState {
  inventory: InventoryItem[]
  listings: Listing[]
  samplingRequests: SamplingRequest[]
  testingRequests: TestingRequest[]
  rfqs: RFQ[]
  sampleRequests: SampleRequest[]
  trades: Trade[]
  transactions: Transaction[]
  labTransactions: Transaction[]
  testResults: TestResult[]
  notifications: NotificationItem[]
  passports: Passport[]
  miningSites: MiningSite[]
  agents: ComplianceAgent[]
  walletNGN: number
  walletUSD: number
  labWalletNGN: number
}

function initialState(): StoreState {
  return {
    inventory: mock.INVENTORY,
    listings: mock.LISTINGS,
    samplingRequests: mock.SAMPLING_REQUESTS,
    testingRequests: mock.TESTING_REQUESTS,
    rfqs: mock.RFQS,
    sampleRequests: mock.SAMPLE_REQUESTS,
    trades: mock.TRADES,
    transactions: mock.TRANSACTIONS,
    labTransactions: mock.LAB_TRANSACTIONS,
    testResults: mock.TEST_RESULTS,
    notifications: mock.NOTIFICATIONS,
    passports: mock.PASSPORTS,
    miningSites: mock.MINING_SITES,
    agents: mock.COMPLIANCE_AGENTS,
    walletNGN: mock.WALLET.balanceNGN,
    walletUSD: mock.WALLET.balanceUSD,
    labWalletNGN: mock.LAB_WALLET.balanceNGN,
  }
}

function load(): StoreState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...initialState(), ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return initialState()
}

export function newId(prefix = 'gx'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
}

function mkNotif(
  audience: Role,
  category: NotificationItem['category'],
  title: string,
  body: string,
  link?: string,
): NotificationItem {
  return { id: newId('n'), audience, category, title, body, read: false, time: 'Just now', link }
}

let orderSeq = 24900
function nextOrderNumber(): string {
  return `GEN-${orderSeq++}`
}
function batchFor(mineral: string): string {
  return `BTH-${mineral.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`
}

let passportSeq = 132
function nextPassportNumber(mineral: keyof typeof MINERAL_ELEMENT): string {
  const sym = MINERAL_ELEMENT[mineral].symbol.toUpperCase()
  return `GO-${sym}-${new Date().getFullYear()}-${String(passportSeq++).padStart(6, '0')}`
}
/** Mock a Stellar transaction id (56-char base32) for the on-chain anchor. */
function stellarTx(): string {
  const a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let id = ''
  for (let i = 0; i < 56; i++) id += a[Math.floor(Math.random() * a.length)]
  return id
}
/** A plausible default ESG score for a freshly approved passport. */
function defaultEsg(): EsgScore {
  const r = (lo: number, hi: number) => Math.round(lo + Math.random() * (hi - lo))
  const environmental = r(84, 95)
  const social = r(84, 94)
  const governance = r(86, 95)
  const supplyChain = r(85, 95)
  return {
    overall: Math.round((environmental + social + governance + supplyChain) / 4),
    environmental,
    social,
    governance,
    supplyChain,
  }
}

interface StoreApi extends StoreState {
  addInventory: (item: InventoryItem) => void
  updateInventory: (id: string, changes: Partial<InventoryItem>) => void
  addSampling: (item: SamplingRequest) => void
  addListing: (item: Listing) => void
  addTestingRequest: (item: TestingRequest) => void
  setTestingStatus: (id: string, status: TestingStatus) => void
  addRfq: (item: RFQ) => void
  respondToRfq: (id: string, status: RFQStatus, quotedPrice?: number) => void
  sendRfqMessage: (id: string, from: Role, body: string, price?: number) => void
  agreeRfq: (id: string, acceptedBy: Role) => boolean
  addSampleRequest: (item: SampleRequest) => void
  setSampleStatus: (id: string, status: SampleStatus) => void
  placeOrder: (input: {
    mineral: Trade['mineral']
    grade: number
    quantity: number
    unit: Trade['unit']
    value: number
    currency: Currency
    seller: string
    certified?: boolean
  }) => boolean
  acceptOrder: (id: string) => void
  releaseEscrow: (id: string) => void
  deposit: (amount: number, currency: Currency, method: Transaction['method']) => void
  withdraw: (amount: number, currency: Currency, lab?: boolean) => boolean
  submitTestResult: (input: {
    requestId: string
    batchId: string
    mineral: TestResult['mineral']
    gradeMeasured: number
    purity: string
    method: TestResult['method']
    signedBy: string
  }) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: (audience?: Role) => void
  // Digital Mineral Passport lifecycle
  requestPassport: (inventoryId: string) => void
  assignAgent: (passportId: string, agentId: string) => void
  submitFieldCapture: (
    passportId: string,
    input: { gps?: { lat: number; lng: number }; siteName?: string; photos?: number },
  ) => void
  approvePassport: (passportId: string) => void
  rejectPassport: (passportId: string, reason: string) => void
  reset: () => void
}

const StoreContext = createContext<StoreApi | null>(null)

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within AppStoreProvider')
  return ctx
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoreState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state))
    } catch {
      /* ignore */
    }
  }, [state])

  const api = useMemo<StoreApi>(() => {
    const patch = (fn: (s: StoreState) => StoreState) => setState(fn)

    return {
      ...state,

      addInventory: (item) =>
        patch((s) => ({ ...s, inventory: [item, ...s.inventory] })),

      updateInventory: (id, changes) =>
        patch((s) => ({
          ...s,
          inventory: s.inventory.map((i) =>
            i.id === id ? { ...i, ...changes, updatedAt: 'Just now' } : i,
          ),
        })),

      addSampling: (item) =>
        patch((s) => ({
          ...s,
          samplingRequests: [item, ...s.samplingRequests],
          notifications: [
            mkNotif('seller', 'sample', 'Sampling scheduled', `On-site sampling booked for ${item.mineral}.`),
            ...s.notifications,
          ],
        })),

      addListing: (item) =>
        patch((s) => ({
          ...s,
          listings: [item, ...s.listings],
          notifications: [
            mkNotif('seller', 'system', 'Listing submitted', `Your ${item.mineral} listing is pending approval.`),
            ...s.notifications,
          ],
        })),

      addTestingRequest: (item) =>
        patch((s) => ({
          ...s,
          testingRequests: [item, ...s.testingRequests],
          notifications: [
            // The lab sees the incoming batch; the requester (seller or buyer) gets a receipt.
            mkNotif('lab', 'test_request', 'New testing request', `${item.requester} sent ${item.mineral} (${item.batchId}) to your queue.`, `/lab/requests?focus=${item.id}`),
            mkNotif(item.requesterRole, 'test_request', 'Testing requested', `${item.mineral} batch ${item.batchId} sent to the lab queue.`, item.requesterRole === 'seller' ? '/seller/qca' : '/buyer/trades'),
            ...s.notifications,
          ],
        })),

      setTestingStatus: (id, status) =>
        patch((s) => ({
          ...s,
          testingRequests: s.testingRequests.map((r) => (r.id === id ? { ...r, status } : r)),
        })),

      addRfq: (item) =>
        patch((s) => ({
          ...s,
          rfqs: [item, ...s.rfqs],
          notifications: [
            mkNotif('buyer', 'rfq', 'RFQ sent', `Quote requested from ${item.seller}.`, '/buyer/rfq'),
            // Surface on the seller account only when it's addressed to our demo seller.
            ...(item.seller === SELLER_CO
              ? [mkNotif('seller', 'rfq', 'New RFQ received', `${item.buyer} requested a quote for ${item.quantity} ${item.unit} of ${item.mineral}.`, `/seller/requests?focus=${item.id}`)]
              : []),
            ...s.notifications,
          ],
        })),

      respondToRfq: (id, status, quotedPrice) =>
        patch((s) => {
          const rfq = s.rfqs.find((r) => r.id === id)
          return {
            ...s,
            rfqs: s.rfqs.map((r) => (r.id === id ? { ...r, status, quotedPrice: quotedPrice ?? r.quotedPrice } : r)),
            notifications: rfq
              ? [
                  mkNotif(
                    'buyer',
                    'rfq',
                    status === 'closed' ? 'RFQ declined' : 'Seller responded',
                    status === 'closed'
                      ? `${rfq.seller} declined your ${rfq.mineral} RFQ.`
                      : `${rfq.seller} ${status === 'negotiation' ? 'opened negotiation on' : 'responded to'} your ${rfq.mineral} RFQ${quotedPrice ? ` — quote ${money(quotedPrice)}` : ''}.`,
                    `/buyer/rfq?focus=${rfq.id}`,
                  ),
                  ...s.notifications,
                ]
              : s.notifications,
          }
        }),

      sendRfqMessage: (id, from, body, price) =>
        patch((s) => {
          const rfq = s.rfqs.find((r) => r.id === id)
          if (!rfq) return s
          const author = from === 'seller' ? rfq.seller : rfq.buyer
          const msg: RfqMessage = { id: newId('rm'), from, author, body, price, at: 'Just now' }
          const notifs: NotificationItem[] = []
          if (from === 'seller') {
            notifs.push(
              mkNotif('buyer', 'rfq', 'New negotiation message', `${rfq.seller} replied on your ${rfq.mineral} RFQ${price ? ` — offer ${money(price)}` : ''}.`, `/buyer/rfq?focus=${rfq.id}`),
            )
          } else if (rfq.seller === SELLER_CO) {
            notifs.push(
              mkNotif('seller', 'rfq', 'New negotiation message', `${rfq.buyer} replied on the ${rfq.mineral} RFQ${price ? ` — counter ${money(price)}` : ''}.`, `/seller/requests?focus=${rfq.id}`),
            )
          }
          return {
            ...s,
            rfqs: s.rfqs.map((r) =>
              r.id === id
                ? {
                    ...r,
                    status: r.status === 'closed' ? r.status : 'negotiation',
                    quotedPrice: price ?? r.quotedPrice,
                    messages: [...(r.messages ?? []), msg],
                  }
                : r,
            ),
            notifications: [...notifs, ...s.notifications],
          }
        }),

      agreeRfq: (id, acceptedBy) => {
        const rfq = state.rfqs.find((r) => r.id === id)
        if (!rfq) return false
        // The deal price is the most recent offer on the table (either side).
        const offer = [...(rfq.messages ?? [])].reverse().find((m) => m.price != null && !m.system)?.price ?? rfq.quotedPrice
        if (!offer || offer <= 0) return false
        // The buyer funds the agreed amount into escrow.
        if (offer > state.walletNGN) return false
        patch((s) => {
          const orderNumber = nextOrderNumber()
          const grade =
            s.listings.find((l) => l.mineral === rfq.mineral)?.grade ??
            s.inventory.find((i) => i.mineral === rfq.mineral)?.grade ??
            0
          const trade: Trade = {
            id: newId('t'),
            orderNumber,
            batchId: batchFor(rfq.mineral),
            mineral: rfq.mineral,
            grade,
            quantity: rfq.quantity,
            unit: rfq.unit,
            value: offer,
            currency: 'NGN',
            seller: rfq.seller,
            buyer: rfq.buyer,
            escrow: 'funded',
            status: 'ongoing',
            certified: false,
            createdAt: 'Just now',
          }
          const sysMsg: RfqMessage = {
            id: newId('rm'),
            from: acceptedBy,
            author: acceptedBy === 'seller' ? rfq.seller : rfq.buyer,
            body: `Agreement reached at ${money(offer)} — order ${orderNumber} created and funded in escrow.`,
            price: offer,
            system: true,
            at: 'Just now',
          }
          return {
            ...s,
            rfqs: s.rfqs.map((r) =>
              r.id === id ? { ...r, status: 'accepted', quotedPrice: offer, messages: [...(r.messages ?? []), sysMsg] } : r,
            ),
            trades: [trade, ...s.trades],
            walletNGN: s.walletNGN - offer,
            transactions: [
              {
                id: newId('tx'),
                type: 'escrow_hold',
                amount: offer,
                currency: 'NGN',
                status: 'completed',
                reference: `ESC-${orderNumber.replace('GEN-', '')}`,
                createdAt: 'Just now',
              },
              ...s.transactions,
            ],
            notifications: [
              mkNotif('buyer', 'trade', 'Agreement reached', `You agreed with ${rfq.seller} on ${rfq.mineral} — ${orderNumber} · ${money(offer)} held in escrow.`, `/buyer/trades?order=${orderNumber}`),
              ...(rfq.seller === SELLER_CO
                ? [mkNotif('seller', 'trade', 'Agreement reached', `${rfq.buyer} accepted terms on ${rfq.mineral} — ${orderNumber} · ${money(offer)} in escrow.`, `/seller/trades?order=${orderNumber}`)]
                : []),
              ...s.notifications,
            ],
          }
        })
        return true
      },

      addSampleRequest: (item) =>
        patch((s) => ({
          ...s,
          sampleRequests: [item, ...s.sampleRequests],
          notifications: [
            mkNotif('buyer', 'sample', 'Sample requested', `Sample request sent to ${item.seller}.`, '/buyer/samples'),
            ...(item.seller === SELLER_CO
              ? [mkNotif('seller', 'sample', 'New sample request', `${item.buyer} requested a ${item.quantity} ${item.unit} ${item.mineral} sample.`, `/seller/requests?focus=${item.id}`)]
              : []),
            ...s.notifications,
          ],
        })),

      setSampleStatus: (id, status) =>
        patch((s) => {
          const sample = s.sampleRequests.find((r) => r.id === id)
          return {
            ...s,
            sampleRequests: s.sampleRequests.map((r) => (r.id === id ? { ...r, status } : r)),
            notifications: sample
              ? [
                  mkNotif(
                    'buyer',
                    'sample',
                    status === 'delivered' ? 'Sample delivered' : 'Sample shipped',
                    status === 'delivered'
                      ? `Your ${sample.mineral} sample from ${sample.seller} has been delivered.`
                      : `${sample.seller} shipped your ${sample.mineral} sample via ${sample.courier}.`,
                    `/buyer/samples?focus=${sample.id}`,
                  ),
                  ...s.notifications,
                ]
              : s.notifications,
          }
        }),

      placeOrder: (input) => {
        const wallet = input.currency === 'NGN' ? state.walletNGN : state.walletUSD
        if (input.value <= 0 || input.value > wallet) return false
        patch((s) => {
          const orderNumber = nextOrderNumber()
          const batchId = batchFor(input.mineral)
          const trade: Trade = {
            id: newId('t'),
            orderNumber,
            batchId,
            mineral: input.mineral,
            grade: input.grade,
            quantity: input.quantity,
            unit: input.unit,
            value: input.value,
            currency: input.currency,
            seller: input.seller,
            buyer: BUYER_CO,
            escrow: 'funded',
            status: 'ongoing',
            certified: !!input.certified,
            createdAt: 'Just now',
          }
          return {
            ...s,
            trades: [trade, ...s.trades],
            walletNGN: input.currency === 'NGN' ? s.walletNGN - input.value : s.walletNGN,
            walletUSD: input.currency === 'USD' ? s.walletUSD - input.value : s.walletUSD,
            transactions: [
              {
                id: newId('tx'),
                type: 'escrow_hold',
                amount: input.value,
                currency: input.currency,
                status: 'completed',
                reference: `ESC-${orderNumber.replace('GEN-', '')}`,
                createdAt: 'Just now',
              },
              ...s.transactions,
            ],
            notifications: [
              mkNotif('buyer', 'trade', 'Order placed', `${orderNumber} · ${input.mineral} · ${money(input.value, input.currency)} held in escrow.`, `/buyer/trades?order=${orderNumber}`),
              ...(input.seller === SELLER_CO
                ? [mkNotif('seller', 'trade', 'New order received', `${BUYER_CO} ordered ${input.quantity} ${input.unit} of ${input.mineral} — ${money(input.value, input.currency)} in escrow.`, `/seller/trades?order=${orderNumber}`)]
                : []),
              ...s.notifications,
            ],
          }
        })
        return true
      },

      acceptOrder: (id) =>
        patch((s) => {
          const trade = s.trades.find((t) => t.id === id)
          return {
            ...s,
            trades: s.trades.map((t) => (t.id === id ? { ...t, accepted: true } : t)),
            notifications: trade
              ? [
                  mkNotif('buyer', 'trade', 'Order accepted', `${trade.seller} accepted ${trade.orderNumber} and is preparing your ${trade.mineral}.`, `/buyer/trades?order=${trade.orderNumber}`),
                  ...s.notifications,
                ]
              : s.notifications,
          }
        }),

      releaseEscrow: (id) =>
        patch((s) => {
          const trade = s.trades.find((t) => t.id === id)
          return {
            ...s,
            trades: s.trades.map((t) =>
              t.id === id ? { ...t, escrow: 'released', status: 'completed' } : t,
            ),
            notifications: trade
              ? [
                  mkNotif('seller', 'payment', 'Escrow released', `${trade.buyer} confirmed delivery of ${trade.orderNumber} — ${money(trade.value, trade.currency)} released to you.`, `/seller/trades?order=${trade.orderNumber}`),
                  mkNotif('buyer', 'trade', 'Trade completed', `${trade.orderNumber} is complete and escrow has been released to ${trade.seller}.`, `/buyer/trades?order=${trade.orderNumber}`),
                  ...s.notifications,
                ]
              : s.notifications,
          }
        }),

      requestPassport: (inventoryId) =>
        patch((s) => {
          const inv = s.inventory.find((i) => i.id === inventoryId)
          if (!inv) return s
          // Don't open a second active passport for the same product.
          if (s.passports.some((p) => p.inventoryId === inventoryId && p.status !== 'rejected')) return s
          const el = MINERAL_ELEMENT[inv.mineral]
          const site = s.miningSites.find((si) => si.region === inv.state && si.operator === SELLER_CO)
          const id = newId('p')
          const passport: Passport = {
            id,
            number: nextPassportNumber(inv.mineral),
            status: 'pending',
            inventoryId,
            mineral: inv.mineral,
            productName: el.product,
            grade: inv.grade,
            gradeLabel: `${inv.grade}${el.gradeUnit}`,
            quantity: inv.available,
            unit: inv.unit,
            miningMethod: site?.method,
            seller: SELLER_CO,
            siteId: site?.id,
            siteName: site?.name ?? `${inv.lga}, ${inv.state}`,
            region: inv.state,
            country: 'Nigeria',
            gps: site?.gps ?? { lat: 9.0, lng: 8.6 },
            requestedAt: 'Just now',
            updatedAt: 'Just now',
            chain: 'Stellar',
          }
          return {
            ...s,
            passports: [passport, ...s.passports],
            notifications: [
              mkNotif('compliance', 'passport', 'New passport request', `${SELLER_CO} requested a passport for ${el.product} (${passport.number}).`, `/compliance/passports?focus=${id}`),
              mkNotif('seller', 'passport', 'Passport requested', `${passport.number} is pending compliance verification.`, '/seller/inventory'),
              ...s.notifications,
            ],
          }
        }),

      assignAgent: (passportId, agentId) =>
        patch((s) => {
          const agent = s.agents.find((a) => a.id === agentId)
          const passport = s.passports.find((p) => p.id === passportId)
          if (!passport) return s
          return {
            ...s,
            passports: s.passports.map((p) =>
              p.id === passportId
                ? { ...p, status: 'in_verification', agentId, agentName: agent?.name, updatedAt: 'Just now' }
                : p,
            ),
            agents: s.agents.map((a) =>
              a.id === agentId ? { ...a, status: 'on_assignment', assignments: a.assignments + 1 } : a,
            ),
            notifications: [
              mkNotif('seller', 'passport', 'Verification started', `${agent?.name ?? 'A field agent'} was assigned to verify ${passport.number}.`, '/seller/inventory'),
              ...s.notifications,
            ],
          }
        }),

      submitFieldCapture: (passportId, input) =>
        patch((s) => {
          const passport = s.passports.find((p) => p.id === passportId)
          if (!passport) return s
          const event: CustodyEvent = {
            id: newId('c'),
            label: `Field capture complete${input.photos ? ` · ${input.photos} photos` : ''} · sample sealed in QR bag`,
            actor: `${passport.agentName ?? 'Field agent'} · Agent`,
            at: 'Just now',
            txHash: stellarTx(),
          }
          return {
            ...s,
            passports: s.passports.map((p) =>
              p.id === passportId
                ? {
                    ...p,
                    gps: input.gps ?? p.gps,
                    siteName: input.siteName ?? p.siteName,
                    extractedAt: p.extractedAt ?? 'Just now',
                    custody: [...(p.custody ?? []), event],
                    updatedAt: 'Just now',
                  }
                : p,
            ),
            notifications: [
              mkNotif('compliance', 'passport', 'Field capture uploaded', `${passport.number} has GPS + photos — ready for lab + approval.`, `/compliance/passports?focus=${passportId}`),
              ...s.notifications,
            ],
          }
        }),

      approvePassport: (passportId) =>
        patch((s) => {
          const passport = s.passports.find((p) => p.id === passportId)
          if (!passport) return s
          const tx = stellarTx()
          const anchor: CustodyEvent = {
            id: newId('c'),
            label: 'Passport approved & anchored on Stellar',
            actor: COMPLIANCE_CO,
            at: 'Just now',
            txHash: tx,
          }
          return {
            ...s,
            passports: s.passports.map((p) =>
              p.id === passportId
                ? {
                    ...p,
                    status: 'verified',
                    verifiedAt: 'Just now',
                    updatedAt: 'Just now',
                    esg: p.esg ?? defaultEsg(),
                    carbonTotal: p.carbonTotal ?? Math.round((p.quantity * 0.15 + 5) * 10) / 10,
                    carbonIntensity: p.carbonIntensity ?? 1.9,
                    chain: 'Stellar',
                    txHash: `stellar:${tx}`,
                    anchoredAt: 'Just now',
                    custody: [...(p.custody ?? []), anchor],
                  }
                : p,
            ),
            agents: passport.agentId
              ? s.agents.map((a) =>
                  a.id === passport.agentId ? { ...a, status: 'available', assignments: Math.max(0, a.assignments - 1) } : a,
                )
              : s.agents,
            notifications: [
              mkNotif('seller', 'passport', 'Passport verified', `${passport.number} is now blockchain-verified and live — share the public link or print the QR.`, '/seller/inventory'),
              ...s.notifications,
            ],
          }
        }),

      rejectPassport: (passportId, reason) =>
        patch((s) => {
          const passport = s.passports.find((p) => p.id === passportId)
          if (!passport) return s
          return {
            ...s,
            passports: s.passports.map((p) =>
              p.id === passportId ? { ...p, status: 'rejected', rejectedReason: reason, updatedAt: 'Just now' } : p,
            ),
            agents: passport.agentId
              ? s.agents.map((a) =>
                  a.id === passport.agentId ? { ...a, status: 'available', assignments: Math.max(0, a.assignments - 1) } : a,
                )
              : s.agents,
            notifications: [
              mkNotif('seller', 'passport', 'Passport rejected', `${passport.number} was rejected: ${reason}`, '/seller/inventory'),
              ...s.notifications,
            ],
          }
        }),

      deposit: (amount, currency, method) =>
        patch((s) => ({
          ...s,
          walletNGN: currency === 'NGN' ? s.walletNGN + amount : s.walletNGN,
          walletUSD: currency === 'USD' ? s.walletUSD + amount : s.walletUSD,
          transactions: [
            {
              id: newId('tx'),
              type: 'deposit',
              method,
              amount,
              currency,
              status: 'completed',
              reference: newId('DEP').toUpperCase(),
              createdAt: 'Just now',
            },
            ...s.transactions,
          ],
          notifications: [
            mkNotif('buyer', 'payment', 'Funds added', `${money(amount, currency)} added to your wallet.`, '/buyer/wallet'),
            ...s.notifications,
          ],
        })),

      withdraw: (amount, currency, lab) => {
        const balance = lab ? state.labWalletNGN : currency === 'NGN' ? state.walletNGN : state.walletUSD
        if (amount <= 0 || amount > balance) return false
        patch((s) => {
          const tx: Transaction = {
            id: newId('tx'),
            type: 'withdrawal',
            method: 'bank_transfer',
            amount,
            currency,
            status: 'pending',
            reference: newId('WTH').toUpperCase(),
            createdAt: 'Just now',
          }
          if (lab) {
            return {
              ...s,
              labWalletNGN: s.labWalletNGN - amount,
              labTransactions: [tx, ...s.labTransactions],
              notifications: [
                mkNotif('lab', 'payment', 'Withdrawal requested', `${money(amount, currency)} is processing.`, '/lab/wallet'),
                ...s.notifications,
              ],
            }
          }
          return {
            ...s,
            walletNGN: currency === 'NGN' ? s.walletNGN - amount : s.walletNGN,
            walletUSD: currency === 'USD' ? s.walletUSD - amount : s.walletUSD,
            transactions: [tx, ...s.transactions],
            notifications: [
              mkNotif('buyer', 'payment', 'Withdrawal requested', `${money(amount, currency)} is processing.`, '/buyer/wallet'),
              ...s.notifications,
            ],
          }
        })
        return true
      },

      submitTestResult: (input) =>
        patch((s) => {
          const fee = 1100000
          const request = s.testingRequests.find((r) => r.id === input.requestId)
          // Tell whoever raised the request that their certificate is ready.
          const requesterRole = request?.requesterRole ?? 'seller'
          const resId = newId('res')
          const labEvent: CustodyEvent = {
            id: newId('c'),
            label: 'Lab assay completed & signed off',
            actor: `${input.signedBy} · Lab`,
            at: 'Just now',
            txHash: stellarTx(),
          }
          return {
            ...s,
            testResults: [
              {
                id: resId,
                batchId: input.batchId,
                mineral: input.mineral,
                gradeMeasured: input.gradeMeasured,
                purity: input.purity,
                method: input.method,
                signedBy: input.signedBy,
                signedAt: 'Just now',
                status: 'completed',
              },
              ...s.testResults,
            ],
            testingRequests: s.testingRequests.map((r) =>
              r.id === input.requestId ? { ...r, status: 'completed' } : r,
            ),
            // Any trade carrying this batch is now backed by a signed certificate.
            trades: s.trades.map((t) => (t.batchId === input.batchId ? { ...t, certified: true } : t)),
            // Feed the result into any passport tracking this batch.
            passports: s.passports.map((p) =>
              p.batchId === input.batchId
                ? { ...p, testResultId: resId, custody: [...(p.custody ?? []), labEvent], updatedAt: 'Just now' }
                : p,
            ),
            labWalletNGN: s.labWalletNGN + fee,
            labTransactions: [
              {
                id: newId('tx'),
                type: 'payment',
                amount: fee,
                currency: 'NGN',
                status: 'completed',
                reference: `PAY-${input.batchId}`,
                createdAt: 'Just now',
              },
              ...s.labTransactions,
            ],
            notifications: [
              mkNotif('lab', 'payment', 'Certificate published', `Result for ${input.batchId} is now linked · ${money(fee)} credited.`, '/lab/history'),
              mkNotif(requesterRole, 'test_request', 'Certificate ready', `Your ${input.mineral} batch ${input.batchId} has been certified by the lab.`, requesterRole === 'seller' ? '/seller/qca' : '/buyer/trades'),
              ...s.notifications,
            ],
          }
        }),

      markNotificationRead: (id) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllNotificationsRead: (audience) =>
        patch((s) => ({
          ...s,
          notifications: s.notifications.map((n) =>
            !audience || n.audience === audience ? { ...n, read: true } : n,
          ),
        })),

      reset: () => {
        try {
          localStorage.removeItem(KEY)
        } catch {
          /* ignore */
        }
        setState(initialState())
      },
    }
  }, [state])

  return <StoreContext.Provider value={api}>{children}</StoreContext.Provider>
}
