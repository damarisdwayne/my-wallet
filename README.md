# My Wallet

A personal finance and investment portfolio manager built for Brazilian investors. Track assets across multiple asset classes, import brokerage statements, monitor dividends, calculate taxes, and analyze your portfolio allocation — all in one place.

## Pages

| Page | What it does |
|---|---|
| **Dashboard** | Net worth summary, market indicators (USD, BTC, SELIC, IPCA, IGP-M), patrimony chart over time |
| **Portfolio** | Full asset register with real-time prices, target allocation, rebalancing suggestions, and fundamental analysis |
| **Dividends** | Log and track dividends, JCP, and rendimentos; import from B3 statements |
| **Expenses** | Manual expenses, fixed recurring charges, and installment purchases |
| **Tax** | Monthly DARF calculation for variable income (stocks, FIIs, BDRs); swing-trade vs. day-trade split |
| **Sales** | Track hardware/tech resales (GPUs, CPUs, smartphones, etc.) |
| **Calculators** | CDB × LCI/LCA comparator, Tesouro Direto mark-to-market, retirement projector |

## Features

### Portfolio

- Tracks stocks (B3), FIIs, BDRs, ETFs, US stocks, crypto, fixed income (CDB, LCI, LCA, Tesouro Direto), and other assets
- Automatic weighted average cost (PM) on buys and sells
- Real-time prices via BrAPI, CoinGecko, and USD/BRL conversion
- **USD-native storage** for crypto / US assets (`avgPriceUsd` / `currentPriceUsd`) — toggle BRL/USD on Visão Geral shows real cost basis without conversion drift
- **Realocamento** tab: how much to buy/sell per category to reach target allocation + scenario simulator
- Target allocation per category with rebalancing diff
- Grouped view for fixed-income assets

### Broker Import

- **B3** — Official B3 Excel statement (Extrato de Negociação)
- **Inter Co Securities** — Transaction Confirmation PDFs (Apex Clearing and DriveWealth formats); USD prices converted to BRL using **PTAX (BCB série 10813)** of each trade date for IR compliance

### Fundamental Analysis

- P/L, sector, and industry data via BrAPI
- FII-specific metrics: vacancy, property count, DY, manager fees
- Monthly snapshots for historical tracking
- AI-powered analysis via Google Gemini
- Graham fair price (√22.5 × EPS × BVS) for stocks; P/VP + DY valuation for FIIs
- Inline sparkline chart (last 30 days) on each asset card

### Tax Calculation

- Monthly DARF amounts for swing trade and day trade
- Isenção for monthly sales under R$ 20,000 (common stocks)
- Loss carry-forward between months
- Detailed operation log per month

### CVM Alerts

- Automatic polling of CVM regulatory filings for assets in your portfolio
- Unseen count badge in the header

### PWA (Progressive Web App)

- Installable on Android (Chrome) and iOS (Safari) — appears on the home screen with a custom icon
- Offline-capable via Workbox service worker (NetworkFirst for Firebase, cache-first for static assets)
- iOS safe area support: header, bottom nav, FAB, and sheets all respect `env(safe-area-inset-top/bottom)` with `viewport-fit=cover`
- Install prompt banner for Android/Chrome using `beforeinstallprompt`
- To test locally: `yarn build && yarn preview`

### Responsive Design

- Mobile-first layout with a bottom navigation bar (6 items) replacing the sidebar on small screens
- Tab-heavy pages (Portfolio, Tax, Calculators, Knowledge) use a dropdown selector on mobile and a tab bar on desktop
- Assets table renders as a card list on mobile and a full table on desktop
- Button toolbars hide text labels on mobile (`hidden sm:inline`) with `title` tooltips
- Chat assistant FAB repositioned above the bottom nav on mobile

### Privacy Mode

- Toggle to mask all monetary values with `••••••` across every page
- State persisted in `localStorage` via Jotai

### Price Alerts & Notifications

- Create price alerts for any ticker (above / below a target price)
- Triggers browser notification (persistent, requires interaction to dismiss), in-app beep, and email via Resend
- Notification center in the header with read/unread state; notifications older than 30 days are auto-deleted
- Works for tickers both inside and outside the portfolio

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | React Router 7 |
| Build | Vite |
| PWA | vite-plugin-pwa + Workbox |
| State | Jotai |
| Styling | Tailwind CSS 4 + Radix UI + shadcn/ui |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google, GitHub, Apple) |
| Notifications | Sonner (toast) |
| PDF parsing | PDF.js + JSZip |
| Excel parsing | SheetJS (XLSX) |
| AI | Google Generative AI (Gemini 2.5 Flash) |

## External APIs

| API | Purpose |
|---|---|
| [BrAPI](https://brapi.dev) | Brazilian stock, FII, BDR, ETF, and US stock quotes (BRL + USD) + fundamentals |
| [CoinGecko](https://coingecko.com) | Cryptocurrency prices (current BRL + USD) and historical price by date |
| [AwesomeAPI](https://economia.awesomeapi.com.br) | USD/BRL exchange rate (for display only) |
| [BCB](https://api.bcb.gov.br) | CDI, SELIC, IPCA, IGP-M rates + **PTAX venda (série 10813)** — official USD/BRL rate used for IR, foreign dividends, and Inter US imports |
| [Dados de Mercado](https://dadosdemercado.com.br) | Tesouro Direto bond prices (mark-to-market) |
| [CVM](https://www.rad.cvm.gov.br) | Regulatory filings and company disclosures |
| [Google Gemini](https://ai.google.dev) | AI-powered asset analysis |
| [Resend](https://resend.com) | Email delivery for price alert notifications |

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn
- A Firebase project with Firestore and Authentication enabled
- A [BrAPI](https://brapi.dev) account (free tier available)

### 1. Clone and install

```bash
git clone <repo-url>
cd my-wallet
yarn install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# BrAPI — required for stock/FII/ETF/US price refresh and fundamentals
VITE_BRAPI_TOKEN=

# Dados de Mercado — optional, enables Tesouro Direto mark-to-market
VITE_DADOSDEMERCADO_TOKEN=

# Google Gemini — optional, enables AI analysis in Portfolio
VITE_GEMINI_API_KEY=

# Resend — optional, enables email delivery for price alerts (server-side only)
RESEND_API_KEY=
```

### 3. Firebase setup

In the Firebase console:
1. Create a Firestore database (production mode)
2. Enable Authentication and add providers: **Google**, **GitHub**, **Apple**
3. Copy the project credentials into `.env`

### 4. Run

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start dev server on port 3000 |
| `yarn build` | Type-check and build for production |
| `yarn preview` | Preview the production build locally |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Auto-fix lint issues |
| `yarn format` | Format code with Prettier |
| `yarn typecheck` | Type-check without building |

## Project Structure

```
src/
├── components/        # Shared UI components (shadcn/ui based)
│   ├── ui/            # Base primitives (Button, Badge, Dialog…)
│   ├── error-boundary.tsx
│   └── patrimony-chart.tsx
├── hooks/             # Custom React hooks
│   ├── use-portfolio.ts      # Orchestrator: composes useAssets + useFundamentals
│   ├── use-assets.ts         # Asset CRUD, price refresh
│   ├── use-fundamentals.ts   # FII/stock fundamentals snapshots
│   ├── use-dashboard.ts
│   ├── use-expenses.ts
│   ├── use-market-data.ts    # USD, BTC, BCB macro rates
│   ├── use-sales.ts
│   ├── use-notifications.ts  # In-app notification center (read/unread, auto-delete)
│   ├── use-price-alerts.ts   # Price alert creation, evaluation, and firing
│   └── use-cvm-alerts.ts     # CVM regulatory filing polling
├── lib/               # Firebase client, utility functions
├── pages/             # Page components
│   ├── dashboard/
│   ├── portfolio/     # Tabs: overview, allocation, realocamento, aporte, dividends, analysis, trades(+imports)
│   ├── dividends/
│   ├── expenses/
│   ├── tax/
│   ├── sales/
│   └── calculators/   # CDB, LCI/LCA, Tesouro Direto, aposentadoria
├── routes/            # React Router setup + AppLayout
├── services/          # External API clients and data parsers
│   ├── assets.ts          # Firestore CRUD for assets
│   ├── b3-import.ts       # B3 Excel statement parser
│   ├── inter-import.ts    # Inter PDF parser (Apex + DriveWealth) — uses PTAX per trade date
│   ├── quotes.ts          # Live price fetching (PriceMap with brl + usd); PTAX helpers
│   ├── bcb-rates.ts       # BCB macro rate calculations
│   ├── fundamentals.ts    # BrAPI fundamentals integration
│   ├── notifications.ts   # Firestore CRUD for in-app notifications
│   ├── price-alerts.ts    # Firestore CRUD for price alerts
│   └── import-parser.ts   # ImportParser interface
├── store/             # Jotai atoms (auth, privacy, display-currency, fresh-prices)
└── types/             # TypeScript type definitions
```

## Broker Import Guide

### B3 (Brazilian stocks, FIIs, ETFs)

1. Go to [investidor.b3.com.br](https://investidor.b3.com.br)
2. Navigate to **Extratos → Negociação → Baixar → Excel**
3. Import the `.xlsx` file in the app under **Portfolio → Importações**

### Inter Co Securities (US assets)

1. In the Inter app go to **Investimentos → Notas de corretagem Ações EUA**
2. Download the PDF for each transaction confirmation
3. Import each PDF under **Portfolio → Importações → Inter Co Securities**

> **Note:** Inter only provides downloadable PDFs from 08/28/2023 onward. For older trades, use manual entry or add the asset directly with your known average cost.
