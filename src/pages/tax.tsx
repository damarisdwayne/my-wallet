import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { subscribeToAllDividends } from '@/services/dividends'
import { subscribeToAssets } from '@/services/assets'
import { subscribeToTrades } from '@/services/trades'
import { fetchTickerSets, fetchUsdBrlRate } from '@/services/quotes'
import type { TickerSets } from '@/services/quotes'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import {
  availableYears,
  buildPositions,
  calcMonthlyRV,
  calcRealizedGains,
  calcRendimentosExterior,
  calcRendimentosIsentos,
  calcRendimentosTributaveis,
} from '@/lib/ir-calc'
import type { Asset, Dividend, Trade } from '@/types'

/* ─── small helpers ── */

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-')
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ]
  return `${months[Number(m) - 1]}/${y}`
}

const assetTypeLabel: Record<string, string> = {
  stock: 'Ações',
  fii: 'FII',
  etf: 'ETF',
  bdr: 'BDR',
  fixed_income: 'Renda Fixa',
  crypto: 'Cripto',
  stock_us: 'Exterior',
  other: 'Outros',
}

/* ─── section wrapper ── */

const Section = ({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  badge?: React.ReactNode
}) => (
  <div className="rounded-lg border border-border bg-card">
    <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border">
      <div>
        <h2 className="font-semibold text-foreground text-sm">{title}</h2>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {badge}
    </div>
    <div className="p-5">{children}</div>
  </div>
)

/* ─── table helpers ── */

const Th = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th
    className={`py-2 px-3 text-xs font-medium text-muted-foreground border-b border-border ${right ? 'text-right' : 'text-left'}`}
  >
    {children}
  </th>
)

const Td = ({
  children,
  right,
  className = '',
  colSpan,
}: {
  children?: React.ReactNode
  right?: boolean
  className?: string
  colSpan?: number
}) => (
  <td
    colSpan={colSpan}
    className={`py-2.5 px-3 text-sm ${right ? 'text-right' : 'text-left'} ${className}`}
  >
    {children}
  </td>
)

const EmptyRow = ({ cols, message }: { cols: number; message: string }) => (
  <tr>
    <td colSpan={cols} className="py-8 text-center text-sm text-muted-foreground">
      {message}
    </td>
  </tr>
)

/* ─── summary badge ── */

const AmountBadge = ({
  label,
  value,
  variant = 'default',
}: {
  label: string
  value: number
  variant?: 'default' | 'success' | 'destructive' | 'warning'
}) => {
  const colors = {
    default: 'bg-muted text-foreground',
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
  }
  return (
    <div className={`rounded-md px-3 py-1.5 text-right ${colors[variant]}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold text-sm">{formatCurrency(value)}</p>
    </div>
  )
}

/* ─── Bens e Direitos ── */

const TypeFilterChips = ({
  types,
  active,
  onChange,
}: {
  types: string[]
  active: string | null
  onChange: (t: string | null) => void
}) => (
  <div className="flex flex-wrap gap-1.5 mb-4">
    <button
      onClick={() => onChange(null)}
      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${active === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
    >
      Todos
    </button>
    {types.map((t) => (
      <button
        key={t}
        onClick={() => onChange(active === t ? null : t)}
        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${active === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
      >
        {assetTypeLabel[t] ?? t}
      </button>
    ))}
  </div>
)

const BenesSection = ({
  year,
  trades,
  assets,
  sets,
}: {
  year: number
  trades: Trade[]
  assets: Asset[]
  sets?: TickerSets
}) => {
  const [filterType, setFilterType] = useState<string | null>(null)

  const currentDate = `${year}-12-31`
  const priorDate = `${year - 1}-12-31`

  const current = buildPositions(trades, currentDate, assets, sets)
  const prior = buildPositions(trades, priorDate, assets, sets)

  const priorMap = Object.fromEntries(prior.map((p) => [p.ticker, p.totalCost]))

  const allRows = current.map((p) => ({ ...p, priorCost: priorMap[p.ticker] ?? 0 }))

  const tickers = new Set(current.map((p) => p.ticker))
  for (const p of prior) {
    if (!tickers.has(p.ticker)) {
      allRows.push({ ...p, quantity: 0, avgCost: 0, totalCost: 0, priorCost: p.totalCost })
    }
  }
  allRows.sort((a, b) => a.ticker.localeCompare(b.ticker))

  const availableTypes = [...new Set(allRows.map((r) => r.assetType))].sort()
  const rows = filterType ? allRows.filter((r) => r.assetType === filterType) : allRows

  const totalCurrent = rows.reduce((s, r) => s + r.totalCost, 0)
  const totalPrior = rows.reduce((s, r) => s + r.priorCost, 0)

  return (
    <Section
      title="Bens e Direitos"
      subtitle={`Posição em 31/12/${year}`}
      badge={
        <div className="flex gap-2">
          <AmountBadge label={`31/12/${year - 1}`} value={totalPrior} />
          <AmountBadge label={`31/12/${year}`} value={totalCurrent} variant="success" />
        </div>
      }
    >
      {availableTypes.length > 1 && (
        <TypeFilterChips types={availableTypes} active={filterType} onChange={setFilterType} />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Grupo/Código</Th>
              <Th>Ticker</Th>
              <Th>Tipo</Th>
              <Th>Descrição</Th>
              <Th right>Qtd.</Th>
              <Th right>PM Custo</Th>
              <Th right>{`31/12/${year - 1}`}</Th>
              <Th right>{`31/12/${year}`}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <EmptyRow cols={8} message="Nenhuma posição encontrada para o ano selecionado." />
            ) : (
              rows.map((r) => (
                <tr key={r.ticker} className="border-t border-border/50 hover:bg-muted/20">
                  <Td className="text-muted-foreground">
                    {r.dirpfGroup}/{r.dirpfCode}
                  </Td>
                  <Td className="font-semibold text-foreground">{r.ticker}</Td>
                  <Td>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {assetTypeLabel[r.assetType] ?? r.assetType}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground max-w-[200px] truncate">{r.assetName}</Td>
                  <Td right>
                    {r.quantity > 0 ? r.quantity.toFixed(r.quantity % 1 === 0 ? 0 : 6) : '—'}
                  </Td>
                  <Td right className="text-muted-foreground">
                    {r.avgCost > 0 ? formatCurrency(r.avgCost) : '—'}
                  </Td>
                  <Td right>{r.priorCost > 0 ? formatCurrency(r.priorCost) : '—'}</Td>
                  <Td
                    right
                    className={
                      r.totalCost > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }
                  >
                    {r.totalCost > 0 ? formatCurrency(r.totalCost) : '—'}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
        <AlertCircle size={13} className="mt-0.5 shrink-0" />O custo é calculado pelo preço médio
        ponderado das compras registradas. Bonificações recebidas são incluídas na quantidade sem
        acréscimo ao custo.
      </p>
    </Section>
  )
}

/* ─── Rendimentos Isentos ── */

const RendimentosIsentosSection = ({
  year,
  dividends,
}: {
  year: number
  dividends: Dividend[]
}) => {
  const items = calcRendimentosIsentos(dividends, year)
  const total = items.reduce((s, i) => s + i.amount, 0)

  return (
    <Section
      title="Rendimentos Isentos e Não Tributáveis"
      subtitle="Ficha de Rendimentos Isentos — DIRPF"
      badge={<AmountBadge label="Total isento" value={total} variant="success" />}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Cód.</Th>
              <Th>Tipo</Th>
              <Th>Ticker / Fonte</Th>
              <Th right>Valor</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow cols={4} message="Nenhum rendimento isento no ano selecionado." />
            ) : (
              items.map((item, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                  <Td>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-mono font-semibold">
                      {item.code}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{item.type}</Td>
                  <Td className="font-semibold text-foreground">{item.ticker}</Td>
                  <Td right className="text-success font-medium">
                    {formatCurrency(item.amount)}
                  </Td>
                </tr>
              ))
            )}
            {items.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td colSpan={3} className="font-semibold">
                  Total
                </Td>
                <Td right className="font-semibold text-success">
                  {formatCurrency(total)}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

/* ─── Tributação Exclusiva ── */

const TributacaoExclusivaSection = ({
  year,
  dividends,
}: {
  year: number
  dividends: Dividend[]
}) => {
  const items = calcRendimentosTributaveis(dividends, year)
  const totalGross = items.reduce((s, i) => s + i.gross, 0)
  const totalIr = items.reduce((s, i) => s + i.ir, 0)

  return (
    <Section
      title="Rendimentos Sujeitos à Tributação Exclusiva/Definitiva"
      subtitle="JCP e outros — alíquota 15%"
      badge={
        <div className="flex gap-2">
          <AmountBadge label="IR retido" value={totalIr} variant="destructive" />
          <AmountBadge label="Bruto" value={totalGross} />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Cód.</Th>
              <Th>Tipo</Th>
              <Th>Ticker / Fonte</Th>
              <Th right>Bruto</Th>
              <Th right>IR Retido (15%)</Th>
              <Th right>Líquido</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow
                cols={6}
                message="Nenhum rendimento com tributação exclusiva no ano selecionado."
              />
            ) : (
              items.map((item, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                  <Td>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-mono font-semibold">
                      {item.code}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{item.type}</Td>
                  <Td className="font-semibold text-foreground">{item.ticker}</Td>
                  <Td right>{formatCurrency(item.gross)}</Td>
                  <Td right className="text-destructive">
                    {formatCurrency(item.ir)}
                  </Td>
                  <Td right className="font-medium">
                    {formatCurrency(item.net)}
                  </Td>
                </tr>
              ))
            )}
            {items.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td colSpan={3} className="font-semibold">
                  Total
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross)}
                </Td>
                <Td right className="font-semibold text-destructive">
                  {formatCurrency(totalIr)}
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross - totalIr)}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

/* ─── Rendimentos do Exterior ── */

const RendimentosExteriorSection = ({
  year,
  dividends,
  usdRate,
}: {
  year: number
  dividends: Dividend[]
  usdRate: number
}) => {
  const items = calcRendimentosExterior(dividends, year, usdRate)
  const totalGross = items.reduce((s, i) => s + i.gross, 0)
  const totalIr = items.reduce((s, i) => s + i.ir, 0)

  return (
    <Section
      title="Rendimentos do Exterior"
      subtitle="Dividendos de ETFs e ações estrangeiras — tributação pela tabela progressiva"
      badge={
        <div className="flex gap-2">
          <AmountBadge label="IR retido (fonte)" value={totalIr} variant="destructive" />
          <AmountBadge label="Total bruto" value={totalGross} />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Ticker</Th>
              <Th>Tipo</Th>
              <Th right>Bruto (BRL)</Th>
              <Th right>IR Retido</Th>
              <Th right>Líquido</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow cols={5} message="Nenhum dividendo do exterior no ano selecionado." />
            ) : (
              items.map((item) => (
                <tr key={item.ticker} className="border-t border-border/50 hover:bg-muted/20">
                  <Td className="font-semibold text-foreground">{item.ticker}</Td>
                  <Td className="text-muted-foreground">{item.type}</Td>
                  <Td right>{formatCurrency(item.gross)}</Td>
                  <Td right className="text-destructive">
                    {item.ir > 0 ? formatCurrency(item.ir) : '—'}
                  </Td>
                  <Td right className="font-medium">
                    {formatCurrency(item.net)}
                  </Td>
                </tr>
              ))
            )}
            {items.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td colSpan={2} className="font-semibold">
                  Total
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross)}
                </Td>
                <Td right className="font-semibold text-destructive">
                  {totalIr > 0 ? formatCurrency(totalIr) : '—'}
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross - totalIr)}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
        <AlertCircle size={13} className="mt-0.5 shrink-0" />
        Valores convertidos para BRL na data do recebimento. O IR retido no exterior pode ser
        compensado na declaração — verifique com seu contador.
      </p>
    </Section>
  )
}

/* ─── Renda Variável + DARF ── */

const darfDeadline = (month: string) => {
  const [y, m] = month.split('-').map(Number)
  const next = new Date(y, m, 0)
  next.setMonth(next.getMonth() + 1)
  while (next.getDay() === 0 || next.getDay() === 6) next.setDate(next.getDate() - 1)
  return next.toLocaleDateString('pt-BR')
}

const RendaVariavelSection = ({
  year,
  trades,
  assets,
  sets,
}: {
  year: number
  trades: Trade[]
  assets: Asset[]
  sets?: TickerSets
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)
  const gains = useMemo(
    () => calcRealizedGains(trades, year, assets, sets),
    [trades, year, assets, sets],
  )
  const monthly = useMemo(() => calcMonthlyRV(gains, year), [gains, year])
  const availableGainTypes = useMemo(
    () => [...new Set(gains.map((g) => g.assetType))].sort(),
    [gains],
  )
  const filteredGains = useMemo(
    () => (filterType ? gains.filter((g) => g.assetType === filterType) : gains),
    [gains, filterType],
  )

  const totalDarf = monthly.reduce((s, m) => s + m.irDue, 0)
  const totalGain = monthly.reduce((s, m) => s + m.gain, 0)
  const activeMonths = monthly.filter((m) => m.sales > 0)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const isCurrentYear = year === new Date().getFullYear()
  const currentData = monthly.find((m) => m.month === currentMonth)
  const pendingDarf = isCurrentYear
    ? monthly.filter((m) => m.month <= currentMonth && m.irDue > 0).reduce((s, m) => s + m.irDue, 0)
    : 0

  return (
    <div className="space-y-4">
      {/* summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ganho líquido</p>
          <p
            className={`text-xl font-bold mt-1 ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {formatCurrency(totalGain)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeMonths.length} mês(es) com operações
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total DARF no ano</p>
          <p
            className={`text-xl font-bold mt-1 ${totalDarf > 0 ? 'text-destructive' : 'text-foreground'}`}
          >
            {formatCurrency(totalDarf)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Cód. 6015</p>
        </div>
        {isCurrentYear && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">DARF pendente</p>
            <p
              className={`text-xl font-bold mt-1 ${pendingDarf > 0 ? 'text-destructive' : 'text-foreground'}`}
            >
              {formatCurrency(pendingDarf)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pendingDarf > 0 ? 'Verifique os meses abaixo' : 'Nada em aberto'}
            </p>
          </div>
        )}
        {isCurrentYear && currentData && currentData.sales > 0 && (
          <div
            className={`rounded-lg border p-4 ${
              currentData.irDue > 0
                ? 'border-yellow-500/40 bg-yellow-500/5'
                : 'border-border bg-card'
            }`}
          >
            <p className="text-xs text-muted-foreground">Mês atual — {monthLabel(currentMonth)}</p>
            <p
              className={`text-xl font-bold mt-1 ${
                currentData.irDue > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-success'
              }`}
            >
              {currentData.irDue > 0 ? formatCurrency(currentData.irDue) : 'Isento'}
            </p>
            {currentData.irDue > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Vence {darfDeadline(currentMonth)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* monthly table */}
      <Section
        title="Detalhamento mensal"
        subtitle="Ações (15%, isento ≤ R$20k) · FII (20%, sem isenção)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <Th>Mês</Th>
                <Th right>Vendas ações</Th>
                <Th right>Vendas FII</Th>
                <Th right>Resultado</Th>
                <Th right>Prej. acumulado</Th>
                <Th right>DARF ações</Th>
                <Th right>DARF FII</Th>
                <Th right>Total DARF</Th>
                <Th>Status</Th>
                <Th>Vencimento</Th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => {
                const hasOps = m.sales > 0
                return (
                  <tr
                    key={m.month}
                    className={`border-t border-border/50 ${hasOps ? 'hover:bg-muted/20' : 'opacity-40'}`}
                  >
                    <Td className="font-medium">{monthLabel(m.month)}</Td>
                    <Td right>{m.stockSales > 0 ? formatCurrency(m.stockSales) : '—'}</Td>
                    <Td right>{m.fiiSales > 0 ? formatCurrency(m.fiiSales) : '—'}</Td>
                    <Td right>
                      {hasOps ? (
                        <span className={m.gain >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatCurrency(m.gain)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td right className="text-muted-foreground">
                      {m.lossCarryoverIn > 0 ? formatCurrency(-m.lossCarryoverIn) : '—'}
                    </Td>
                    <Td right>
                      {m.irDueStock > 0 ? (
                        <span className="text-destructive font-medium">
                          {formatCurrency(m.irDueStock)}
                        </span>
                      ) : m.stockSales > 0 && m.stockIsExempt ? (
                        <span className="text-success text-xs">Isento</span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td right>
                      {m.irDueFii > 0 ? (
                        <span className="text-destructive font-medium">
                          {formatCurrency(m.irDueFii)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td right>
                      {m.irDue > 0 ? (
                        <span className="text-destructive font-bold">
                          {formatCurrency(m.irDue)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td>
                      {!hasOps ? null : m.irDue > 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          DARF
                        </span>
                      ) : m.stockIsExempt && m.fiiSales === 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                          Isento
                        </span>
                      ) : m.gain < 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          Prejuízo
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Zerado
                        </span>
                      )}
                    </Td>
                    <Td>
                      {m.irDue > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {darfDeadline(m.month)}
                        </span>
                      ) : null}
                    </Td>
                  </tr>
                )
              })}
              {totalDarf > 0 && (
                <tr className="border-t-2 border-border bg-muted/30">
                  <Td className="font-semibold" colSpan={7}>
                    Total DARF no ano
                  </Td>
                  <Td right className="font-semibold text-destructive">
                    {formatCurrency(totalDarf)}
                  </Td>
                  <Td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* operations detail toggle */}
        {activeMonths.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? 'Ocultar' : 'Ver'} detalhamento por operação ({gains.length} vendas)
            </button>
            {showDetails && (
              <div className="mt-3">
                {availableGainTypes.length > 1 && (
                  <TypeFilterChips
                    types={availableGainTypes}
                    active={filterType}
                    onChange={setFilterType}
                  />
                )}
                <div className="overflow-x-auto border border-border rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <Th>Data</Th>
                        <Th>Ticker</Th>
                        <Th>Tipo</Th>
                        <Th right>Qtd.</Th>
                        <Th right>PM Custo</Th>
                        <Th right>Preço Venda</Th>
                        <Th right>Custo Total</Th>
                        <Th right>Receita</Th>
                        <Th right>Resultado</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGains.map((g, i) => (
                        <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                          <Td className="text-muted-foreground">{g.date}</Td>
                          <Td className="font-semibold text-foreground">{g.ticker}</Td>
                          <Td>
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                              {assetTypeLabel[g.assetType] ?? g.assetType}
                            </span>
                          </Td>
                          <Td right>{g.quantity}</Td>
                          <Td right className="text-muted-foreground">
                            {formatCurrency(g.avgCost)}
                          </Td>
                          <Td right>{formatCurrency(g.sellPrice)}</Td>
                          <Td right className="text-muted-foreground">
                            {formatCurrency(g.costTotal)}
                          </Td>
                          <Td right>{formatCurrency(g.sellTotal)}</Td>
                          <Td right>
                            <span
                              className={
                                g.gain >= 0
                                  ? 'text-success font-medium'
                                  : 'text-destructive font-medium'
                              }
                            >
                              {formatCurrency(g.gain)}
                            </span>
                          </Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          Cálculo pelo preço médio ponderado (PME). Day-trade e FII não possuem isenção. Prejuízo de
          anos anteriores não é considerado automaticamente.
        </p>
      </Section>

      {/* how to pay */}
      <Section title="Como pagar o DARF">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {(
              [
                {
                  n: '1',
                  title: 'Acesse o Sicalc Web',
                  body: (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Site da Receita Federal para emissão de DARF.{' '}
                      <a
                        href="https://sicalc.receita.fazenda.gov.br/sicalc/rapido/contribuinte"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        Abrir Sicalc
                      </a>
                    </p>
                  ),
                },
                {
                  n: '2',
                  title: 'Informe o código',
                  body: (
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-1 rounded font-mono font-bold">
                        6015
                      </span>
                      <span className="text-xs text-muted-foreground self-center">
                        Ganhos líquidos em bolsa (ações, FII, ETF)
                      </span>
                    </div>
                  ),
                },
                {
                  n: '3',
                  title: 'Período de apuração',
                  body: (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mês em que ocorreu a venda (ex: 01/04/2026 para vendas de abril).
                    </p>
                  ),
                },
                {
                  n: '4',
                  title: 'Vencimento',
                  body: (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Último dia útil do mês seguinte à venda. Atraso gera juros Selic + multa de
                      0,33%/dia.
                    </p>
                  ),
                },
              ] as const
            ).map(({ n, title, body }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {n}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {body}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="rounded-md bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground">Regras resumidas</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Ações BR: </span>
                  15% sobre o lucro. Isento se vendas totais ≤ R$20.000 no mês.
                </p>
                <p>
                  <span className="font-medium text-foreground">FII: </span>
                  20% sobre o lucro. Sem isenção, independente do valor vendido.
                </p>
                <p>
                  <span className="font-medium text-foreground">ETF BR: </span>
                  15% sobre o lucro. Sem isenção de R$20k.
                </p>
                <p>
                  <span className="font-medium text-foreground">Prejuízo: </span>
                  Pode ser compensado nos meses seguintes do mesmo ano.
                </p>
                <p>
                  <span className="font-medium text-foreground">Day trade: </span>
                  20% e sem isenção — não calculado aqui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}

/* ─── Guia de IR ── */

const InfoCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-card p-5 space-y-3">
    <h3 className="font-semibold text-foreground text-sm">{title}</h3>
    <div className="space-y-2 text-sm text-muted-foreground">{children}</div>
  </div>
)

const Tag = ({
  children,
  color = 'default',
}: {
  children: React.ReactNode
  color?: 'success' | 'destructive' | 'warning' | 'default'
}) => {
  const colors = {
    success: 'bg-success/10 text-success',
    destructive: 'bg-destructive/10 text-destructive',
    warning: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    default: 'bg-muted text-foreground',
  }
  return (
    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${colors[color]}`}>
      {children}
    </span>
  )
}

const Row = ({
  label,
  value,
  tag,
  className = '',
}: {
  label: string
  value: string
  tag?: React.ReactNode
  className?: string
}) => (
  <div
    className={`flex items-start justify-between gap-4 py-2 border-b border-border/50 ${className}`}
  >
    <span className="text-sm text-muted-foreground">{label}</span>
    <div className="flex items-center gap-2 text-right">
      {tag}
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  </div>
)

const GuiaSection = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Renda Variável */}
      <InfoCard title="Renda Variável">
        <Row
          label="Ações — vendas ≤ R$20k/mês"
          value="Isento"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="Ações — vendas > R$20k/mês"
          value="15% sobre o lucro"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="Day trade (ações)"
          value="20% sobre o lucro"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="FIIs — qualquer venda com lucro"
          value="20% — sem isenção"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="FIIs — rendimentos mensais"
          value="Isento para PF"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="ETFs BR"
          value="15% — sem isenção de R$20k"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <p className="text-xs pt-1">
          Pagamento via <span className="font-medium text-foreground">DARF</span> até o último dia
          útil do mês seguinte à venda. Prejuízo pode ser compensado nos meses seguintes.
        </p>
      </InfoCard>

      {/* Renda Fixa */}
      <InfoCard title="Renda Fixa">
        <Row label="LCI / LCA" value="Isento para PF" tag={<Tag color="success">Isento</Tag>} />
        <Row label="CDB — até 6 meses" value="22,5%" tag={<Tag color="destructive">Fonte</Tag>} />
        <Row label="CDB — 6 a 12 meses" value="20%" tag={<Tag color="destructive">Fonte</Tag>} />
        <Row label="CDB — 12 a 24 meses" value="17,5%" tag={<Tag color="destructive">Fonte</Tag>} />
        <Row
          label="CDB — acima de 24 meses"
          value="15%"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <Row
          label="Tesouro Direto"
          value="Mesmo regime do CDB"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <p className="text-xs pt-1">
          IR retido <span className="font-medium text-foreground">automaticamente na fonte</span>{' '}
          pelo banco/corretora. Não exige DARF ou lançamento manual.
        </p>
      </InfoCard>

      {/* Exterior */}
      <InfoCard title="Ativos do Exterior">
        <Row
          label="BDRs — vendas ≤ R$20k/mês"
          value="Isento"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="BDRs — vendas > R$20k/mês"
          value="15% sobre o lucro"
          tag={<Tag color="destructive">DARF</Tag>}
        />
        <Row
          label="Ações/ETFs EUA — ganho de capital"
          value="15% flat — declaração anual"
          tag={<Tag color="destructive">Anual</Tag>}
        />
        <Row
          label="Dividendos do exterior"
          value="15% flat — declaração anual"
          tag={<Tag color="destructive">Anual</Tag>}
        />
        <p className="text-xs pt-1">
          Desde a <span className="font-medium text-foreground">Lei 14.754/2023</span> (em vigor
          desde 01/01/2024), dividendos e ganhos do exterior são tributados à alíquota{' '}
          <span className="font-medium text-foreground">flat de 15%</span>, declarados{' '}
          <span className="font-medium text-foreground">uma vez por ano</span> na DAA — sem mais
          carnê-leão mensal. O IR retido no exterior (ex: 30% de withholding tax dos EUA) pode ser
          compensado, e como 30% &gt; 15%, na prática quem investe em ações/ETFs americanos{' '}
          <span className="font-medium text-foreground">não deve IR adicional ao Brasil</span>.
        </p>
      </InfoCard>

      {/* JCP */}
      <InfoCard title="JCP — Juros sobre Capital Próprio">
        <p>
          Forma de distribuição de lucros usada por empresas brasileiras (especialmente bancos).
          Diferente dos dividendos, o JCP é{' '}
          <span className="font-medium text-foreground">
            dedutível do lucro tributável da empresa
          </span>
          , o que reduz o IRPJ/CSLL dela — mas quem paga o imposto é o acionista.
        </p>
        <Row
          label="IR retido na fonte"
          value="15% sobre o valor bruto"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <p className="text-xs">
          Você recebe o valor já descontado. Não exige DARF ou ação adicional — mas deve ser
          declarado na ficha de{' '}
          <span className="font-medium text-foreground">
            Rendimentos Sujeitos à Tributação Exclusiva
          </span>
          .
        </p>
      </InfoCard>

      {/* Dividendos BR — Lei 15.270/2025 */}
      <InfoCard title="Dividendos de Empresas BR — novidade 2026">
        <p>
          A <span className="font-medium text-foreground">Lei 15.270/2025</span> (vigente desde
          01/01/2026) reintroduziu a tributação de dividendos pagos por empresas brasileiras.
        </p>
        <Row
          label="Dividendos ≤ R$50.000/mês"
          value="Isento"
          tag={<Tag color="success">Isento</Tag>}
        />
        <Row
          label="Dividendos > R$50.000/mês"
          value="10% IRRF sobre o excedente"
          tag={<Tag color="destructive">Fonte</Tag>}
        />
        <p className="text-xs pt-1">
          Para a maioria dos investidores pessoa física com carteira de ações e FIIs, o limite de
          R$50k/mês é muito acima do recebido — na prática os dividendos continuam{' '}
          <span className="font-medium text-foreground">isentos</span>. Lucros apurados até
          31/12/2025 e formalizados até essa data seguem a regra antiga (isenção total) mesmo que
          pagos após 2026.
        </p>
      </InfoCard>

      {/* Carnê-leão */}
      <InfoCard title="Carnê-leão — o que é e quando usar">
        <p>
          Sistema da Receita Federal para recolher IR sobre rendimentos que{' '}
          <span className="font-medium text-foreground">não têm retenção automática na fonte</span>.
          O nome vem da ideia de que o Leão vai "comer" direto de você, sem intermediário.{' '}
          <span className="font-medium text-foreground">
            Desde 2024, dividendos do exterior não usam mais o carnê-leão
          </span>{' '}
          — passaram para declaração anual pela Lei 14.754/2023.
        </p>
        <div className="pt-1">
          <Row
            label="Aluguéis recebidos"
            value="Obrigatório"
            tag={<Tag color="warning">Mensal</Tag>}
          />
          <Row
            label="Freelancer (PF para PF)"
            value="Obrigatório"
            tag={<Tag color="warning">Mensal</Tag>}
          />
          <Row
            label="Pensão alimentícia"
            value="Obrigatório"
            tag={<Tag color="warning">Mensal</Tag>}
          />
        </div>
        <div className="bg-muted/50 rounded-md p-3 mt-2 space-y-1">
          <p className="text-xs font-medium text-foreground">Tabela progressiva 2025</p>
          <div className="grid grid-cols-2 gap-x-6 text-xs">
            <span>Até R$2.259/mês</span>
            <span className="text-success font-medium">Isento</span>
            <span>R$2.259 – R$2.826</span>
            <span className="font-medium">7,5%</span>
            <span>R$2.826 – R$3.751</span>
            <span className="font-medium">15%</span>
            <span>R$3.751 – R$4.664</span>
            <span className="font-medium">22,5%</span>
            <span>Acima de R$4.664</span>
            <span className="font-medium">27,5%</span>
          </div>
        </div>
        <p className="text-xs">
          Acesse o{' '}
          <a
            href="https://www3.cav.receita.fazenda.gov.br/carneleao/demonstrativo"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            Carnê-leão Web
          </a>{' '}
          no site da Receita, lance os rendimentos do mês, gere e pague o DARF até o último dia útil
          do mês seguinte. No fim do ano, os lançamentos são importados automaticamente para a
          declaração anual.
        </p>
      </InfoCard>
    </div>

    {/* Não declarar */}
    <InfoCard title="O que acontece se não declarar?">
      <div className="flex items-start gap-3 p-3 rounded-md bg-destructive/10 border border-destructive/20">
        <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
        <div className="space-y-1.5 text-sm">
          <p>
            <span className="font-medium text-foreground">Multa de 75% a 150%</span> sobre o imposto
            devido, mais juros Selic.
          </p>
          <p>
            <span className="font-medium text-foreground">Sonegação fiscal</span> em casos graves —
            crime com pena de 2 a 5 anos de reclusão.
          </p>
          <p>
            A Receita{' '}
            <span className="font-medium text-foreground">cruza dados automaticamente</span> com B3,
            bancos e corretoras — a chance de ser identificado é alta.
          </p>
        </div>
      </div>
    </InfoCard>
  </div>
)

/* ─── tabs ── */

type Tab = 'bens' | 'isentos' | 'tributavel' | 'exterior' | 'rv' | 'guia'

const TABS: { id: Tab; label: string }[] = [
  { id: 'bens', label: 'Bens e Direitos' },
  { id: 'isentos', label: 'Rendimentos Isentos' },
  { id: 'tributavel', label: 'Tributação Exclusiva' },
  { id: 'exterior', label: 'Rendimentos do Exterior' },
  { id: 'rv', label: 'Renda Variável' },
  { id: 'guia', label: 'Guia IR' },
]

/* ─── page ── */

export const TaxPage = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('bens')
  const [usdRate, setUsdRate] = useState(0)
  const [tickerSets, setTickerSets] = useState<TickerSets | undefined>()

  useEffect(() => {
    fetchUsdBrlRate()
      .then(setUsdRate)
      .catch(() => setUsdRate(0))
    fetchTickerSets()
      .then(setTickerSets)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!user) return
    const unsubs = [
      subscribeToAssets(user.uid, setAssets),
      subscribeToTrades(user.uid, setTrades),
      subscribeToAllDividends(user.uid, setDividends),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const years = useMemo(() => availableYears(trades, dividends), [trades, dividends])
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<number>(currentYear)
  const effectiveYear = years.includes(selectedYear) ? selectedYear : (years[0] ?? currentYear)

  const totalIrJcp = useMemo(
    () => calcRendimentosTributaveis(dividends, effectiveYear).reduce((s, i) => s + i.ir, 0),
    [dividends, effectiveYear],
  )

  const totalIsento = useMemo(
    () => calcRendimentosIsentos(dividends, effectiveYear).reduce((s, i) => s + i.amount, 0),
    [dividends, effectiveYear],
  )

  const totalExterior = useMemo(
    () =>
      calcRendimentosExterior(dividends, effectiveYear, usdRate).reduce((s, i) => s + i.gross, 0),
    [dividends, effectiveYear, usdRate],
  )

  const gains = useMemo(
    () => calcRealizedGains(trades, effectiveYear, assets, tickerSets),
    [trades, effectiveYear, assets, tickerSets],
  )
  const monthlyRV = useMemo(() => calcMonthlyRV(gains, effectiveYear), [gains, effectiveYear])
  const totalDARF = useMemo(() => monthlyRV.reduce((s, m) => s + m.irDue, 0), [monthlyRV])

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <FileText size={20} />
            Imposto de Renda
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Informe para DIRPF · Ano-base {effectiveYear}
          </p>
        </div>

        {/* year selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Ano-base:</span>
          <div className="flex gap-1">
            {(years.length > 0 ? years : [currentYear]).map((y) => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  effectiveYear === y
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Rendimentos Isentos</p>
          <p className="text-xl font-bold text-success mt-1">{formatCurrency(totalIsento)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Dividendos + FII</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Rendimentos do Exterior</p>
          <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalExterior)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">ETFs e ações estrangeiras</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">IR Retido na Fonte (JCP)</p>
          <p className="text-xl font-bold text-destructive mt-1">{formatCurrency(totalIrJcp)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Já recolhido pela empresa</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">DARF Renda Variável</p>
          <p
            className={`text-xl font-bold mt-1 ${totalDARF > 0 ? 'text-destructive' : 'text-foreground'}`}
          >
            {formatCurrency(totalDARF)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">15% sobre ganhos tributáveis</p>
        </div>
      </div>

      {/* tabs */}
      <div className="border-b border-border">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* tab content */}
      {activeTab === 'bens' && (
        <BenesSection year={effectiveYear} trades={trades} assets={assets} sets={tickerSets} />
      )}
      {activeTab === 'isentos' && (
        <RendimentosIsentosSection year={effectiveYear} dividends={dividends} />
      )}
      {activeTab === 'tributavel' && (
        <TributacaoExclusivaSection year={effectiveYear} dividends={dividends} />
      )}
      {activeTab === 'exterior' && (
        <RendimentosExteriorSection year={effectiveYear} dividends={dividends} usdRate={usdRate} />
      )}
      {activeTab === 'rv' && (
        <RendaVariavelSection
          year={effectiveYear}
          trades={trades}
          assets={assets}
          sets={tickerSets}
        />
      )}
      {activeTab === 'guia' && <GuiaSection />}

      <p className="text-xs text-muted-foreground text-center pb-2">
        Este relatório é gerado automaticamente a partir dos dados cadastrados. Sempre revise com
        seu contador antes de enviar a declaração.
      </p>
    </div>
  )
}
