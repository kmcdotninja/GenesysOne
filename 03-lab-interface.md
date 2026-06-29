# Genesys One — Lab Interface

> Builds on `00-platform-foundations.md`. Shared entities (User, LabProfile,
> Personnel, Wallet, Transaction, Notification, status machines, enums) are
> defined there and only referenced here.

**Role:** `lab` · **Gating:** accepting a testing request and withdrawing funds
require `kyc_status = verified` (foundations §9).

The Lab is the certifying party: it receives `TestingRequest`s (raised by Sellers
in `01-seller-interface.md` §5, and potentially Buyers), runs the test, and
publishes signed results that auto-link to the related Listing/Trade.

---

## Navigation / information architecture

```
Lab
├── 1. Dashboard / KYC      /lab/dashboard
├── 2. Testing Requests     /lab/requests
├── 3. Conduct Test         /lab/requests/:id/results
├── 4. Test History         /lab/history
├── 5. Wallet               /lab/wallet
└── 6. Notifications        /lab/notifications
```

---

## 1. Dashboard / KYC

Uses the **LabProfile** variant (foundations §8.3) — note the extra Country and
the **required** accreditation documents.

**Lab Profile**
| Field | Type | R/O |
|-------|------|-----|
| Lab Name | text | R |
| Description | longtext | O |
| Address | text | R |
| State / LGA | select | R |
| Country | select(country) | R |
| Incorporation Type | select(INCORPORATION_TYPE) | R |
| Incorporation Date | date | R |
| Incorporation Document | file | R |
| TIN | number | O |
| Accreditation / Certification Documents | file[] | **R** |
| Proof of Business Address | file | O |

**Authorized Personnel** (repeatable — lab managers/technicians, min 1):
First Name, Last Name, DOB, Email, Phone, Nationality.

**Personnel Verification:** NIN, BVN (where applicable), ID Document Upload
(international_passport / drivers_license / pvc / nin_card) → **Submit → Verify KYC**.

---

## 2. Testing Requests

Incoming queue of `TestingRequest`s from buyers/sellers.

**Each request shows:**
| Group | Fields |
|-------|--------|
| Mineral | Mineral type · Batch ID · Grade (claimed) · Quantity |
| Sampling | Date · Time · Location (state/LGA/address/landmark) · Contact person · phone |
| Delivery | Delivery mode ∈ {courier, on_site_sampling} |

**Actions per request:** **Accept** / **Reject**.
- Accept → `status = accepted` (then `in_progress`); request locks to this lab.
- Reject → `status = rejected` (with optional reason); returns to requester.

---

## 3. Conduct Test & Upload Results

Available once a request is `accepted`. Produces a `TestResult` linked to the
request and, transitively, to the Listing/Trade.

**Input test results**
| Field | Type | R/O | Options |
|-------|------|-----|---------|
| Mineral Type | select(MINERALS) | R | prefilled from request |
| Grade | percentage | R | measured grade |
| Purity / Contaminants Report | longtext | R | |
| Method of Testing | select(TEST_METHOD) | R | xrf / assay / other (→ free text) |

**Attachments**
| Field | Type | R/O |
|-------|------|-----|
| Supporting Documents | file[] | R (≥1) | PDF / CSV |
| Images | file[] | O |

**Sign-off**
| Field | Type | R/O |
|-------|------|-----|
| Digital Sign-Off | personnel signature / ID | R |

→ **Submit results** → `TestingRequest.status = completed`; result is
**automatically linked** to the related Trade / Listing and the requester is
notified. The certified grade can drive the linked Listing's approval.

---

## 4. Test History

**Search / filter:** Batch ID · Mineral · Date.

**Per row:** completed test summary, download certificate/report, status of the
request ∈ {completed, rejected, pending}.

---

## 5. Wallet

Uses shared `Wallet` + `Transaction` (foundations §8.5–8.6).

| Action | Detail |
|--------|--------|
| **Receive Payments** | credited for completed tests (`type = payment`) |
| **Withdraw Funds** | amount ≤ balance → destination → confirm (idempotent) |
| **Wallet Balance** | per currency: ₦ and $ |
| **Transaction History** | payments + withdrawals |

---

## 6. Notifications

Uses shared `Notification` (foundations §8.7). Categories surfaced for the lab:
- **New test requests** (`category = test_request`)
- **Payment updates** (`category = payment`)
- **KYC verification status** (`category = kyc`)

---

## Lab-only entities

### TestResult
`id, testing_request_id (FK), lab_id, mineral, grade_measured, purity_report,
method (TEST_METHOD), method_other?, supporting_documents (file[]),
images (file[]), signed_by_personnel_id, signed_at, certificate_url,
created_at`

> `TestingRequest` is shared (defined in `01-seller-interface.md`). The lab reads
> requests where `lab_id` is null+matching scope or `lab_id = self`, and writes
> `status` + `result_id`. `LabProfile`, `Personnel`, `Wallet`, `Transaction`,
> and `Notification` are all shared (foundations §8).

---

## Lab API surface (adds to foundations §10)

```
# Testing requests
GET   /lab/requests?status=
GET   /lab/requests/:id
POST  /lab/requests/:id/accept
POST  /lab/requests/:id/reject

# Results
POST  /lab/requests/:id/results
GET   /lab/results/:id

# History
GET   /lab/history?batch_id=&mineral=&date=
GET   /lab/results/:id/certificate     # downloadable report/certificate

# Wallet
GET   /lab/wallet
POST  /lab/wallet/withdraw
GET   /lab/wallet/transactions
```

---

## Business rules

1. Accepting a request requires lab `kyc_status = verified` (accreditation docs
   are mandatory for lab KYC).
2. A request can be accepted by exactly one lab; acceptance locks it.
3. Submitting results requires the request to be `accepted`/`in_progress` and
   needs ≥1 supporting document plus a personnel sign-off.
4. On submit, the result links to the related Trade/Listing and the requester is
   notified; the certified grade may trigger Listing approval downstream.
5. Lab is credited (`Transaction.type = payment`) when a test completes;
   withdrawals are idempotent and capped at available balance.

## Acceptance criteria

- [ ] Lab completes KYC including **required** accreditation documents and ≥1
      verified personnel.
- [ ] Incoming requests display all mineral/sampling/delivery fields with
      Accept/Reject.
- [ ] Conduct-Test form captures grade, purity, method (with "other" free text),
      documents, optional images, and a digital sign-off.
- [ ] Submitting a result links it to the Trade/Listing and notifies the requester.
- [ ] Test History is searchable by Batch ID / Mineral / Date with downloadable
      certificates.
- [ ] Wallet credits on completed tests and supports withdrawal + history.
