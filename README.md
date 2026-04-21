# My Wallet

A personal finance and investment portfolio manager built for Brazilian investors. Track your assets across multiple asset classes, import brokerage statements, monitor dividends, and analyze your portfolio allocation — all in one place.

## Features

### Portfolio Management
- Track stocks (B3), FIIs, BDRs, ETFs, US stocks, crypto, fixed income (CDB, LCI, LCA, Tesouro Direto), and other assets
- Automatic weighted average cost (PM) calculation on buys and sells
- Real-time price updates via BrAPI, CoinGecko, and USD/BRL conversion
- Target allocation per category with rebalancing suggestions

### Broker Import
- **B3** — Import from the official B3 Excel statement (Extrato de Negociação)
- **Inter Co Securities** — Import Transaction Confirmation PDFs (supports Apex Clearing and the newer DriveWealth format). Prices are automatically converted from USD to BRL at the current exchange rate.

### Dividends
- Log dividends, JCP, and rendimentos
- Import dividend history from B3 statements
- Tax tracking (IR on JCP)

### Fundamental Analysis
- P/L, sector, industry data via BrAPI
- FII-specific metrics: vacancy, property count, DY, manager fees
- Monthly snapshots for historical tracking

### Expenses
- Manual expense entry with categories
- Fixed recurring expenses
- Installment purchases

### Sales Tracking
- Track hardware/tech resales (GPUs, CPUs, smartphones, etc.)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Routing | React Router 7 |
| Build | Vite 8 |
| State | Jotai |
| Styling | Tailwind CSS 4 + Radix UI |
| Database | Firebase Firestore |
| Auth | Firebase Auth (Google, GitHub, Apple) |
| PDF parsing | PDF.js |
| Excel parsing | SheetJS (XLSX) |

## External APIs

| API | Purpose |
|---|---|
| [BrAPI](https://brapi.dev) | Brazilian stock, FII, BDR, ETF, and US stock quotes |
| [CoinGecko](https://coingecko.com) | Cryptocurrency prices in BRL |
| [AwesomeAPI](https://economia.awesomeapi.com.br) | USD/BRL exchange rate |
| [BCB](https://api.bcb.gov.br) | CDI, Selic, IPCA, IGP-M rates for fixed income |
| [Dados de Mercado](https://dadosdemercado.com.br) | Tesouro Direto bond prices |

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

# BrAPI — required for stock/FII/ETF/US price refresh
VITE_BRAPI_TOKEN=

# Dados de Mercado — optional, enables Tesouro Direto price refresh
VITE_DADOSDEMERCADO_TOKEN=
```

### 3. Firebase setup

In your Firebase console:
1. Create a Firestore database (production mode)
2. Enable Authentication and add providers: **Google**, **GitHub**, **Apple**
3. Copy the project credentials into your `.env`

### 4. Run

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

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
├── components/       # Shared UI components (shadcn/ui based)
├── hooks/            # Custom React hooks (usePortfolio, etc.)
├── lib/              # Firebase client, utilities
├── pages/            # Page components (portfolio, dividends, expenses…)
├── services/         # External API clients and data parsers
│   ├── b3-import.ts      # B3 Excel statement parser
│   ├── inter-import.ts   # Inter PDF parser (Apex + DriveWealth formats)
│   ├── quotes.ts         # Live price fetching with localStorage cache
│   ├── bcb-rates.ts      # BCB fixed income rate calculations
│   └── fundamentals.ts   # BrAPI fundamentals integration
├── store/            # Jotai atoms (auth, etc.)
└── types/            # TypeScript type definitions
```

## Broker Import Guide

### B3
1. Go to [investidor.b3.com.br](https://investidor.b3.com.br)
2. Navigate to **Extratos → Negociação → Baixar → Excel**
3. Import the `.xlsx` file in the app under **Portfolio → Importações**

### Inter Co Securities (US assets)
1. In the Inter app, go to **Investimentos → Notas de corretagem Ações EUA**
2. Download the PDF for each transaction confirmation
3. Import each PDF in the app under **Portfolio → Importações → Inter Co Securities**

> **Note:** Inter only provides downloadable PDFs from 08/28/2023 onward. For older trades, use manual entry or add the asset directly with your known average cost.
