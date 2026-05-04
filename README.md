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
- Target allocation per category with rebalancing diff
- Grouped view for fixed-income assets

### Broker Import

- **B3** — Official B3 Excel statement (Extrato de Negociação)
- **Inter Co Securities** — Transaction Confirmation PDFs (Apex Clearing and DriveWealth formats); USD prices auto-converted to BRL

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
| [BrAPI](https://brapi.dev) | Brazilian stock, FII, BDR, ETF, and US stock quotes + fundamentals |
| [CoinGecko](https://coingecko.com) | Cryptocurrency prices in BRL |
| [AwesomeAPI](https://economia.awesomeapi.com.br) | USD/BRL exchange rate |
| [BCB](https://api.bcb.gov.br) | CDI, SELIC, IPCA, IGP-M rates for fixed income calculations |
| [Dados de Mercado](https://dadosdemercado.com.br) | Tesouro Direto bond prices (mark-to-market) |
| [CVM](https://www.rad.cvm.gov.br) | Regulatory filings and company disclosures |
| [Google Gemini](https://ai.google.dev) | AI-powered asset analysis |
| [Resend](https://resend.com) | Email delivery for price alert notifications |
| [Pluggy](https://pluggy.ai) | Open Finance — automatic bank transaction import |

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

# Pluggy Open Finance — optional, enables automatic bank import in Expenses (server-side only)
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
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
│   ├── portfolio/     # Tabs: overview, allocation, analysis, imports
│   ├── dividends/
│   ├── expenses/
│   ├── tax/
│   ├── sales/
│   └── calculators/   # CDB, LCI/LCA, Tesouro Direto, aposentadoria
├── routes/            # React Router setup + AppLayout
├── services/          # External API clients and data parsers
│   ├── assets.ts          # Firestore CRUD for assets
│   ├── b3-import.ts       # B3 Excel statement parser
│   ├── inter-import.ts    # Inter PDF parser (Apex + DriveWealth)
│   ├── quotes.ts          # Live price fetching + historical prices (sparkline)
│   ├── bcb-rates.ts       # BCB macro rate calculations
│   ├── fundamentals.ts    # BrAPI fundamentals integration
│   ├── notifications.ts   # Firestore CRUD for in-app notifications
│   ├── price-alerts.ts    # Firestore CRUD for price alerts
│   ├── pluggy.ts          # Pluggy Open Finance integration
│   └── import-parser.ts   # ImportParser interface
├── store/             # Jotai atoms (auth)
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
