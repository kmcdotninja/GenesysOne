import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as mock from '@/data/mock'
import { BUYER_CO, SELLER_CO } from '@/data/mock'
import type {
  Currency,
  InventoryItem,
  Listing,
  NotificationItem,
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

const KEY = 'genesys.store.v2'

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
          return {
            ...s,
            testResults: [
              {
                id: newId('res'),
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
