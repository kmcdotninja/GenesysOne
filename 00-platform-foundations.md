# Genesys One — Platform Foundations

> **Read this first.** This document defines everything shared across the three
> interfaces (Seller, Buyer, Lab). The interface specs
> (`01-seller-interface.md`, `02-buyer-interface.md`, `03-lab-interface.md`)
> reference the entities, enums, conventions, and flows defined here instead of
> redefining them. Build this layer once.

---

## 1. Product summary

**Genesys One** is a mineral traceability and trading web platform for the
Nigerian solid-minerals market. It connects three actors:

| Role   | Purpose |
|--------|---------|
| **Seller** | Lists mineral inventory, requests sampling/testing, sells to buyers |
| **Buyer**  | Discovers listings, sends RFQs, funds a wallet, and completes trades |
| **Lab**    | Receives testing requests, runs assays, and publishes signed results that attach to listings/trades |

A trade's lifecycle threads through all three: a Seller lists a mineral, a Lab
certifies its grade/purity, and a Buyer purchases it with funds held in escrow.

---

## 2. Glossary (Nigeria-specific terms)

| Term | Meaning |
|------|---------|
| **KYC** | Know Your Customer — the business/identity verification flow |
| **LGA** | Local Government Area (administrative subdivision within a Nigerian state) |
| **NIN** | National Identification Number — 11 digits |
| **BVN** | Bank Verification Number — 11 digits |
| **TIN** | Tax Identification Number |
| **PVC** | Permanent Voter's Card |
| **Incoterms** | Standardised international trade terms (FOB, CIF, EXW) |
| **Escrow** | Buyer funds held by the platform until a trade completes |
| **Batch ID** | Unique identifier for a physical lot of mineral, used for traceability |

> NIN and BVN are both standardised 11-digit numbers in Nigeria. Treat the
> formats below as defaults and confirm against the current verification
> provider before go-live.

---

## 3. Tech conventions (suggested, not mandatory)

The specs are stack-agnostic, but to keep Claude Code consistent across files,
assume the following unless told otherwise:

- **Frontend:** React + TypeScript, component-driven, responsive (mobile-first).
- **Backend:** REST API (JSON), resource-oriented routes named in these specs.
- **Auth:** email/password + email verification, JWT or session cookie.
- **Storage:** uploaded files go to object storage; persist only the URL + metadata.
- **Money:** store amounts as integers in the smallest unit (kobo / cents) plus a
  `currency` field. Never use floats for money.
- **IDs:** UUIDs for all primary keys; human-facing identifiers (Order Number,
  Batch ID) are separate, generated, and unique.
- **Timestamps:** UTC, ISO-8601, `created_at` / `updated_at` on every entity.

---

## 4. Field-type vocabulary

Every form field in the interface specs uses one of these types. Implement the
validation primitives once and reuse.

| Type | Notes / default validation |
|------|----------------------------|
| `text` | Trimmed; max 255 unless stated |
| `longtext` | Multiline; max 2000 unless stated |
| `email` | RFC-valid; lowercased; unique where it identifies an account |
| `phone` | Nigerian-friendly: accept `+234…` or `0…`, normalise to E.164 |
| `number` | Integer ≥ 0 unless stated |
| `decimal` | Up to 2 dp unless stated |
| `percentage` | `decimal` constrained to 0–100 |
| `money` | `decimal` amount + `currency` enum (see §6) |
| `date` | Calendar picker; not in the future where it's a DOB or incorporation date |
| `datetime` | Date + time (HH:MM, 24h) |
| `select` | Single choice from a defined enum |
| `multiselect` | Zero+ choices |
| `file` | See §5 |
| `boolean` | Toggle/checkbox |

Required fields are marked **R**; optional **O** in each spec's tables.

---

## 5. File-upload rules

Apply to every `file` field:

- **Accepted types:** PDF, JPG, PNG by default; CSV additionally allowed for lab
  result uploads.
- **Max size:** 10 MB per file (configurable).
- **Validation:** reject on MIME mismatch; virus-scan on upload if available.
- **Storage:** object storage; DB stores `{ url, filename, mime, size, uploaded_at }`.
- **Display:** show filename + preview/download link; allow replace before submit.

---

## 6. Shared reference data (enums)

Centralise these as a single source of truth (DB seed or config) and reference
by key from every interface.

```
MINERALS            = tin, lithium, columbite, lead, zinc, copper,
                      wolframite, monazite, tantalite, beryllium, gold, spodumene
UNIT_OF_MEASURE     = ton, kg, pound, oz
SUPPLY_FREQUENCY    = daily, weekly, monthly, quarterly
DELIVERY_MODE       = delivery, pickup
LOCATION_TYPE       = warehouse, mine
INCORPORATION_TYPE  = business_name, registered_company
ID_DOCUMENT_TYPE    = international_passport, drivers_license, pvc, nin_card
INCOTERMS           = fob, cif, exw
PAYMENT_TERMS       = wallet, letter_of_credit, bank_transfer
FUNDING_METHOD      = bank_transfer, card, stablecoin
TEST_METHOD         = xrf, assay, other          # "other" reveals a free-text field
CURRENCY            = NGN (₦), USD ($)
USER_ROLE           = seller, buyer, lab
```

**Geography:** Nigerian `state` → `lga` is a dependent dropdown. Ship the full
36-states-+-FCT list and their LGAs as seed data; `lga` options must filter by
the selected `state`. `country` uses an ISO country list (default Nigeria).

> Spelling note: the source drafts contain "wolfromite", "Incoporation",
> "columbite". Canonical spellings (wolframite, incorporation) are used here.

---

## 7. Status state machines (cross-cutting)

These statuses appear in multiple interfaces. Define them once.

**Listing**
```
draft → pending → approved → completed
                → rejected
```
Dashboards tally each bucket with a count and a ₦ value: Total, Pending,
Approved, Rejected, Completed.

**Trade**
```
ongoing → completed
        → cancelled
```

**RFQ**
```
pending → responded → negotiation → closed
```

**Sample request**
```
pending → shipped → delivered
```

**Testing request (Lab)**
```
incoming → accepted → in_progress → completed
         → rejected
```

**KYC**
```
not_started → submitted → under_review → verified
                                       → rejected (with reason → resubmit)
```

**Escrow (per trade)**
```
unfunded → funded → released   (to seller on completion)
                  → refunded   (to buyer on cancellation)
```

---

## 8. Core shared entities

Field lists below are the canonical schema. Interface specs add interface-specific
entities only.

### 8.1 User
| Field | Type | R/O | Notes |
|-------|------|-----|-------|
| id | uuid | R | PK |
| name | text | R | |
| username | text | R | unique |
| email | email | R | unique |
| phone | phone | R | |
| country | select | R | ISO list |
| state | select | R | NG states |
| password_hash | — | R | never returned by API |
| role | select(USER_ROLE) | R | seller / buyer / lab |
| email_verified | boolean | R | default false |
| kyc_status | select(KYC) | R | default not_started |
| created_at / updated_at | datetime | R | |

### 8.2 KYCProfile (company)
Used by Seller & Buyer. Lab uses the variant in §8.3.
| Field | Type | R/O |
|-------|------|-----|
| id | uuid | R |
| user_id | uuid (FK→User) | R |
| company_name | text | R |
| description | longtext | O |
| address | text | R |
| state / lga | select | R |
| incorporation_type | select(INCORPORATION_TYPE) | R |
| incorporation_date | date | R |
| incorporation_document | file | R |
| tin | number | O |
| proof_of_address | file | O |
| status | select(KYC) | R |
| rejection_reason | longtext | O |

### 8.3 LabProfile (Lab variant of KYC)
Same as KYCProfile **plus**:
| Field | Type | R/O |
|-------|------|-----|
| country | select | R |
| accreditation_documents | file[] | **R** (one or more) |

### 8.4 Director / Personnel
`Director` for Seller & Buyer; `Personnel` (lab managers/technicians) for Lab —
identical schema, different label.
| Field | Type | R/O |
|-------|------|-----|
| id | uuid | R |
| kyc_profile_id | uuid (FK) | R |
| first_name / last_name | text | R |
| dob | date | R |
| email | email | R |
| phone | phone | R |
| nationality | select(country) | R |
| nin | number(11) | R | verified |
| bvn | number(11) | R | verified (where applicable for Lab) |
| id_document_type | select(ID_DOCUMENT_TYPE) | R |
| id_document_file | file | R |
| verification_status | select | R | pending / verified / failed |

A KYC profile may have **many** directors/personnel ("Add Director +").

### 8.5 Wallet (Buyer & Lab)
| Field | Type | R/O |
|-------|------|-----|
| id | uuid | R |
| user_id | uuid (FK) | R |
| balance_ngn / balance_usd | money | R | default 0 |

### 8.6 Transaction
| Field | Type | R/O |
|-------|------|-----|
| id | uuid | R |
| wallet_id | uuid (FK) | R |
| type | select | R | deposit / withdrawal / escrow_hold / escrow_release / payment |
| method | select(FUNDING_METHOD) | O | for deposits/withdrawals |
| amount | money | R | |
| status | select | R | pending / completed / failed |
| reference | text | R | unique idempotency key |
| created_at | datetime | R | |

### 8.7 Notification
| Field | Type | R/O |
|-------|------|-----|
| id | uuid | R |
| user_id | uuid (FK) | R |
| category | select | R | kyc / trade / payment / test_request / rfq / sample / system |
| title / body | text | R | |
| read | boolean | R | default false |
| created_at | datetime | R | |

---

## 9. Onboarding & auth flow

```
Landing → Create account ──┐
                           ▼
        (Name, email, country, state, phone, password, username, role)
                           ▼
              Email verification sent → user verifies → re-login
                           ▼
              Role-based dashboard (Seller / Buyer / Lab)
                           ▼
              KYC gate: most actions locked until kyc_status = verified
```

**Login:** username **or** email + password.

**KYC gating rule (applies to all interfaces):** a user can browse and complete
their profile before verification, but the following require `kyc_status =
verified`:
- Seller: create listing, request testing.
- Buyer: send RFQ, fund wallet beyond a low cap, open a trade.
- Lab: accept a testing request, withdraw funds.

Surface a persistent "Complete your KYC" banner with a deep link until verified.

---

## 10. Shared API surface

These endpoints serve all interfaces; interface specs add their own.

```
POST /auth/register
POST /auth/verify-email
POST /auth/login
POST /auth/logout
GET  /me

# KYC
GET   /kyc
PUT   /kyc/profile
POST  /kyc/directors          # also serves lab personnel
PUT   /kyc/directors/:id
POST  /kyc/directors/:id/verify   # NIN/BVN/phone verification
POST  /kyc/submit
GET   /kyc/status

# Wallet (buyer + lab)
GET   /wallet
POST  /wallet/deposit
POST  /wallet/withdraw
GET   /wallet/transactions

# Reference data
GET   /ref/minerals
GET   /ref/states
GET   /ref/states/:state/lgas

# Notifications
GET   /notifications
POST  /notifications/:id/read
```

---

## 11. Non-functional & compliance notes

- **Verification provider:** NIN/BVN/phone "confirm → verify" steps imply an
  external identity-verification integration. Abstract it behind a
  `VerificationService` interface so the provider can be swapped.
- **PII handling:** NIN, BVN, and ID documents are sensitive. Encrypt at rest,
  restrict access by role, never log raw values, and never return them in full
  via the API (mask to last 4 where displayed).
- **Audit trail:** every status transition (listing, trade, KYC, escrow, test
  result) is logged with actor + timestamp for traceability.
- **Idempotency:** all money-moving endpoints require an idempotency key.
- **Responsiveness & accessibility:** mobile-first layouts; WCAG AA contrast;
  all form fields labelled and keyboard-navigable.

---

## 12. Build acceptance criteria (foundation)

- [ ] A user can register, choose a role, verify email, and log back in.
- [ ] Reference data (minerals, states→LGAs, units) is seeded and served.
- [ ] KYC profile + multiple directors can be created, submitted, and moved
      through the status machine; gated actions stay locked until verified.
- [ ] Wallet + transactions exist for buyer and lab roles with the escrow types.
- [ ] Notifications can be created, listed, and marked read.
- [ ] All status enums in §7 are enforced server-side (no invalid transitions).
