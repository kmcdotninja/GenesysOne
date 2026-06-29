# Genesys One — Buyer Interface

> Builds on `00-platform-foundations.md`. Shared entities (User, KYCProfile,
> Director, Wallet, Transaction, status machines, enums) are defined there and
> only referenced here.

**Role:** `buyer` · **Gating:** sending an RFQ, funding beyond a low cap, and
opening a trade require `kyc_status = verified` (foundations §9).

---

## Navigation / information architecture

```
Buyer
├── 1. Dashboard           /buyer/dashboard      (KYC)
├── 2. Wallet              /buyer/wallet
├── 3. Marketplace         /buyer/marketplace    (Sellers & Listings)
├── 4. RFQ                 /buyer/rfq
├── 5. Trade               /buyer/trades
└── 6. Sample Requests     /buyer/samples
```

---

## 1. Dashboard — KYC (Company Profile)

Identical structure to the shared company KYC (foundations §8.2 + §8.4).

**i. Company Details:** Company Name, Description, Address, State, LGA;
Incorporation Type (business_name / registered_company), Incorporation Date,
Incorporation Document (file), TIN (O), Proof of Business Address (O).

**ii. Directors' Details** (repeatable, min 1): First Name, Last Name, DOB,
Email, Phone, Nationality.

**iii. Directors Verification:** NIN, BVN, ID Document Upload
(international_passport / drivers_license / pvc / nin_card) → **Submit → Verify KYC**.

---

## 2. Wallet

Uses shared `Wallet` + `Transaction` (foundations §8.5–8.6).

| Action | Detail |
|--------|--------|
| **Add Funds** | method ∈ {bank_transfer, card, stablecoin} → amount → confirm |
| **Withdraw Funds** | amount ≤ available balance → destination → confirm |
| **Wallet Balance** | shown per currency: ₦ and $ |
| **Transaction History** | filter by type: Deposits, Withdrawals, Escrows |

> Funding/withdrawal are money-moving actions → require an idempotency key and
> follow the Escrow/Transaction rules in foundations §8.6 and §11.

---

## 3. Marketplace — Sellers & Listings

Discovery surface over approved seller listings.

**Search / filter:** Mineral, Grade, Quantity, Location (state/LGA).

**Seller profile view:** company info + **KYC-verified badge** (shown only when
the seller's `kyc_status = verified`).

**Listing card / detail:** price, grade, delivery mode, location type, storage
location, quantity available, and any attached test certificate.

**Per-listing actions:**
- **Request Sample** → opens the Sample Request flow (§6) prefilled with the listing.
- **Send RFQ** → opens the RFQ flow (§4) prefilled with the listing's mineral/seller.

---

## 4. RFQ — Request for Quote

### 4a. Create RFQ
| Field | Type | R/O | Options |
|-------|------|-----|---------|
| Mineral Type | select(MINERALS) | R | |
| Quantity | number | R | |
| Unit | select(UNIT_OF_MEASURE) | R | |
| Delivery Location — Country | select(country) | R | |
| Delivery Location — State / LGA | select | R | |
| Delivery Location — Address | text | R | |
| Preferred Incoterms | select(INCOTERMS) | R | fob / cif / exw |
| Delivery Mode | select(DELIVERY_MODE) | R | delivery / pickup |
| Expected Delivery Timeline | date | R | not in the past |
| Payment Terms | select(PAYMENT_TERMS) | R | wallet / letter_of_credit / bank_transfer |

### 4b. Track RFQs
List with status filter ∈ {pending, responded, negotiation, closed}
(foundations §7). A seller response can convert a negotiated RFQ into a Trade.

---

## 5. Trade

### 5a. Active Trades
| Field shown |
|-------------|
| Order ID · Mineral · Grade · Quantity |
| Trade Value · Seller · Escrow Status |
| Trade Status ∈ {ongoing, completed, cancelled} |

### 5b. Trade History
**KPIs:** Total Volume Purchased · Total Value Purchased · Completed Trades.
**Search:** by Batch ID / Order Number.

---

## 6. Sample Requests

### 6a. Request Sample (from a listing)
| Field | Type | R/O |
|-------|------|-----|
| Mineral Type | select(MINERALS) | R |
| Quantity | number + unit | R |
| Delivery Address | text | R |
| Preferred Courier | text | O |
| Contact Person | text | R |
| Contact Phone Number | phone | R |

### 6b. Track Sample Requests
Status filter ∈ {pending, shipped, delivered} (foundations §7).

---

## Buyer-only entities

### RFQ
`id, buyer_id, listing_id?, seller_id?, mineral, quantity, unit,
delivery_country, delivery_state, delivery_lga, delivery_address, incoterms,
delivery_mode, expected_timeline, payment_terms, status (RFQ machine),
created_at, updated_at`

### Trade
`id, order_number (unique), batch_id, buyer_id, seller_id, listing_id, mineral,
grade, quantity, unit, trade_value, currency, escrow_status (Escrow machine),
status (Trade machine), test_result_id?, created_at, updated_at`

### SampleRequest
`id, buyer_id, listing_id, seller_id, mineral, quantity, unit, delivery_address,
courier?, contact_name, contact_phone, status (Sample machine), created_at`

> `Wallet` + `Transaction` are shared (foundations §8.5–8.6). Escrow holds are
> `Transaction` rows of type `escrow_hold` / `escrow_release` / `escrow_refund`,
> linked to a `Trade`.

---

## Buyer API surface (adds to foundations §10)

```
# Wallet (shared base, exposed to buyer)
GET   /buyer/wallet
POST  /buyer/wallet/deposit
POST  /buyer/wallet/withdraw
GET   /buyer/wallet/transactions?type=

# Marketplace
GET   /buyer/marketplace/listings?mineral=&grade=&quantity=&state=&lga=
GET   /buyer/marketplace/sellers/:id

# RFQ
POST  /buyer/rfqs
GET   /buyer/rfqs?status=
GET   /buyer/rfqs/:id

# Trade
GET   /buyer/trades?status=&batch_id=&order_number=
GET   /buyer/trades/:id
GET   /buyer/trades/summary        # volume/value/completed KPIs

# Samples
POST  /buyer/sample-requests
GET   /buyer/sample-requests?status=
```

---

## Business rules

1. Marketplace shows only listings whose status = `approved`.
2. The KYC-verified badge renders strictly from the seller's `kyc_status`.
3. Opening a trade with `payment_terms = wallet` places an **escrow hold** for
   the trade value; release to seller on `completed`, refund on `cancelled`.
4. RFQ and trade creation require buyer `kyc_status = verified`.
5. Trade History KPIs are derived from the buyer's trades.

## Acceptance criteria

- [ ] Buyer completes company KYC and director verification.
- [ ] Buyer funds wallet (each method) and sees balance + categorised history.
- [ ] Marketplace filters by mineral/grade/quantity/location; verified badge shows.
- [ ] Buyer sends an RFQ and tracks it through the four statuses.
- [ ] Wallet-term trade places an escrow hold; release/refund works on close.
- [ ] Buyer requests a sample from a listing and tracks it through delivery.
