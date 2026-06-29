# Genesys One — Seller Interface

> Builds on `00-platform-foundations.md`. Shared entities (User, KYCProfile,
> Director, status machines, enums, file rules) are defined there and only
> referenced here. This file covers Seller-only pages, entities, and rules.

**Role:** `seller` · **Gating:** listing creation and testing requests require
`kyc_status = verified` (see foundations §9).

---

## Navigation / information architecture

```
Seller
├── 1. Dashboard            /seller/dashboard      (KYC + "Add Products" shortcut)
├── 2. Inventory            /seller/inventory       (Add Mineral, Request Sampling)
├── 3. Listings             /seller/listings        (stats + Create Listing + QCA shortcut)
├── 4. Trade History        /seller/trades
└── 5. Quality Control (QCA)/seller/qca             (Request Testing)
```

---

## 1. Dashboard

Two jobs: drive KYC to completion, and shortcut into adding products.

### 1a. KYC — Company Profile
Renders the shared KYC flow (foundations §8.2 + §8.4). Sections, in order:

**i. Company Profile**
| Field | Type | R/O |
|-------|------|-----|
| Company Name | text | R |
| Description | longtext | O |
| Address | text | R |
| State | select(state) | R |
| LGA | select(lga, depends on State) | R |

**ii. Other Company Details**
> Helper text: *"Submit the company's registration details exactly as they
> appear in the registration documents."*

| Field | Type | R/O | Options / validation |
|-------|------|-----|----------------------|
| Incorporation Type | select | R | business_name, registered_company |
| Incorporation Date | date | R | not in the future |
| Incorporation Document | file | R | PDF/JPG/PNG |
| TIN | number | O | |
| Proof of Business Address | file | O | utility bill / bank statement |

**iii. Directors' Details** — repeatable ("Add Director +"), min 1.
| Field | Type | R/O |
|-------|------|-----|
| First Name / Last Name | text | R |
| DOB | date | R |
| Email | email | R |
| Phone | phone | R |
| Nationality | select(country) | R |

→ **Save and Continue**

**iv. Director NIN & BVN verification** — per director.
> Helper text: *"Provide each director's BVN and NIN to complete verification
> and ensure regulatory compliance."*

| Field | Type | R/O | Action |
|-------|------|-----|--------|
| Phone Number | number | R | confirm → verify |
| NIN | number(11) | R | confirm → verify |
| BVN | number(11) | R | confirm → verify |
| Identification Document Type | select(ID_DOCUMENT_TYPE) | R | + file upload |

→ **Submit → Verify KYC** (moves `kyc_status` to `submitted`).

### 1b. Add Products
A shortcut card/button that deep-links to **Inventory → Add Mineral** (§2a).

---

## 2. Inventory

### 2a. Add Mineral
Creates an `InventoryItem`.

**Product details**
| Field | Type | R/O | Options |
|-------|------|-----|---------|
| Mineral | select(MINERALS) | R | |
| Grade | percentage | R | 0–100 |
| Available Quantity | number | R | |
| Unit of Measurement | select(UNIT_OF_MEASURE) | R | ton/kg/pound/oz |

**Capacity**
| Field | Type | R/O |
|-------|------|-----|
| Quantity | number | O |
| Unit of Measurement | select(UNIT_OF_MEASURE) | O |
| Supply Frequency | select(SUPPLY_FREQUENCY) | R |

**Storage location**
| Field | Type | R/O | Options |
|-------|------|-----|---------|
| Inventory Location | text | O | |
| Location Type | select(LOCATION_TYPE) | R | warehouse / mine |
| Delivery Mode | select(DELIVERY_MODE) | R | delivery / pickup |
| State | select(state) | R | |
| LGA | select(lga) | R | |
| Street | text | O | |

### 2b. Request Sampling
Schedules an on-site sampling visit (`SamplingRequest`).
| Field | Type | R/O |
|-------|------|-----|
| Date | date | R |
| Time | datetime(time, HH:MM) | R |
| Contact Person (first + last name) | text | R |
| Contact Phone Number | phone | R |
| State / LGA | select | R |
| Sampling Address | text | R |
| Landmark | text | O |

---

## 3. Listings

### 3a. Status summary bar
Five tallies, each a **count** and a **₦ value**, sourced from the Listing state
machine (foundations §7):

`Total` · `Pending` · `Approved` · `Rejected` · `Completed`

### 3b. Create Listing
A `Listing` references inventory the seller already owns.

**Add your product**
| Field | Type | R/O | Notes |
|-------|------|-----|-------|
| Mineral | select | R | **only minerals present in this seller's inventory** |
| Grade | percentage | R | prefill from inventory, editable |
| Available Quantity | number | R | ≤ inventory available |
| Unit of Measurement | select(UNIT_OF_MEASURE) | R | |
| Delivery Mode | select(DELIVERY_MODE) | R | |
| Location Type | select(LOCATION_TYPE) | R | warehouse / mine |
| Country | select(country) | R | |
| State / LGA | select | R | |
| Address | text | R | |

**Pricing**
| Field | Type | R/O | Options |
|-------|------|-----|---------|
| Unit | select(UNIT_OF_MEASURE) | R | pound/kg/oz/ton |
| Currency | select(CURRENCY) | R | ₦ / $ |
| Amount | money | R | per unit |

### 3c. QCA shortcut
Button linking to **Quality Control & Assurance** (§5) to attach test results.

---

## 4. Trade History

**KPI row:** `Volume Traded (MT)` · `Ongoing Trades (₦)` · `Total Trade (₦)`.

**Search:** by Batch ID.

**Table columns:**
| Mineral | Order Number | Grade (%) | Total Trade Value (₦) | Date Created | Trade Status |
|---------|--------------|-----------|-----------------------|--------------|--------------|

`Trade Status` ∈ {ongoing, completed} (cancelled also possible per foundations §7).
Each row links to a trade detail view showing escrow status and linked test results.

---

## 5. Quality Control & Assurance — Request Testing

Creates a `TestingRequest` that routes to the Lab interface.

**Mineral information**
| Field | Type | R/O |
|-------|------|-----|
| Mineral | select(MINERALS) | R |
| Grade | percentage | O | claimed grade |

**Test schedule**
| Field | Type | R/O |
|-------|------|-----|
| Date | date | R |
| Time | datetime(time) | R |

**Sampling location**
| Field | Type | R/O |
|-------|------|-----|
| State / LGA | select | R |
| Address | text | R |
| Landmark | text | O |

**Contact details**
| Field | Type | R/O |
|-------|------|-----|
| Contact Person (first + last) | text | R |
| Contact Phone Number | phone | R |
| Alternative Number | phone | O |

On submit, `TestingRequest.status = incoming`; the Lab sees it in its queue
(`03-lab-interface.md` §2).

---

## Seller-only entities

### InventoryItem
`id, seller_id, mineral, grade, available_quantity, unit, capacity_quantity,
capacity_unit, supply_frequency, inventory_location, location_type, delivery_mode,
state, lga, street, created_at, updated_at`

### SamplingRequest
`id, seller_id, inventory_item_id?, date, time, contact_name, contact_phone,
state, lga, address, landmark, status, created_at`

### Listing
`id, seller_id, inventory_item_id, mineral, grade, quantity, unit, delivery_mode,
location_type, country, state, lga, address, price_amount, price_currency,
price_unit, status (Listing machine), test_result_id?, created_at, updated_at`

### TestingRequest (shared with Lab)
`id, requester_id, requester_role, mineral, grade_claimed, schedule_date,
schedule_time, state, lga, address, landmark, contact_name, contact_phone,
alt_phone, status (Testing machine), lab_id?, result_id?, created_at`

> `Trade` and escrow are defined in the Buyer spec; the Seller is the
> counterparty and reads the same records filtered by `seller_id`.

---

## Seller API surface (adds to foundations §10)

```
# Inventory
GET    /seller/inventory
POST   /seller/inventory
PUT    /seller/inventory/:id
DELETE /seller/inventory/:id
POST   /seller/sampling-requests

# Listings
GET    /seller/listings?status=
GET    /seller/listings/summary          # the 5 tallies w/ count + ₦
POST   /seller/listings
PUT    /seller/listings/:id

# Trades (read as counterparty)
GET    /seller/trades?status=&batch_id=
GET    /seller/trades/:id

# Testing
POST   /seller/testing-requests
GET    /seller/testing-requests
```

---

## Business rules

1. A **Listing** can only reference minerals in the seller's own inventory; the
   mineral dropdown is populated from `InventoryItem`.
2. Listing quantity must not exceed inventory available quantity at creation.
3. Creating a listing or a testing request requires `kyc_status = verified`.
4. Listing status transitions follow the Listing machine; approval/rejection is
   performed by platform/admin or by the linked test outcome, not the seller.
5. The Trade History KPIs are derived, not stored: sum over the seller's trades.

## Acceptance criteria

- [ ] Seller completes KYC (company + ≥1 director + NIN/BVN verify + submit).
- [ ] Seller adds inventory and schedules a sampling request.
- [ ] Seller creates a listing limited to owned-inventory minerals, with pricing.
- [ ] Listings page shows the five tallies with counts and ₦ values.
- [ ] Trade History filters by Batch ID and shows the specified columns.
- [ ] Request Testing creates a request that appears in the Lab queue.
