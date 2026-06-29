# GenesysOne — Demo

A clickable, front-end demo of the three GenesysOne interfaces (Seller, Buyer, Lab),
built to the platform specs in the repo root and styled after the soft, rounded
Uniswap aesthetic — mapped to the GenesysOne brand (forest green / lime / orange).

> Demo only: all data is mocked (`src/data/mock.ts`); there is no backend.

## Run

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

## Explore

The landing page (`/`) lets you enter any interface. You can also switch interfaces
anytime via the role chip next to the logo in the top bar.

- **Seller** — `/seller` · Dashboard, Inventory, Listings, Trade History, Quality Control
- **Buyer** — `/buyer` · Dashboard, Wallet, Marketplace, RFQ, Trades, Sample Requests
- **Lab** — `/lab` · Dashboard (KYC stepper), Testing Requests, Conduct Test, Test History, Wallet, Notifications

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4 (theme tokens in `src/index.css`)
- react-router-dom, lucide-react
- No chart library — area/spark charts are hand-rolled SVG (`src/components/ui/AreaChart.tsx`)

## Structure

```
src/
  components/
    ui/          design system (Button, Card, Segmented, Badge/StatusPill,
                 Field, Stepper, DataTable, StatCard, AreaChart, Modal, …)
    shell/       TopNav, Sidebar, AppShell, PageHeader, RoleContext
    Logo.tsx     real GenesysOne logo + pinwheel mark (currentColor)
    KycFlow.tsx  shared 3-step KYC stepper (company / lab variants)
    KycSummary.tsx, modals.tsx
  data/          types, mock data, nav config
  pages/         seller/  buyer/  lab/  + Landing
```

## Brand tokens

| Token | Hex | Use |
|-------|-----|-----|
| `forest` | `#023729` | primary buttons, dark surfaces, headings |
| `lime` | `#a6e64d` | accent, active states, highlights |
| `teal` | `#038362` | success / verified |
| `orange` | `#ff8a3c` | pending / warnings |
