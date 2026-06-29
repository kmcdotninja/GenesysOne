# GenesysOne — Platform Overview

> **Context doc for Claude Code.** This file gives the high-level overview of the GenesysOne
> platform: what it is, how miners/sellers and buyers onboard, how compliance and the digital
> product passport work, the traceability mechanism, and the marketplace. Use it as the source
> of truth for platform-level behavior.

## What It Is

- A **mineral traceability and supply chain infrastructure platform**.
- Covers the full journey from **mine to end-use** (smelter, battery factory, etc.).
- Named **"Genesys One"** to reflect the first source of a mineral through to its final destination.
- **Market driver:** The EU Digital Product Passport regulation comes into full effect **August 2027**.

---

## Miner & Seller Onboarding

- Miners (and traders) register **free** on the platform.
  - Upload **KYC** and **KYB** information.
  - KYB compliance requirements differ by type:
    - **Miners** provide a mining license.
    - **Traders** provide a trading license.
- **"Seller"** is the umbrella term; **miner** and **trader** are sub-categories within it.
- **Buyers** also go through KYC/KYB, but **no on-field verification** is required.

---

## Compliance Verification & Digital Product Passport

- The **compliance team** conducts an on-field evaluation after a product is added. This:
  - Creates a **digital product passport** for the mineral.
  - Cross-verifies all KYC/KYB and product information.
  - Runs a full **ESG analysis**: child labor, human rights, international ethical sourcing standards.
- A **physical sample** is taken and sealed in a **tamper-proof, QR-coded bag**.
  - The QR code is the **digital passport identifier**.
  - The sample is sent to an **accredited, indigenous lab**.
- The **lab** scans the QR code and uploads:
  - Mineral type and full chemical/metal analysis.
  - Physical observations.
- **Lab results auto-populate the digital passport**, alongside:
  - GPS coordinates, compliance photos, evaluation reports.
  - A timestamp **anchored to blockchain** (hashed, immutable JSON).

---

## Traceability Mechanism

- **Core method:** cross-verifying **chemical metal weight consistency** across the supply chain.
  - Each analysis is **timestamped on blockchain** and cannot be altered.
  - The **unique chemical signature** of a mineral never changes.
- A **second analysis** is triggered when buyer and seller meet physically:
  - Compliance staff take a new sample on-field.
  - Results must match the original within a **0.2% deviation threshold**.
  - *Example:* copper at **35.623%** must re-test at **35.623% ±0.2%**.
- The **buyer can add their own analysis**, building a full chain of custody.
- **Miners can independently request analysis** if they suspect undervaluation by a buyer.

---

## Marketplace & Trading

- Approved products move from **"pending" → inventory → listings**.
  - Sellers set **price, quantity, and address**.
  - Buyers can **bid** (e.g., list at ₦20,000/ton, buyer bids ₦18,000).
- The platform provides **fair market access** and prevents exploitation of miners.
- Buyers gain **full provenance information per batch**, traceable to a verified miner.
