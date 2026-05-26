# Notas Técnicas — My Wallet

> Documento de referência pessoal.
> Mapeamento completo de cada feature → fonte de dados, API externa, coleção Firebase e funções-chave.

---

## Índice

1. [Autenticação](#autenticação)
2. [Estrutura do Firebase](#estrutura-do-firebase)
3. [Variáveis de Ambiente](#variáveis-de-ambiente)
4. [Dashboard](#dashboard)
5. [Portfólio — Visão Geral](#portfólio--visão-geral)
6. [Portfólio — Metas (Alocação)](#portfólio--metas-alocação)
7. [Portfólio — Realocamento](#portfólio--realocamento)
8. [Portfólio — Aporte](#portfólio--aporte)
9. [Portfólio — Movimentações + Importações](#portfólio--movimentações--importações)
10. [Portfólio — Análises](#portfólio--análises)
11. [Atualização de Preços](#atualização-de-preços)
12. [Display de Moeda (BRL / USD)](#display-de-moeda-brl--usd)
13. [PTAX e cotação USD/BRL](#ptax-e-cotação-usdbrl)
14. [Renda Fixa — Cálculo de Valor](#renda-fixa--cálculo-de-valor)
15. [Tesouro Direto — Precificação](#tesouro-direto--precificação)
16. [Importação de Corretoras](#importação-de-corretoras)
17. [Proventos (Dividendos)](#proventos-dividendos)
18. [Vendas](#vendas)
19. [Imposto de Renda (IR)](#imposto-de-renda-ir)
20. [Gastos](#gastos)
21. [Calculadoras](#calculadoras)
22. [Alertas CVM](#alertas-cvm)
23. [Análise por IA (Gemini)](#análise-por-ia-gemini)
24. [Alertas de Preço e Notificações](#alertas-de-preço-e-notificações)
25. [Sparkline (Gráfico Inline)](#sparkline-gráfico-inline)
26. [Privacy Mode](#privacy-mode)
27. [CSV Export (Portfólio)](#csv-export-portfólio)
28. [Valuation (Graham e FII)](#valuation-graham-e-fii)
29. [PWA (Progressive Web App)](#pwa-progressive-web-app)
30. [Design Responsivo e Mobile](#design-responsivo-e-mobile)
31. [Tabela Resumo — APIs Externas](#tabela-resumo--apis-externas)

---

## Autenticação

**Arquivo:** `src/store/auth.ts`

**Provedores disponíveis:** Google, GitHub, Apple (todos via OAuth popup do Firebase)

**Como funciona:**
1. Usuário clica em login → `signInWithPopup(auth, provider)` abre popup OAuth
2. Firebase retorna o objeto `User` com `uid`
3. `onAuthStateChanged()` detecta a mudança e atualiza o estado global via Jotai (`userAtom`)
4. Rotas protegidas (`ProtectedRoute`) verificam `user` antes de renderizar

**Funções:**
- `useAuthInit()` — inicializa o listener de auth (chamado em `App`)
- `useAuth()` — hook que expõe `{ user, loading, loginWithGoogle, loginWithGithub, loginWithApple, logout }`

**Todos os dados do usuário no Firestore ficam sob o caminho `users/{uid}/...`**, ou seja, cada usuário tem seus próprios dados isolados.

---

## Estrutura do Firebase

**Arquivo de configuração:** `src/lib/firestore.ts`

Todas as coleções ficam dentro de `users/{uid}/`:

| Coleção | Conteúdo | Arquivo de serviço |
|---|---|---|
| `assets` | Ativos da carteira | `src/services/assets.ts` |
| `categories` | Categorias de alocação | `src/services/categories.ts` |
| `trades` | Histórico de operações | `src/services/trades.ts` |
| `dividends` | Proventos recebidos | `src/services/dividends.ts` |
| `diagrams` | Critérios de alocação (diagrama) | `src/services/diagrams.ts` |
| `answers` | Respostas do diagrama por ativo | `src/services/answers.ts` |
| `imports` | Histórico de importações B3/Inter | `src/services/imports.ts` |
| `expenses` | Gastos manuais | `src/services/expenses.ts` |
| `salary` | Salário mensal (doc ID = YYYY-MM) | `src/services/expenses.ts` |
| `fixedExpenses` | Gastos fixos recorrentes | `src/services/expenses.ts` |
| `installmentExpenses` | Parcelamentos | `src/services/expenses.ts` |
| `sales` | Controle de bens para venda | `src/services/sales.ts` |
| `patrimonyHistory` | Histórico de patrimônio (doc ID = YYYY-MM) | `src/services/patrimony.ts` |
| `fundamentals` | Indicadores fundamentalistas por ticker | `src/services/fundamentals.ts` |
| `fii-info` | Dados qualitativos de FII (doc ID = ticker) | `src/services/fundamentals.ts` |
| `stock-info` | Dados qualitativos de ações (doc ID = ticker) | `src/services/fundamentals.ts` |
| `ai-analyses` | Análises geradas pelo Gemini | `src/services/ai-analyses.ts` |
| `cvmSeen` | Controle de alertas CVM já vistos (doc ID = ticker) | `src/services/cvm-alerts.ts` |

### Schema detalhado das coleções principais

**`assets`**
```
id, ticker, name, type (stock|fii|etf|bdr|fixed_income|tesouro|crypto|stock_us|etf_us|other),
categoryId, quantity, avgPrice (BRL), currentPrice (BRL),
avgPriceUsd?, currentPriceUsd?  ← apenas crypto/stock_us/etf_us
targetPercent, score?,
cnpj?, previousTickers? (string[]),
operationDate (YYYY-MM-DD), maturityDate (YYYY-MM-DD),
rateType (pos_cdi|ipca_plus|prefixado|igpm_plus|pos_selic), indexerRate?, prefixedRate?,
institution?, issuer?, fixedIncomeType?
```

Os campos `avgPriceUsd` e `currentPriceUsd` armazenam o **valor original em dólar** sem
conversão reversa. São usados pelo toggle USD na Visão Geral pra mostrar o PM real (igual à
exchange/broker) em vez de dividir o BRL pela cotação atual.

**`trades`**
```
id, ticker, type (buy|sell), quantity, price (BRL), total (BRL),
date (YYYY-MM-DD), source (b3_import|inter_import|manual), importId?,
label? (bonificacao|amortizacao|desdobramento|grupamento|vencimento),
priceUsd?, totalUsd?, usdRateAtTrade?  ← apenas Inter USA
```

**`dividends`**
```
id (ticker-paymentDate-type), ticker, amount (BRL), paymentDate,
type (dividendo|jcp|rendimento|dividendo_ext),
ir?, currency? (USD), amountUsd?, irUsd?,
amountBrl?, irBrl?, usdRateAtPayment?  ← apenas dividendos em USD
```

**`expenses`**
```
id, description, amount, category (ExpenseCategory),
date (YYYY-MM-DD), source (manual)
```

**`fixedExpenses`**
```
id, description, amount, category, startMonth (YYYY-MM), endMonth? (YYYY-MM), createdAt
```

**`installmentExpenses`**
```
id, description, totalAmount, installments, installmentAmount,
startMonth (YYYY-MM), category, createdAt
```

**`sales`**
```
id, name, category (SaleCategory), buyPrice, boughtAt (YYYY-MM-DD),
notes?, sellPrice?, soldAt? (YYYY-MM-DD)
```

---

## Variáveis de Ambiente

Ficam no arquivo `.env` na raiz do projeto (não sobe pro GitHub):

| Variável | Para que serve |
|---|---|
| `VITE_FIREBASE_API_KEY` | Autenticação Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | Autenticação Firebase |
| `VITE_FIREBASE_PROJECT_ID` | Identificador do projeto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging |
| `VITE_FIREBASE_APP_ID` | Firebase App |
| `VITE_BRAPI_TOKEN` | Token da brapi.dev — cotações de ações/FIIs e histórico de preços |
| `VITE_GEMINI_API_KEY` | Google Gemini — análise de IA |
| `VITE_CVM_PROXY_URL` | (opcional) URL alternativa para dados da CVM |
| `RESEND_API_KEY` | Resend — envio de email para alertas de preço (server-side) |

---

## Dashboard

**Arquivo:** `src/pages/dashboard/index.tsx`
**Hook principal:** `src/hooks/use-dashboard.ts`

### Card 1 — Indicadores de Mercado (Dólar, BTC, Selic, IPCA, IGP-M)

**Componente:** `src/components/market-indicators.tsx`
**Hook:** `useMarketData()` (dentro de market-indicators.tsx)
**Serviço:** `src/services/market-data.ts` → função `fetchMarketData()`

**O que busca e de onde:**

| Indicador | API | Endpoint |
|---|---|---|
| Dólar (USD/BRL) | Awesome API | `https://economia.awesomeapi.com.br/last/USD-BRL` |
| Bitcoin (BRL) | CoinGecko | `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true` |
| Selic | Banco Central | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json` |
| IPCA 12m | Banco Central | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados/ultimos/12?formato=json` |
| IGP-M 12m | Banco Central | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados/ultimos/12?formato=json` |

**Cache:** localStorage (`mw_market_v1`), TTL 1 hora
**Firebase:** Não salva nada — dados só em memória/cache local

---

### Card 2 — Patrimônio Total

**Dado:** soma de `currentPrice * quantity` de todos os ativos
**Fonte:** coleção `users/{uid}/assets` (subscription em tempo real)
**Cálculo:** feito no hook `use-dashboard.ts`
**Função:** `subscribeToAssets(uid, callback)` em `src/services/assets.ts`

---

### Card 3 — Ganho não realizado

**Dado:** `patrimônio total − custo total`
**Custo total:** soma de `avgPrice * quantity`
**Fonte:** mesma coleção `assets`
**Não usa API externa**

---

### Card 4 — Proventos (últimos 12 meses)

**Fonte:** coleção `users/{uid}/dividends`
**Função:** `subscribeToAllDividends(uid, callback)` em `src/services/dividends.ts`
**Filtro:** dividendos com `paymentDate` nos últimos 12 meses

---

### Card 5 — Gastos do mês

**Fonte:** coleções `expenses` + `fixedExpenses` + `installmentExpenses`
**Hook:** `useExpenses()` em `src/hooks/use-expenses.ts`
**Função de cálculo:** `getRecurringForMonth(month)` — soma fixos e parcelas do mês atual

---

### Gráfico de Evolução do Patrimônio

**Fonte:** coleção `users/{uid}/patrimonyHistory`
**Função:** `subscribeToPatrimonyHistory(uid, callback)` em `src/services/patrimony.ts`
**Como é alimentado:** snapshot salvo automaticamente sempre que os preços são atualizados (`savePatrimonySnapshot()` chamado no final de `refreshPrices`)
**Componente:** `src/components/patrimony-chart.tsx`

---

### Barra de Alocação

**Dado:** distribuição do patrimônio por tipo de ativo (ações, FII, ETF, renda fixa, cripto, exterior)
**Fonte:** coleção `assets` — agrupa por `type`
**Sem API externa**

---

## Portfólio — Visão Geral

**Arquivo:** `src/pages/portfolio/components/tabs/overview/index.tsx`
**Hook:** `usePortfolio()` em `src/hooks/use-portfolio.ts`

**Dados exibidos na tabela:**

| Coluna | Fonte | Cálculo |
|---|---|---|
| Ativo / Ticker | `assets.name`, `assets.ticker` | Direto do Firebase |
| Tipo | `categories` → `assets.categoryId` | Badge com cor da categoria |
| Qtd | `assets.quantity` | Direto |
| PM (preço médio) | `assets.avgPrice` (BRL) / `assets.avgPriceUsd` (USD) | Direto |
| Total investido | `avgPrice × qty` ou `avgPriceUsd × qty` | Calculado localmente |
| Preço atual | `assets.currentPrice` (BRL) / `assets.currentPriceUsd` (USD) | Atualizado via API |
| Total atual | `currentPrice × qty` ou `currentPriceUsd × qty` | Calculado localmente |
| Recomendado | Diagrama + metas de categoria | `computeAssetTargets()` em `src/pages/portfolio/components/compute-targets.ts` |
| Resultado % | `(totalAtual - custo) / custo * 100` | Calculado localmente |
| % Cart. / % Cat. | `totalAtual / totalCarteira * 100` | Calculado localmente |

**Toggle BRL / USD** (chip `$` ao lado do "Patrimônio total"):
- Em **BRL**: lê `avgPrice` / `currentPrice` direto
- Em **USD**: se o ativo tem `avgPriceUsd` / `currentPriceUsd`, usa direto; senão, conversão
  reversa (BRL ÷ cotação atual da AwesomeAPI) — útil pra ativos BR que não têm preço nativo
  em USD
- Implementado em `src/store/display-currency.ts` (átomo Jotai `displayUsdAtom`) — ver seção
  [Display de Moeda](#display-de-moeda-brl--usd)

**Ações disponíveis:**
- **Atualizar preços** → `refreshPrices()` (ver seção Atualização de Preços)
- **Importar via corretora** → `importFromB3()` (ver seção Importações)
- **Adicionar ativo** → `addAsset()` → salva em `users/{uid}/assets`
  - Se ticker já existir, faz merge (média ponderada de `avgPrice` e `avgPriceUsd`)
- **Editar ativo** → `editAsset(id, data)` → atualiza em `users/{uid}/assets`
  - Edit dialog mostra campo "PM ($)" pra crypto/stock_us/etf_us
- **Excluir ativo** → `deleteAsset(id)` → remove de `users/{uid}/assets`

---

## Como um ativo entra na carteira — dois caminhos

Existem duas formas de um ativo aparecer em `users/{uid}/assets`, e elas têm consequências diferentes na aba de IR:

### Caminho 1 — Via importação (B3 Excel ou Inter PDF)

```
Arquivo importado
  → parseB3Excel() / parseInterPdf()
  → importFromB3(userId, parsed)
      ├── Para cada ativo do arquivo:
      │     ├── Se não existe → addAsset() com quantity + avgPrice calculados
      │     └── Se já existe  → updateAsset() mesclando qty/avgPrice (média ponderada)
      └── Para cada trade do arquivo:
            └── addTrade() → salva em users/{uid}/trades
```

- Ativo em `assets` **e** trades em `trades` — IR funciona automaticamente.
- O `avgPrice` em `assets` é calculado a partir dos trades do próprio arquivo.
- Importações Inter USA gravam também `priceUsd`, `totalUsd`, `usdRateAtTrade` em cada trade.

### Caminho 2 — Adição/edição manual

```
Usuário preenche formulário ou edita ativo existente
  → addAsset() / updateAsset()
      └── Salva/atualiza apenas em users/{uid}/assets
          (NÃO cria nenhum registro em trades)
```

- Ativo aparece na carteira normalmente (preços, patrimônio, diagrama).
- **Mas não aparece na aba IR**, pois `buildPositions` lê somente `trades`.
- Isso acontece com ativos do exterior adicionados manualmente, bonificações editadas direto no qty, etc.

### Como corrigir ativos sem histórico de trades — Sincronizar

O botão **"Sincronizar ativos existentes"** na aba Movimentações chama `syncMissingTrades()`:

```
Para cada ativo em assets:
  Se não existe nenhum trade com esse ticker em trades:
    → addTrade({
        ticker, type: 'buy',
        quantity: asset.quantity,
        price: asset.avgPrice,
        total: asset.quantity * asset.avgPrice,
        date: asset.operationDate ?? hoje,
        source: 'manual'
      })
```

- Cria **um único trade sintético de compra** com a posição atual do ativo.
- Após sincronizar, o ativo passa a aparecer no IR com o custo correto.
- Não duplica se já existir algum trade para o ticker.

### Por que `buildPositions` usa trades e não assets diretamente

A aba IR (`src/lib/ir-calc.ts`) reconstrói a posição de cada ativo **cronologicamente** a partir dos trades:

```
buildPositions(trades, endDate, assets, ...)
  → Ordena trades por date ASC
  → Para cada trade até endDate:
      buy  → soma qty, recalcula custo médio ponderado, acumula totalCostUsd (USD)
      sell → reduz qty, reduz custo proporcionalmente
  → Resultado: posição em 31/12 com qty, avgCost, totalCostUsd
```

Isso garante que o custo médio e a quantidade declarada no IR reflitam o histórico real de operações, não só o estado atual do ativo. O `assets` é usado apenas para metadados (tipo, nome, cnpj, previousTickers) — nunca para qty ou avgPrice no IR.

**`previousTickers`** no ativo cria um mapa de alias `{ MALL11 → PMLL11 }` para que trades antigos com o ticker original sejam contabilizados na posição do ticker atual.

---

## Portfólio — Metas (Alocação)

**Arquivo:** `src/pages/portfolio/components/tabs/allocation/index.tsx`

**Dados exibidos:**
- Categorias com meta % × real % → diferença
- Lista de ativos dentro de cada categoria
- Diagrama de perguntas/respostas para cálculo de score

**Coleções usadas:**
- `users/{uid}/categories` — categorias com `targetPercent` e `color`
- `users/{uid}/diagrams` — perguntas do critério de alocação
- `users/{uid}/answers` — respostas por ativo (`{ [questionId]: 0|1 }`)

**Funções:**
- `saveCategory(cat)` → `setDoc` em `categories`
- `deleteCategory(catId)` → `deleteDoc` em `categories`
- `saveDiagram(diagram)` → `setDoc` em `diagrams`
- `saveAnswers(assetId, answers)` → `setDoc` em `answers`

**Como o "Recomendado" é calculado:**
- Arquivo: `src/pages/portfolio/components/compute-targets.ts`
- Para cada ativo: `score = respostas "sim" / total perguntas`
- Score normalizado dentro da categoria → determina % alvo do ativo
- Valor recomendado = `(% alvo do ativo / % alvo da categoria) × valor atual da categoria`

---

## Portfólio — Realocamento

**Arquivo:** `src/pages/portfolio/components/tabs/rebalance/index.tsx`

Calcula **quanto vender e comprar** em cada categoria/ativo para atingir as metas de alocação
sem aportar dinheiro novo. Também permite **simular** com um patrimônio hipotético.

**Cálculo (`calcRebalance`):**
- Para cada categoria: `currentValue`, `targetValue = (targetPercent / 100) × totalValue`,
  `diff = currentValue - targetValue`
- Para cada ativo: peso dentro da categoria via `computeAssetTargets()`
- Ordenação: **compras primeiro** (mais necessária no topo), depois vendas, depois "Ajustado"

**Simulador:**
- Estado local `simulatedInput` formatado em PT-BR ao digitar
- Botão **Play** aplica a simulação; **Resetar** volta ao valor real
- Toda a tabela recalcula com o `totalValue` simulado

**Sem API externa, sem gravação no Firebase.**

---

## Portfólio — Simular Aporte

**Arquivo:** `src/pages/portfolio/components/tabs/aporte/index.tsx`

Mostra quanto aportar em cada ativo para chegar na alocação alvo.

**Cálculo:**
- Recebe valor do aporte digitado pelo usuário
- Distribui proporcionalmente baseado na diferença entre alocação atual e meta
- Usa `computeAssetTargets()` para os alvos por ativo
- **Sem API externa, sem gravação no Firebase**

---

## Portfólio — Movimentações + Importações

**Arquivo:** `src/pages/portfolio/components/tabs/trades/index.tsx`

A tab "Importações" foi unificada dentro de "Movimentações" com um **sub-nav pill**
(ícones arredondados): você alterna entre o histórico de trades e o histórico de
importações. As duas eram conceitualmente conectadas (importações geram trades).

### Movimentações

**Fonte:** coleção `users/{uid}/trades` (ordenada por date DESC)
**Função:** `subscribeToTrades(uid, callback)` em `src/services/trades.ts`

**Campos da operação:**
```
ticker, type (buy/sell), quantity, price, total,
date (YYYY-MM-DD), source (b3_import|inter_import|manual),
priceUsd?, totalUsd?, usdRateAtTrade?  ← apenas Inter USA
```

**Ações:**
- **Deletar trade** → `deleteTrade(tradeId)` → remove de `trades`
- **Sincronizar** → `syncMissingTrades()` → cria trades sintéticos de compra para ativos
  que não têm histórico de operações

**Operação manual (adicionar trade pelo app):**
- Função: `addManualTrade(trade)` em `use-portfolio.ts`
- Salva o trade em `trades` com `source: 'manual'`
- Atualiza `quantity` e `avgPrice` do ativo em `assets`
- Se quantidade chegar a 0 → deleta o ativo

### Importações (sub-section)

**Componente:** `ImportsTab` em `src/pages/portfolio/components/tabs/imports/index.tsx`
**Fonte:** coleção `users/{uid}/imports`
**Função:** `subscribeToImports(uid, callback)` em `src/services/imports.ts`

**Cada registro de importação contém:**
```
id, filename, importedAt (ISO),
items: [{ assetId, ticker, quantityDelta, importAvgPrice,
          previousQuantity, previousAvgPrice, wasCreated }]
```

**Reverter importação → `revertImport(record)`:**
- Para ativos criados na importação: `deleteAsset()`
- Para ativos atualizados: restaura `quantity` e `avgPrice` anteriores
- Remove o registro de `imports`

---

## Portfólio — Análises

**Arquivo:** `src/pages/portfolio/components/tabs/analysis/index.tsx`
**Hook:** `useFundamentals()` em `src/hooks/use-fundamentals.ts`

**Coleções usadas:**
- `users/{uid}/fundamentals` — snapshots mensais de indicadores (P/L, P/VP, ROE, etc.)
- `users/{uid}/fii-info` — dados qualitativos de FIIs (CNPJ, gestora, taxa, segmento)
- `users/{uid}/stock-info` — dados qualitativos de ações (setor, controlador, governança)
- `users/{uid}/ai-analyses` — análises geradas pelo Gemini

**Atualizar fundamentais via Brapi:**
- Função: `refreshFundamentals(tickers)` em `use-fundamentals.ts`
- Chama: `fetchBrapiSummary(ticker)` em `src/services/fundamentals.ts`
- API: `https://brapi.dev/api/quote/{ticker}?modules=summaryProfile&token={VITE_BRAPI_TOKEN}`
- Retorna: `priceEarnings`, `sector`, `industry`
- Salva snapshot mensal em `fundamentals` (máximo 12 snapshots por ativo)

**Indicadores inseridos manualmente:**
- P/VP, DY, ROE, ROIC, margens, crescimento, dívida, etc.
- Função: `saveManualSnapshot(ticker, partial)` → atualiza `fundamentals`

**Dados qualitativos de FII/Ação:**
- `saveFiiInfo(data)` → `setDoc` em `fii-info`
- `saveStockInfo(data)` → `setDoc` em `stock-info`
- `saveFiiManual(data)` → atualiza dados específicos de FII (vacância, NOI, etc.)

---

## Atualização de Preços

**Função:** `refreshPrices()` em `src/hooks/use-assets.ts`
**Serviço de cotações:** `src/services/quotes.ts`

### Tipo `PriceMap`

```typescript
type PriceInfo = { brl: number; usd?: number }
type PriceMap = Record<string, PriceInfo>
```

Todas as funções de fetch retornam `PriceMap`. Os ativos USD-nativos (cripto, stock_us,
etf_us) trazem **ambos BRL e USD**; ativos BR-only trazem só BRL.

**Fluxo:**

```
refreshPrices()
  ├── fetchLivePrices(assets) [src/services/quotes.ts] → PriceMap
  │     ├── Ações BR / FII / ETF BR / BDR → brapi.dev (BRL direto, sem USD)
  │     ├── Ações US / ETF US            → brapi.dev (USD nativo + BRL via cotação atual)
  │     ├── Cripto                        → CoinGecko (BRL + USD na mesma chamada)
  │     └── Tesouro Direto               → /api/tesouro (BRL apenas)
  │
  ├── updateAsset(uid, assetId, { currentPrice, currentPriceUsd }) → atualiza ambos
  │
  ├── setFreshPrices(prices) → atom Jotai consumido por usePriceAlerts
  │
  ├── calcFixedIncomeValue() [src/services/bcb-rates.ts]
  │     └── Para CDB/LCI/LCA com operationDate e rateType definidos
  │         └── Busca séries históricas do Banco Central
  │
  └── savePatrimonySnapshot(uid, totalPatrimony) → salva em `patrimonyHistory`
```

**Cache de cotações:** localStorage (`mw_quotes_v1`), TTL 5 minutos
(armazena PriceMap completo, incluindo USD quando disponível)

**Classificação de tickers:**
- Arquivo: `src/services/quotes.ts` → `fetchTickerSets()`
- API: `https://brapi.dev/api/quote/list?token={VITE_BRAPI_TOKEN}`
- Retorna listas separadas de tickers FII, ações, BDR
- Cache: 24 horas

---

## Display de Moeda (BRL / USD)

**Arquivo:** `src/store/display-currency.ts`

Toggle global (átomo Jotai `displayUsdAtom`) que muda a exibição da Visão Geral entre BRL e
USD **sem afetar nenhum dado armazenado** — é puramente apresentational.

### Hook `useDisplayCurrency()`

```typescript
const { displayUsd, toggleDisplayUsd, usdRate, canShowUsd, fmt, fmtPreferUsd } = useDisplayCurrency()
```

- `displayUsd: boolean` — modo atual
- `toggleDisplayUsd()` — alterna
- `usdRate: number` — cotação atual (`useMarketData().usdBrl`, AwesomeAPI)
- `fmt(brl)` — formata, com **conversão reversa** quando em USD (usado pra ativos BR)
- `fmtPreferUsd(brl, usdOriginal?)` — se em USD e `usdOriginal` existe, usa direto;
  senão fallback pra `fmt(brl)` (usado em PM/Total quando o ativo tem `avgPriceUsd`/
  `currentPriceUsd`)

### Onde usa o que

| Componente | Função |
|---|---|
| `CategoryFilter` (patrimônio total) | `fmt(filteredTotal)` — total agregado, conversão reversa |
| `CategoryCards` (por categoria) | `fmt(val)` — total da categoria, conversão reversa |
| `AssetsTable` PM/Total investido | `fmtPreferUsd(avgPrice, avgPriceUsd)` |
| `AssetsTable` Preço/Total atual | `fmtPreferUsd(currentPrice, currentPriceUsd)` |

### Cotação usada no toggle

O toggle de **visualização** usa a cotação **atual da AwesomeAPI**, não PTAX. PTAX é
reservada pra contextos **fiscais** (IR, dividendos, importações Inter). Ver seção
[PTAX e cotação USD/BRL](#ptax-e-cotação-usdbrl).

---

## PTAX e cotação USD/BRL

O app usa **duas fontes distintas** de cotação USD/BRL conforme o contexto:

| Contexto | Função | Fonte | Por quê |
|---|---|---|---|
| Visualização (dashboard, toggle USD) | `fetchUsdBrlRate()` | AwesomeAPI `last/USD-BRL` | Tempo real, atualizado a cada minuto |
| Histórico p/ visualização | `fetchUsdBrlRateForDate(date)` | AwesomeAPI `daily/USD-BRL` | Cotação de mercado da data |
| **IR e contextos fiscais** | `fetchPtaxRate()` | BCB SGS série **10813** (PTAX venda) | Referência oficial Receita Federal |
| **Inter import por trade** | `fetchPtaxRateForDate(date)` | BCB SGS série 10813 | PTAX da data de cada operação |
| **Form de cripto** | inline em `crypto-form.tsx` | BCB SGS série 10813 | Auto-preenche cotação histórica |

**Cache PTAX:** localStorage `mw_ptax_{date}` (permanente — PTAX histórica não muda)

**Janela de busca:** 10 dias antes da data alvo (cobre fins de semana e feriados quando
PTAX não é publicada). Pega a última cotação disponível.

**Onde o PTAX é aplicado hoje (refatoração concluída):**
- `src/pages/tax/index.tsx` — usa `fetchPtaxRate()` no lugar de `fetchUsdBrlRate()`
- `src/pages/portfolio/components/tabs/dividends/index.tsx` — idem
- `src/services/inter-import.ts` — `fetchPtaxRateForDate(trade.date)` por trade

---

## Renda Fixa — Cálculo de Valor

**Arquivo:** `src/services/bcb-rates.ts`
**Função principal:** `calcFixedIncomeValue(principal, rateType, indexerRate, prefixedRate, startDate)`

**Só é executado se o ativo tiver `operationDate` e `rateType` preenchidos.**

**Séries do Banco Central usadas:**

| Indexador | Série BCB | Endpoint |
|---|---|---|
| CDI diário | 12 | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados?...` |
| Selic diária | 11 | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.11/dados?...` |
| IPCA mensal | 433 | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?...` |
| IGP-M mensal | 189 | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.189/dados?...` |

**Lógica:**
1. Busca a série histórica desde `operationDate` até hoje
2. Acumula os fatores diários/mensais
3. Aplica o spread (`indexerRate`) ou taxa prefixada
4. Retorna o valor atualizado

**Exemplo:** CDB com 110% CDI desde 01/01/2023 → busca CDI diário do BCB e aplica fator acumulado × 1.10

---

## Tesouro Direto — Precificação

**Arquivo:** `src/services/tesouro.ts`

**Endpoint:** `/api/tesouro` (proxy no backend do projeto)
**Formato:** CSV com colunas: tipo, vencimento, dataBase, taxaCompra, taxaVenda, puCompra, puVenda
**Cache:** localStorage (`mw_tesouro_v1`), TTL 1 hora

**Como os tickers são formados:**
- Exemplo: `TESOURO SELIC 2029`, `TESOURO IPCA+ 2035`
- O ticker do ativo no Firebase deve começar com `TESOURO` para usar esta precificação

**Preço retornado:** `puVenda` (Preço Unitário de venda) = valor de mercado atual da cota

---

## Importação de Corretoras

### B3 (arquivo Excel)

**Arquivo:** `src/services/b3-import.ts`
**Formato:** `.xlsx` exportado do portal da B3
**Parser:** biblioteca `xlsx`

**O que extrai:**
- Posição de cada ativo (quantidade, PM, preço atual)
- Trades individuais (compras e vendas com datas)
- Proventos (dividendos, JCP, rendimentos com IR)

**Regra do preço médio:**
- Compras: novo PM = (qtd anterior × PM anterior + qtd comprada × preço compra) / nova qtd total
- Vendas: PM não muda

### Inter (arquivo PDF)

**Arquivo:** `src/services/inter-import.ts`
**Formato:** PDF do extrato da corretora Inter
**Reconhecimento de ETFs US:** lista fixa de ~100 tickers americanos (SPY, VOO, QQQ, etc.)

**Conversão USD → BRL:**
- Cada trade é convertido pela **PTAX da sua data** (BCB série 10813) — não pela cotação
  atual única
- `fetchPtaxRateForDate(trade.date)` é chamada por data única (com cache)
- Trades preservam `priceUsd`, `totalUsd` e `usdRateAtTrade` (PTAX usada)
- `avgPrice` em BRL do ativo agregado é **média ponderada** considerando o PTAX de cada
  compra (`priceUsd × rateFor(date)` somado e dividido pela qty)

### Inter — Extrato (dividendos externos)

**Arquivo:** `src/services/inter-extrato.ts`
**Formato:** arquivo texto
**Finalidade:** importar dividendos recebidos em USD de ETFs/ações americanas

### Fluxo completo de importação (função `importFromB3`)

`src/hooks/use-portfolio.ts`

```
Para cada ativo do arquivo:
  ├── Já existe na carteira?
  │     ├── Sim → atualiza quantity e avgPrice
  │     │         Se nova quantidade = 0 → deleta o ativo
  │     └── Não → cria novo ativo com categoria automática por tipo
  │
Salva registro em `imports` com snapshot do estado anterior
Salva trades em `trades` com source: 'b3_import'
Salva proventos em `dividends`
```

---

## Proventos (Dividendos)

**Arquivo:** `src/pages/dividends/index.tsx`
**Serviço:** `src/services/dividends.ts`
**Coleção:** `users/{uid}/dividends`

**ID do documento** = `{ticker}-{paymentDate}-{type}` → evita duplicatas na mesma importação

**Tipos de provento:**
- `dividendo` — dividendo de ação BR
- `jcp` — Juros sobre Capital Próprio
- `rendimento` — rendimento de FII
- `dividendo_ext` — dividendo de ação US (em USD, convertido para BRL)

**Como os proventos entram:**
1. **Via importação B3/Inter** → extraídos automaticamente do arquivo → `addDividends()`
2. **Não há adição manual de proventos pela UI** (só via importação)

**Conversão USD → BRL:**
- **Exibição** (aba Proventos): `fetchPtaxRate()` — PTAX venda atual (BCB 10813)
- **IR** (aba IR — `calcRendimentosExterior`): também usa `fetchPtaxRate()` quando o
  dividendo não tem `usdRateAtPayment` próprio
- Proventos em USD têm campos `amountUsd`, `irUsd`, `amountBrl`, `irBrl` e
  `usdRateAtPayment` (PTAX da data de pagamento, preservada na importação)

---

## Vendas

**Arquivo:** `src/pages/sales/index.tsx`
**Hook:** `src/hooks/use-sales.ts`
**Coleção:** `users/{uid}/sales`

**Finalidade:** controle de bens físicos ou investimentos fora do portfólio de ativos (imóveis, veículos, etc.)

**Categorias disponíveis:** definidas em `SaleCategory` no arquivo de tipos

**Funções:**
- `addSale(item)` → cria em `sales`
- `updateSale(id, data)` → atualiza (ex: marcar como vendido com preço e data)
- `deleteSale(id)` → remove de `sales`

**Cálculo de lucro:** `(sellPrice - buyPrice)` exibido no card de cada item vendido

---

## Imposto de Renda (IR)

**Arquivo:** `src/pages/tax/index.tsx`
**Cálculo:** `src/lib/ir-calc.ts`

**Fontes de dados:**
- `users/{uid}/trades` — histórico de operações para calcular ganhos de capital
- `users/{uid}/assets` — posição atual para declaração de bens
- `users/{uid}/dividends` — proventos para rendimentos tributáveis/isentos
- `fetchTickerSets()` — classifica cada ticker como FII, ação, BDR, ETF
- `fetchPtaxRate()` — **PTAX venda** (BCB 10813) usada como referência oficial pra
  converter rendimentos em USD (em vez da cotação de mercado AwesomeAPI)

**Abas e o que calculam:**

| Aba | Função | Regra |
|---|---|---|
| Bens e Direitos | `calcDependentLiabilities()` | Agrupa ativos por código DIRPF |
| Rendimentos Tributáveis | `calcRendimentosTributaveis()` | JCP: 15%; dividendos de ações acima de R$20k/mês |
| Rendimentos Isentos | `calcRendimentosIsentos()` | Dividendos de ações ≤ R$20k/mês; rendimentos de FII |
| Rendimentos Exterior | `calcRendimentosExterior()` | Dividendos em USD convertidos → 15% IR |
| Variável | `calcMonthlyRV()` | Ações 15% (isento ≤ R$20k); FII 20% sem isenção |
| Retenções | — | IR retido na fonte em JCP |

**Regras principais aplicadas:**
- Ações BR: 15% sobre lucro, isento se vendas totais do mês ≤ R$20.000
- FII: 20% sobre lucro, **sem isenção**
- ETF BR: 15%, **sem isenção de R$20k**
- Day-trade: 20% — **não calculado pelo app**
- Prejuízo acumulado: compensado nos meses seguintes dentro do mesmo ano

**Nenhuma API externa é usada nos cálculos — tudo local com base nos dados do Firebase.**

---

## Privacy Mode

**Store:** `src/store/privacy.ts`

- Átomo Jotai `hideValuesAtom` persistido em `localStorage` via `atomWithStorage`
- Quando ativo, todos os valores monetários são substituídos por `••••••` (`MASK`) ou `•••` (`MASK_SHORT`)
- Ativado/desativado pelo botão de olho no header
- Consumido via `usePrivacy()` em qualquer componente com `const { hideValues } = usePrivacy()`

---

## CSV Export (Portfólio)

**Localização:** botão "Exportar CSV" na toolbar da aba Visão Geral do portfólio
**Função:** `onExportCsv` em `src/pages/portfolio/components/tabs/overview/index.tsx`

- Gera um `.csv` com todas as posições abertas: ticker, tipo, quantidade, PM, custo total, preço atual, total atual, resultado %
- Download direto no navegador via `Blob` + `URL.createObjectURL`
- Respeita o filtro de categoria ativo no momento

---

## Valuation (Graham e FII)

**Componente:** `src/pages/portfolio/components/tabs/analysis/components/valuation-section.tsx`

**Ação (Graham):**
- Fórmula: `√(22,5 × LPA × VPA)` onde LPA = Lucro Por Ação (EPS) e VPA = calculado por `P/VP`
- Requires `priceEarnings` (P/L) e `priceToBook` (P/VP) no snapshot de fundamentais
- Exibe: preço justo de Graham, margem de segurança, badge (Subvalorizado / Na faixa / Sobrevalorizado)

**FII (P/VP e DY):**
- Critério de valor: P/VP < 0,95 = subvalorizado; > 1,10 = sobrevalorizado
- Critério de yield: DY ≥ 8% = bom rendimento
- Badge combinado com base nos dois critérios

---

## Gastos

**Arquivo:** `src/pages/expenses/index.tsx`
**Hook:** `src/hooks/use-expenses.ts`

**Tipos de gasto:**

| Tipo | Coleção | Descrição |
|---|---|---|
| Manual | `expenses` | Adicionado a mão pelo usuário |
| Fixo | `fixedExpenses` | Recorrente mensal (plano celular, streaming, etc.) |
| Parcelado | `installmentExpenses` | Parcela calculada automaticamente por mês |

> Versões anteriores tinham importação OFX e Open Finance via Pluggy — ambas foram
> removidas porque exigem CNPJ/contrato pra uso pessoal no Brasil. Toda entrada de
> gasto agora é manual.

**Salário:**
- Coleção: `users/{uid}/salary` (doc ID = `YYYY-MM`)
- Função: `setSalary(uid, month, amount)`

---

## Calculadoras

**Arquivo:** `src/pages/calculators/index.tsx`

**Todas as calculadoras são 100% locais — sem API externa, sem gravação no Firebase.**

| Calculadora | Arquivo | O que faz |
|---|---|---|
| LCI/LCA vs CDB | `src/pages/calculators/components/lci-cdb-calc.tsx` | Compara rendimento líquido considerando isenção de IR do LCI/LCA |
| CDB com IR | `src/pages/calculators/components/cdb-ir-calc.tsx` | Rendimento líquido após IR regressivo (22,5% → 15%) |
| Tesouro Direto | `src/pages/calculators/components/tesouro-calc/` | Marcação a mercado: comparar vender agora × segurar até o vencimento |
| Juros Compostos + FIRE | `src/pages/calculators/components/aposentadoria-calc/` | Simula crescimento de patrimônio e anos para independência financeira |

---

## Alertas CVM

**Hook:** `src/hooks/use-cvm-alerts.ts`
**Serviço:** `src/services/cvm.ts`
**Coleção Firebase:** `users/{uid}/cvmSeen`

**O que é CVM?** Comissão de Valores Mobiliários — equivalente à SEC americana. Empresas listadas são obrigadas a publicar fatos relevantes e comunicados.

**Como funciona:**
1. Busca os ativos da carteira do usuário (ações, FIIs, ETFs, BDRs)
2. Para cada ativo, procura documentos recentes na base da CVM
3. Compara com a data do último documento já visto (`cvmSeen`)
4. Exibe documentos novos no sino de notificações do header

**API da CVM:**
- Endpoint: `https://cvm-dados.gov.br/dados/CIA_ABERTA/DOC/IPE/DADOS/ipe_cia_aberta_{year}.zip`
- Formato: ZIP contendo CSV com separador `|`
- Campos: protocolo, categoria, tipo, data_entrega, versao, link_documento, nome_empresa

**Tipos de documento monitorados:**
- Fato Relevante
- Comunicado ao Mercado
- Relatório Gerencial

**Firebase:**
- `saveCvmLastSeen(uid, ticker, date)` → salva última data vista
- Padrão para primeira vez: 30 dias atrás

**Funções do hook:**
- `check()` — busca documentos novos
- `markAllSeen()` — marca todos como vistos
- `dismissOne(ticker)` — marca um ticker como visto

---

## Análise por IA (Gemini)

**Serviço:** `src/services/gemini.ts`
**Provedor:** Google Gemini 2.5 Flash
**Variável:** `VITE_GEMINI_API_KEY`
**Coleção Firebase:** `users/{uid}/ai-analyses`

**Como funciona:**
1. Usuário cola o texto de um relatório (RI de ação ou Relatório Gerencial de FII) na área de texto
2. O app envia para o Gemini com um prompt estruturado
3. Gemini retorna análise em markdown com indicadores, destaques e contexto
4. O resultado é salvo em `ai-analyses` com `{ ticker, type, text, reportDate, analyzedAt }`

**Prompts:**
- **FII:** foca em vacância, NOI, distribuição, portfólio de imóveis, devedores
- **Ação:** foca em receita, EBITDA, margens, dívida líquida, guidance

**Histórico:**
- Todas as análises ficam salvas e podem ser acessadas pela aba de Análises do portfólio
- Exibido em ordem cronológica por `analyzedAt`

---

## Alertas de Preço e Notificações

**Hooks:** `src/hooks/use-price-alerts.ts`, `src/hooks/use-notifications.ts`
**Serviços:** `src/services/price-alerts.ts`, `src/services/notifications.ts`
**Coleções Firebase:** `users/{uid}/price-alerts`, `users/{uid}/notifications`
**Serverless:** `api/send-alert-email.ts` (Vercel function)

**Como funciona:**
1. O usuário cria um alerta via sininho no header (ticker + preço alvo + direção: acima/abaixo)
2. A cada atualização de preços, `use-assets.ts` seta o átomo `freshPricesAtom` (Jotai)
3. `use-price-alerts.ts` reage ao átomo, verifica todos os alertas ativos e, se atingido:
   - Cria uma notificação em `users/{uid}/notifications`
   - Dispara notificação nativa do navegador (`requireInteraction: true`)
   - Toca um beep via Web Audio API (880 Hz → 660 Hz, 0,5 s)
   - Envia email via Vercel serverless function → Resend SDK
   - Desativa o alerta (`active: false`)
4. Alertas para tickers fora da carteira têm o preço buscado diretamente do BrAPI

**Auto-delete de notificações antigas:**
- `use-notifications.ts` filtra e deleta automaticamente notificações com mais de 30 dias ao carregar

**Email (Resend):**
- Serverless function em `api/send-alert-email.ts`
- Variável de ambiente: `RESEND_API_KEY`
- Sender: `onboarding@resend.dev` (domínio verificado do Resend, funciona sem domínio próprio)
- Funciona apenas em produção (Vercel) — não em `vite dev`

**Sinal de preços (Jotai):**
- `freshPricesAtom` em `src/store/prices.ts` — átomo escrito por `use-assets.ts` após cada refresh
- Evita polling; `use-price-alerts.ts` só roda a verificação quando há preços novos

---

## Sparkline (Gráfico Inline)

**Componente:** `src/components/ui/sparkline.tsx`
**Serviço:** `fetchHistoricalPrices()` em `src/services/quotes.ts`

**Onde aparece:** cards de ativo na aba de Análises do portfólio

**Como funciona:**
1. Chama `https://brapi.dev/api/quote/{ticker}?range=1mo&interval=1d&token={VITE_BRAPI_TOKEN}`
2. Extrai `historicalDataPrice` (até 20 fechamentos diários do último mês)
3. Renderiza um `<polyline>` SVG normalizado para a caixa (padrão 72×28 px)
4. Verde se o último preço ≥ primeiro; vermelho se caiu
5. Cache de 1 hora no localStorage com chave `mw_hist_v1_{ticker}`

---

## PWA (Progressive Web App)

**Plugin:** `vite-plugin-pwa` com Workbox
**Configuração:** `vite.config.ts` → bloco `VitePWA({ ... })`

### Manifesto

- `name`: My Wallet, `short_name`: My Wallet
- `display: standalone` — abre sem barra do navegador
- `theme_color` / `background_color`: `#09090b` (dark)
- Ícones: `favicon.svg` (any) e `pwa-maskable.svg` (maskable para Android)

### Service Worker (Workbox)

- `registerType: 'autoUpdate'` — atualiza silenciosamente quando há nova versão
- `globPatterns`: pré-cacheia todos os arquivos estáticos (`.js`, `.css`, `.html`, `.svg`, etc.)
- `navigateFallback: '/index.html'` — SPA fallback para rotas client-side
- `runtimeCaching` com `NetworkFirst` para domínios Firebase/Firestore (TTL 5 min, timeout 10 s)

### Desenvolvimento vs. Produção

- Em produção (`yarn build`) o SW é gerado e servido normalmente
- Em desenvolvimento, usar `devOptions: { enabled: true, type: 'module' }` no `vite.config.ts` para testar o SW
- Para testar a instalação localmente: `yarn build && yarn preview`

### iOS Safe Area

- `index.html` usa `viewport-fit=cover` no meta viewport
- `apple-mobile-web-app-status-bar-style: black-translucent` para barra de status transparente
- Todos os elementos fixos usam `env(safe-area-inset-top/bottom)`:
  - Header: `paddingTop: env(safe-area-inset-top)` via inline style
  - Bottom nav: `paddingBottom: env(safe-area-inset-bottom)` via inline style
  - FAB e banner de instalação: classe `.chat-fab` / `.above-mobile-nav` em `index.css` com `calc()`
  - Sheets: `paddingTop/Bottom: env(...)` no componente base `sheet.tsx`

### Banner de Instalação

**Componente:** `src/components/pwa-install-prompt.tsx`
- Escuta o evento `beforeinstallprompt` (Android/Chrome)
- Exibe banner "Instalar My Wallet" acima do bottom nav
- Chama `prompt.prompt()` e verifica `userChoice`
- iOS não dispara `beforeinstallprompt` — instrução via Safari "Adicionar à tela inicial"

---

## Design Responsivo e Mobile

### Layout Geral

- **Desktop:** sidebar fixa à esquerda + área de conteúdo com header no topo
- **Mobile:** header no topo + conteúdo central + bottom navigation bar fixo (`md:hidden`)
- Componente do layout: `src/routes/app-layout.tsx`
- Bottom nav: `src/components/layout/mobile-nav.tsx` (6 itens: Dashboard, Gastos, Carteira, IR, Calc, Info)

### Padrões de Responsividade

**Tabs em páginas com múltiplas abas (Portfolio, IR, Calculadoras, Conhecimento):**
- Mobile: `DropdownMenu` shadcn/ui com ícone `Check` no item ativo
- Desktop: barra de tabs horizontal com `hidden md:flex`
- Mesmo padrão em: `src/pages/portfolio/index.tsx`, `src/pages/tax/components/tab-bar.tsx`, `src/pages/calculators/index.tsx`, `src/pages/knowledge/index.tsx`

**Tabelas com muitas colunas:**
- Mobile: lista de cards (`md:hidden`) com informações condensadas em 2-3 linhas
- Desktop: tabela completa (`hidden md:block`)
- Aplicado em: `assets-table.tsx` (visão geral do portfólio), `ticker-row.tsx` (movimentações)

**Toolbars de botões:**
- Ícone sempre visível; texto com `hidden sm:inline` e `title` tooltip para mobile
- Aplicado em: `toolbar.tsx` (portfólio), `page-header.tsx` (gastos e IR)

### Safe Area e Scroll

**Classe `.main-scroll-area`** (`src/index.css`):
- Mobile: `padding-bottom: calc(4rem + env(safe-area-inset-bottom))` — espaço para o bottom nav + safe area
- Desktop: `padding-bottom: 0`
- Aplicada no `<main>` em `app-layout.tsx`

**FAB do chat:** classe `.chat-fab` — posiciona `0.75rem` acima do bottom nav respeitando safe area; `1.5rem` do fundo no desktop

---

## Tabela Resumo — APIs Externas

| API | Endpoint base | Dados | Auth | Cache |
|---|---|---|---|---|
| Awesome API | `https://economia.awesomeapi.com.br` | USD/BRL atual e histórico (uso de visualização) | Não | 15 min (atual), permanente (histórico) |
| CoinGecko | `https://api.coingecko.com/api/v3` | Cotação atual de cripto (BRL+USD); histórico por data via `/coins/{id}/history` (usado no form de cripto) | Não | 5 min (atual) |
| Banco Central — séries de juros | `https://api.bcb.gov.br/dados/serie` | SELIC (série 432/11), CDI (12), IPCA (433), IGP-M (189) — séries históricas | Não | 1 hora |
| Banco Central — PTAX | `https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813` | **PTAX venda** USD/BRL — referência oficial Receita Federal. Usado em IR, dividendos exterior, Inter import e form de cripto | Não | Permanente (histórico) |
| Brapi | `https://brapi.dev/api` | Cotações BR e US (BRL+USD), lista de tickers, fundamentais básicos, histórico de preços (sparkline) | Sim (`VITE_BRAPI_TOKEN`) | 5 min (cotações), 24h (lista), 1h (histórico) |
| Tesouro Direto (proxy) | `/api/tesouro` | PU dos títulos do Tesouro | Não | 1 hora |
| Google Gemini | Gemini API | Análise de relatórios RI/FII via IA | Sim (`VITE_GEMINI_API_KEY`) | Não (por demanda) |
| CVM | `https://cvm-dados.gov.br` | Fatos relevantes e comunicados de empresas listadas | Não | Sessão |
| Resend | `https://api.resend.com` | Envio de email para alertas de preço disparados | Sim (`RESEND_API_KEY`) | Não |

---

*Última atualização: maio 2026 — armazenamento USD-nativo (avgPriceUsd/currentPriceUsd),
PTAX BCB para contextos fiscais, unificação Movimentações + Importações, nova aba
Realocamento, remoção do Open Finance/OFX*
