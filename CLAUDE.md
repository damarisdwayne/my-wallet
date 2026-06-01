# CLAUDE.md

Guia para agentes trabalhando neste repositório. **my-wallet** é um PWA de carteira de investimentos (bolsa brasileira — ações, FIIs, BDRs, ETFs, Tesouro Direto, renda fixa) com controle de proventos, despesas, e cálculo de IR.

## Comandos

> **Sempre use `yarn`, nunca `npm`.** O projeto está em yarn@1.22.22 (`packageManager`).

| Tarefa | Comando |
| --- | --- |
| Dev server | `yarn dev` |
| Dev + API (Vercel functions) | `yarn dev:api` |
| Build (typecheck + bundle) | `yarn build` |
| Typecheck só | `yarn typecheck` |
| Lint | `yarn lint` / `yarn lint:fix` |
| Format | `yarn format` |

Não há suíte de testes configurada. Valide mudanças com `yarn typecheck` e `yarn lint`.

## Stack

- **React 19** + **TypeScript** + **Vite 8**, PWA via `vite-plugin-pwa`.
- **Tailwind CSS 4** + **shadcn/ui** (Radix primitives) para UI.
- **Firebase Firestore** como backend/persistência, com `persistentLocalCache` (offline-first, multi-tab).
- **Jotai** para estado global (átomos em `src/store/`).
- **react-router-dom 7** para rotas.
- **xlsx** (parse de planilhas B3/corretoras), **pdfjs-dist** (PDFs), **recharts** (gráficos).
- **@google/generative-ai** (Gemini) para análises de IA; **resend** para e-mail; **react-pluggy-connect** (Open Finance).

## Convenções de código (IMPORTANTE — seguir sempre)

- **Arrow functions sempre.** Nunca use `function` declaration. Componentes, helpers, handlers — tudo arrow.
- **shadcn/ui sempre.** Prefira componentes de `src/components/ui/` (Dialog, Card, Badge, Tooltip, etc.) a HTML cru. Se faltar um componente shadcn, adicione-o em vez de improvisar `<div>`.
- **Arquivos pequenos, um componente por arquivo.** Divida agressivamente; reutilize componentes existentes antes de criar novos.
- Comentários em código em inglês (segue o padrão do repo); termos de domínio em PT são ok.

## Estrutura

```
src/
  pages/        # uma pasta por rota (portfolio, dividends, tax, sales, expenses, dashboard, calculators, knowledge) + login.tsx
  components/   # ui/ (shadcn), layout/, chat-assistant/, gráficos compartilhados
  hooks/        # use-portfolio, use-assets, use-dashboard, use-dividends-related, etc. (lógica + Firestore)
  services/     # acesso a dados (Firestore) + parsers + APIs externas
  store/        # átomos jotai (auth, theme, prices, display-currency, privacy, portfolio-context)
  lib/          # firebase/firestore config, ir-calc, setores (fii/stock), utils
  types/        # tipos de domínio (index.ts)
  routes/       # router.tsx, app-layout, protected-route
```

Rotas (todas protegidas exceto `/login`): `/` (dashboard), `/portfolio`, `/dividends`, `/tax`, `/sales`, `/expenses`, `/calculators`, `/knowledge`.

### Coleções Firestore

`/users/{uid}/{assets|trades|dividends|imports|expenses|...}`. Services em `src/services/` encapsulam o acesso; hooks em `src/hooks/` orquestram.

## Domínio: importação B3 (LER ANTES DE MEXER)

A B3 (área do investidor) exporta **dois relatórios Excel diferentes — não confundir**:

| Relatório | Coluna-chave | O que contém | Como o parser trata |
| --- | --- | --- | --- |
| **Negociação** (extrato de negociação) | `Código de Negociação` | Compras/vendas de ações, FIIs, BDRs, ETFs | Processa **trades de compra/venda** → atualiza posição e PM |
| **Movimentação** | `Produto` (sem `Código de Negociação`) | Proventos (dividendo/JCP/rendimento), eventos corporativos, Tesouro Direto | Processa **apenas proventos + Tesouro Direto**. Eventos corporativos (desdobro/bonificação/grupamento) são **ignorados de propósito** |

A detecção do formato é feita em [b3-import.ts](src/services/b3-import.ts) por `findCols` → flag `tickerFromProduct` (`true` = Movimentação, `false` = Negociação). Lógica central:

- `applyRow` roteia cada linha conforme o formato.
- **Movimentação** (`applyMovimentacao`): só dividendos e Tesouro Direto. Eventos corporativos são pulados porque o relatório de **Negociação já reflete a posição pós-evento** — processá-los aqui causaria contagem dupla. Eventos corporativos devem ser lançados manualmente pelo formulário de trade.
- **Negociação** (`applyPosition`): compra/venda + eventos corporativos (bonificação, desdobro, grupamento) com ajuste de PM.
- Linhas são ordenadas cronologicamente; no mesmo dia, compras antes de vendas.

### Deduplicação no preview

A B3 só exporta janelas de ~30 dias deslocadas, então sobreposição entre meses é inevitável e re-importar duplicaria operações. O extrato **não traz identificador único** por operação, então a detecção usa uma **assinatura `ticker + data + tipo + valor`** ([b3-import.ts](src/services/b3-import.ts) → `tradeSignature` / `dividendSignature`):

- **Valor**: prefere o valor em **USD** quando existe (`totalUsd`/`amountUsd`), pois é independente de câmbio — uma re-importação não escapa só porque a PTAX variou centavos. Cai para BRL nos ativos nacionais.
- **Datas diferentes nunca colidem** — é o discriminante mais forte.
- O dialog assina contra o que já está salvo (`subscribeToTrades` + `subscribeToAllDividends`) e marca cada operação repetida como duplicata.

Comportamento no modal: duplicatas vêm **desmarcadas por padrão** (cor de aviso + tooltip + `⚠ dup`), então confirmar sem revisar nunca duplica. O usuário pode marcar/desmarcar qualquer item.

Notas de persistência (importante ao mexer):
- **Dividendos** são idempotentes: `addDividends` usa `setDoc` com id `ticker-paymentDate-type` ([dividends.ts](src/services/dividends.ts)) → re-importar sobrescreve, não duplica. (A dedup do preview é, para eles, mais auditoria do que correção.)
- **Trades** usam `addDoc` → re-importar **cria duplicata**. Aqui a dedup é a correção de verdade.
- Quando o usuário exclui operações, a **posição/PM é recalculada a partir só dos trades mantidos** via `aggregateTradesToAssets` (replay das operações), senão a quantidade contaria em dobro.
- **Reverter importação** (`revertImport` em [use-portfolio.ts](src/hooks/use-portfolio.ts)) restaura as posições **e apaga os trades daquela importação** (casados por `importId`), senão eles ficariam órfãos e seriam marcados como duplicata num re-import. Para trades órfãos de reverts antigos (anteriores a essa correção), há `cleanupOrphanTrades` + um banner na aba Importações. Dividendos **não** são apagados no revert (são idempotentes por id determinístico).
- Posição zerada por venda: `positionsToAssets` mantém saldo líquido **negativo** (só descarta o líquido exatamente zero) para que `importFromB3` reduza/exclua a posição existente — vender tudo agora zera o ativo.

### Modal de importação

[broker-import-dialog/index.tsx](src/pages/portfolio/components/dialog/broker-import-dialog/index.tsx) — multi-corretora (B3, Inter). Largura `sm:max-w-4xl`. Fluxo: corretora → arquivo → preview com seleção por operação (`TradesPreview` para trades+proventos; `ExtratoPreview` para rendimentos internacionais da Inter) → confirmar. A seleção fica em `overrides` no dialog; `ImportCheckbox` é o toggle reutilizado nos dois previews. No confirm: importa só os itens marcados e recalcula os assets. `onImport(assets, trades, dividends, filename, source)`.

## Gastos — importação OFX

Aba `/expenses`. Além de lançamento manual/fixo/parcelado, importa extrato bancário **OFX** ([ofx-import.ts](src/services/ofx-import.ts) → `parseOFX`, tenta XML e cai pra SGML; auto-categoriza por palavra-chave). Open Finance/Pluggy foi **removido** (commit `b34e2cc`) e não deve voltar — só OFX.

Dedup por **FITID** (id único da transação no OFX):
- Persistência idempotente: `addOfxExpenses` ([expenses.ts](src/services/expenses.ts)) usa `setDoc` com id `ofx-<fitId sanitizado>` → re-importar extrato sobreposto **sobrescreve, não duplica**. Os gastos importados ficam com `source: 'bank'` e guardam `fitId`.
- No modal ([ofx-import-dialog.tsx](src/pages/expenses/components/dialog/ofx-import-dialog.tsx)): linhas cujo FITID já existe vêm **desmarcadas** com aviso `⚠ dup`. Mesma lógica de "não duplica se confirmar sem revisar" da importação B3.

## IR / cálculo fiscal

`src/lib/ir-calc.ts` faz o cálculo de imposto de renda (PM fiscal, ganho de capital, isenções). Página `/tax`. Tesouro/renda fixa têm tratamento próprio.
