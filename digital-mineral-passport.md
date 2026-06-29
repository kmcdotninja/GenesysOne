# Digital Mineral Passport — Feature Spec

> **Context doc for Claude Code.** This file describes the Digital Mineral Passport
> feature for the GenesysOne mineral marketplace. Use it as the source of truth when
> implementing, reviewing, or extending the feature.

## One-Sentence Summary

A Digital Mineral Passport is a verified digital certificate for every mining product on
GenesysOne — like a passport for a person, but for a batch of minerals — proving where it
came from, who mined it, what quality it is, and that it's conflict-free, all secured by
blockchain so nobody can fake it.

---

## The Problem We're Solving

| Problem | How It Hurts Us Today |
| --- | --- |
| **Trust** | Buyers can't easily verify that a mineral product is what the seller claims it is |
| **Provenance** | No way to prove a product came from a specific mine in Nigeria |
| **Regulations** | EU and international buyers increasingly require proof of origin and conflict-free certification |
| **Premium pricing** | Verified minerals sell for 15–30% more than unverified ones |
| **Counterfeiting** | Fake certificates can be produced — no tamper-proof system exists |
| **Differentiation** | Every mineral marketplace looks the same; verified provenance is a moat |

---

## How It Works — The Passport Lifecycle

```
┌─────────────────────────────────────────────────────────────────────┐
│ THE PASSPORT LIFECYCLE                                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ 1. SELLER CREATES PRODUCT                                             │
│    Same as today — adds mineral to inventory                          │
│    Then clicks "Request Passport"                                     │
│    → Passport created in "Pending" state                              │
│                                                                       │
│ 2. ADMIN ASSIGNS A VERIFICATION AGENT                                 │
│    Our staff at the mining site gets assigned                         │
│    → Passport moves to "In Verification"                              │
│                                                                       │
│ 3. AGENT VISITS THE MINE SITE                                         │
│    Captures: GPS coordinates, site photos, sample, ID docs            │
│    All uploaded through a simple mobile-friendly form                 │
│                                                                       │
│ 4. LAB TESTS THE SAMPLE                                               │
│    Existing QC process — grade, purity, contaminants                  │
│    Lab officer digitally signs off                                    │
│                                                                       │
│ 5. ADMIN APPROVES THE PASSPORT                                        │
│    If everything checks out → Passport is verified                    │
│                                                                       │
│ 6. PASSPORT GOES LIVE                                                 │
│    Seller gets a QR code to print on packaging                        │
│    Anyone can scan it to see the passport online                      │
│    Blockchain record created — tamper-proof                           │
│                                                                       │
│ 7. BUYER SEES THE PASSPORT DURING TRADE                               │
│    Linked to the trade — buyer can verify authenticity                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Status states (suggested enum)

`PENDING` → `IN_VERIFICATION` → `VERIFIED` (or `REJECTED`)

---

## What Information Does a Passport Contain?

### Public Information (Anyone Can See)

| What | Why It's Visible |
| --- | --- |
| Mineral type (e.g., Gold, Tin, Lithium) | Core identity of the product |
| Origin country and region | Proves where it came from |
| Grade and purity range | Quality signal for buyers |
| Verification date | Shows it's current |
| Verified site name (e.g., "Ilesa Gold Mine, Osun State") | Provenance detail |
| Certificate of Origin | Downloadable PDF proof |
| Blockchain verification link | Anyone can verify it's authentic |

### Private Information (Only Buyers/Partners See)

| What | Who Can See It | Why It's Private |
| --- | --- | --- |
| Exact GPS coordinates | Buyer after purchase | Security — prevents site theft |
| Full lab test report | Buyer + seller | Commercially sensitive |
| Seller identity | Buyer of that lot | Seller privacy |
| Agent name | Internal only | Personnel privacy |

### What NEVER Goes Public

- Seller's personal information
- Financial details or pricing
- Internal verification notes
- Agent names and identities

---

## Benefits by User Type

### For Sellers (Mineral Producers and Owners)
- **Higher prices:** Verified minerals command 15–30% premium in global markets
- **Trust signal:** Buyers can instantly verify your product is authentic
- **Export ready:** Meets EU Critical Raw Materials Act and other international standards
- **Brand value:** Your mine gets named on the passport — builds reputation
- **Faster sales:** Buyers don't need to spend weeks doing their own due diligence

### For Buyers (Traders, Smelters, Manufacturers)
- **Guaranteed provenance:** Know exactly where the mineral came from
- **No counterfeits:** Blockchain verification means the passport can't be faked
- **Compliance ready:** Conflict-free certification for your own regulatory reporting
- **Time savings:** Verification is done — no need to hire third-party auditors

### For GenesysOne (The Platform)
- **Market differentiation:** No other African mineral marketplace has this
- **Trust premium:** Becomes the "verified by" standard for African minerals
- **Regulatory alignment:** Early compliance with EU Digital Product Passport regulations (2027+)
- **New revenue:** Potential for passport issuance fees or verification service fees
- **Data moat:** Over time, the passport database becomes a valuable asset

---

## How Blockchain Makes It Trustworthy

**Analogy:** Blockchain works like a notary public for digital data.

When a passport is verified, the system takes a digital fingerprint (a **hash**) of all the
passport information and records it on a public blockchain — like engraving a unique serial
number in stone:

- **Can't be changed:** Altering the passport after verification breaks the seal — instantly detectable.
- **Can't be faked:** There's no central database to hack — the record exists on thousands of computers.
- **Anyone can check:** A buyer in Europe can verify a Nigerian passport in seconds, without contacting us.

> The actual passport data (product info, test results, etc.) stays securely on our servers.
> Only the digital fingerprint goes on the blockchain — so no sensitive data is ever exposed publicly.

**Chosen chain:** Stellar (transaction cost ~$0.00001).

---

## UI / UX

### Seller Dashboard — Inventory Page

A new **Passport Status** column is added to the seller's inventory page.

```
┌─────────────────┬─────────┬──────────┬──────────────┬────────────────┐
│ Product         │ Mineral │ Quantity │ Stock Status │ PASSPORT       │
├─────────────────┼─────────┼──────────┼──────────────┼────────────────┤
│ Gold Concentrate│ Gold    │ 1,200 g  │ In Stock     │ Requested      │
├─────────────────┼─────────┼──────────┼──────────────┼────────────────┤
│ Tin Ore         │ Tin     │ 5 tons   │ Low Stock    │ VERIFIED       │
│                 │         │          │              │ [View] [Share] │
└─────────────────┴─────────┴──────────┴──────────────┴────────────────┘
```

Clicking **View** shows the seller's passport — a clean page with:
- Passport number (e.g., `GMP-2026-00421`)
- All product details they entered
- Current status with a colored badge
- A downloadable / printable QR code
- A **Share** button to copy the public link

### Public View — Scanning a QR Code

```
┌──────────────────────────────────────────────────────────────────┐
│  GENESYSONE Digital Mineral Passport                               │
│                                                                    │
│  VERIFIED                                                          │
│                                                                    │
│  Gold (Au) — 22.5 karat / 93.7% purity                             │
│  Origin: Osun State, Nigeria                                       │
│                                                                    │
│  Verified on 27 June 2026 by Ilesa Gold Mine                       │
│                                                                    │
│  ┌──────────────────┐                                              │
│  │     [QR Code]    │   Verify on Blockchain                       │
│  └──────────────────┘   Download Certificate                      │
│                                                                    │
│  This product is blockchain-certified and tamper-evident.          │
└──────────────────────────────────────────────────────────────────┘
```

> No login required. No app to install. Just scan and see.

---

## What We Need to Build

1. **Passport system** — A new module that manages passport creation, status tracking, and public links.
2. **Mining site registry** — A simple database of mining locations our agents work with.
3. **Verification agent tools** — A mobile-friendly form for agents at mining sites to capture GPS, photos, and samples.
4. **Lab test integration** — Link the existing QC process (grade/purity/contaminants) to the passport.
5. **Public passport page** — A simple page anyone can view without logging in.
6. **QR code generation** — Each passport gets a unique QR code for printing.
7. **Blockchain anchoring** — Digital fingerprint recorded on a public blockchain (Stellar).

### New Roles

> No new user roles are created — existing **Admin**, **Seller**, and **Lab** roles are
> extended with permission flags. This means **no security rewrites**.

| Role | Who | What They Do |
| --- | --- | --- |
| Site Admin | Our operations staff | Register mining sites, assign verification agents |
| Verification Agent | Field staff at mining sites | Visit sites, capture data, collect samples |
| Product Owner | Existing sellers | Request passports, share public links |
| QC Officer | Existing lab role | Conduct tests (already exists today) |

### What We DON'T Need to Build

- New user registration or login system — **reuse existing**
- New document storage — **reuse existing encrypted upload pipeline**
- New notification system — **reuse existing**
- New audit trail — **reuse existing**
- New blockchain infrastructure — **extend existing**

---

## Competitive Context

| Who | What They Do | Our Advantage |
| --- | --- | --- |
| Minespider | Mineral traceability platform (Europe) | We own the marketplace + the passport = one platform end-to-end |
| Circulor | Supply chain traceability (EU-funded) | We're live in African mining regions, not consulting from Europe |
| Everledger | Diamond / gemstone provenance | We cover all minerals, not just precious stones |
| Generic DPP platforms | EU Digital Product Passport compliance | We're purpose-built for minerals, not adapted from general DPP |

**Our moat:** We don't just track minerals — we facilitate the trade. The passport is built
into the marketplace where buyers and sellers already transact.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| Agents can't reach remote mining sites | Medium | Start with accessible sites, build a remote verification protocol |
| Sellers don't see value | Low | Show premium pricing data, onboard anchor buyers first |
| Blockchain costs scale with volume | Low | Stellar blockchain costs ~$0.00001 per transaction |
| EU regulations change | Medium | Architecture is regulation-agnostic — adapts to any standard |
| Counterfeit agents | Low | Agent KYC through existing verification pipeline |

---

## Summary

The Digital Mineral Passport turns every product on GenesysOne into a verifiable, trustworthy asset.

It's not a new product — it's a **trust layer** on top of what we already have. The platform
already handles products, lab tests, trades, and documents. The passport connects these into a
single, verifiable narrative that anyone can check.

- **For the business:** It's our competitive moat — the reason buyers choose GenesysOne over any other marketplace.
- **For the user:** It's a QR code on a bag of minerals that proves authenticity in seconds.
- **For the industry:** It's the first blockchain-verified mineral passport system built into an African trading platform.
