# GenesysOne — Mineral Traceability & Supply Chain Visibility Infrastructure

> **Context doc for Claude Code.** This file describes how GenesysOne establishes and
> maintains chain-of-custody over minerals, from mine site to buyer. Use it as the source
> of truth when implementing, reviewing, or extending traceability features.

## Core Principle

The system works through a combination of **physical controls + digital "passports."**
GenesysOne does **not** rely on trust or self-reported data alone. It uses a multi-layered
chain-of-custody system that starts at the mine site / warehouse and stays with the material
until it reaches the buyer.

---

## First-Mile Onboarding & Physical Verification

1. **Miner/Trader Registration (digital first step):** The miner or trader registers on the
   GenesysOne platform — **free to onboard**. They upload all required documents: mining
   licenses, permits, KYC documents, company/individual details, and information about their
   goods / production site.
2. **Digital Verification & Approval:** GenesysOne performs digital verification of all
   uploaded information (document checks, background screening, license validation, etc.).
   The process only moves forward after successful digital approval. **This is the first
   strong filter.**
3. **On-Ground Checks:** Field teams and compliance agents visit the mine site or artisanal
   mining area.
4. **Identity & Site Registration:** They cross-verify the producer/miner identity, register
   the site (with **GPS coordinates**), and document the initial batch.
5. **Independent Lab Testing:** Done at approved facilities to confirm quality and grade.
6. **Result:** This creates the **starting point** of the digital record.

---

## Digital Product Passport Creation

- At the point of aggregation or first sale, GenesysOne generates a **QR-coded Digital
  Product Passport**.
- The passport is **anchored on a public-permissioned blockchain** — built on **Ethereum
  with Proof-of-Authority (PoA) consensus** (energy efficient and controlled).
- The passport contains **immutable data:**
  - Origin (mine site + GPS)
  - Batch details
  - Quality test results
  - ESG information (labour conditions, environmental impact)
  - Timestamps
- The passport is linked to the **physical material** via QR code labels on bags, containers,
  and shipments.

> **Note on blockchain:** The original Digital Mineral Passport spec referenced Stellar.
> This infrastructure doc specifies Ethereum (PoA). Confirm the canonical chain before
> implementation so the two specs don't diverge.

---

## Chain of Custody (CoC) — Preventing Mixing & Manipulation

- **Segregated or Controlled Handling:** Material from different sources is typically kept
  separate (or carefully controlled if aggregated). The system records every transfer of
  custody.
- **Real-time Tracking:** Logistics partners scan the QR code at every handover point
  (aggregation hub → truck → port → export). GPS and IoT sensors can also track containers
  in transit.
- **Immutable Blockchain Record:** Once data is added to the passport on the blockchain, it
  cannot be altered or deleted. Any attempt to mix unverified material breaks the chain — the
  passport would no longer match the physical goods.
- **Mass Balance vs Identity Preservation:** For small-scale aggregation, a controlled
  mass-balance approach is used (quantities tracked precisely), but the passport maintains a
  verifiable audit trail so buyers can see the proportion of verified material.

---

## Traceability Mechanisms

### 1. Identity Preservation (IP / Full Segregation)

**How it works:** The physical mineral from a specific source (e.g., Miner A's batch from a
particular mine site) is kept completely separate from all other material throughout the
entire supply chain — from mine → aggregation → transport → export.

- No mixing allowed with material from other miners or sources.
- Every shipment can be traced back to the exact original batch/source.
- The digital passport (QR code + blockchain record) stays linked to that specific physical material.

**Pros**
- Buyers know exactly which minerals came from which mine/site (highest assurance for ESG, conflict-free, etc.).
- Strongest for strict regulations and premium pricing.
- Works best with mines and large-scale mining projects.

**Cons**
- Expensive and logistically difficult — requires dedicated bags, containers, trucks, or storage to prevent mixing.
- Harder to scale with small artisanal volumes.
- Costs more per ton to implement at scale.

### 2. Mass Balance (More Strategic and Scalable)

> This is the most scalable model for mineral traceability and supply chain visibility.

**How it works:** Material from many different sources can be physically mixed (e.g., 50 tons
from Miner A + 30 tons from Miner B combined into one shipment). The aggregation and volumes
are strictly tracked on paper/blockchain.

- If you input 50 tons of *verified* material, you can only sell/claim the same amount as
  verified. **Calculated Metal Weight (CMW)** is used instead of raw tonnage for accuracy.
- The passport records the **proportion or total volume** of responsibly sourced/verified
  material in the shipment — not necessarily the exact physical molecules from each original
  source. (Similar to how sustainable palm oil / cocoa are tracked today.)
- A **Chain of Custody (CoC) layer** records every change of ownership, transfer, and key
  event — an audit trail of who handled the material and when. Even when physical mixing
  occurs, the blockchain keeps an immutable record of the volumes and transfers.

**Pros**
- Much easier and cheaper to scale — especially for small lots from hundreds of artisanal miners.
- Allows aggregation into large export shipments without separate logistics for every tiny batch.

**Cons**
- Cannot say "this entire ton came from Mine A" — only "X% or X tons in this shipment are from verified sources."
- Lower assurance than full identity preservation (some risk of dilution if not audited well).

---

## IP vs Mass Balance — Comparison

| Aspect | Identity Preservation | Mass Balance (most common in practice) |
| --- | --- | --- |
| **Mixing allowed?** | No — strict physical separation | Yes — physical mixing is allowed |
| **Traceability level** | Exact batch → specific mine/site | Volume/proportion of verified material |
| **Cost & scalability** | High cost, harder to scale | Lower cost, much easier to scale with small miners |
| **Buyer assurance** | Highest (full origin story) | Good (volume-based assurance) but less precise |
| **Best for** | Premium, high-risk minerals (e.g., conflict-free claims) | Aggregating many small artisanal miners into export lots |

### Our Chosen Approach

We've adopted a **controlled mass-balance approach at the aggregation stage**, because pure
Identity Preservation is impractical with thousands of tiny artisanal miners (it can't scale).
We strengthen the system by stressing:

a. Strong first-mile verification (on-ground checks, GPS, lab testing)
b. Immutable blockchain passports
c. Rigorous volume accounting and audits

---

## Additional Mass Balance Safeguards

- Third-party audits and random spot-checks at aggregation points.
- KYC on producers, buyers, and intermediaries.
- ESG data captured early (e.g., no child labour, environmental practices) and attached to the passport.
- **Three-layer data privacy model** (public, consortium-only, private) so sensitive information stays protected.
- First-mile verification (on-ground checks, GPS, lab testing) feeds into the system.

> The combination of **mass balance + strong first-mile controls + immutable blockchain**
> makes manipulation very difficult to hide.

---

## Conclusion

GenesysOne creates a **"living digital twin"** of each shipment. The physical mineral travels
with a QR code that points to an unchangeable blockchain record. Every step — from mine →
aggregation → testing → transport → export — is logged and verified.

If someone tries to swap or mix in unverified material, the passport breaks, and the buyer or
regulator can immediately see the mismatch. This is why buyers trust it for
**OECD / EUDR / IRA compliance** — the system makes manipulation extremely difficult and
detectable.
