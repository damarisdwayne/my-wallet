import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { subscribeToAllDividends } from '@/services/dividends'
import { subscribeToAssets } from '@/services/assets'
import { subscribeToTrades } from '@/services/trades'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import {
  availableYears,
  buildPositions,
  calcMonthlyRV,
  calcRealizedGains,
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
  stock_us: 'Ações EUA',
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

const BenesSection = ({
  year,
  trades,
  assets,
}: {
  year: number
  trades: Trade[]
  assets: Asset[]
}) => {
  const currentDate = `${year}-12-31`
  const priorDate = `${year - 1}-12-31`

  const current = buildPositions(trades, currentDate, assets)
  const prior = buildPositions(trades, priorDate, assets)

  const priorMap = Object.fromEntries(prior.map((p) => [p.ticker, p.totalCost]))

  const totalCurrent = current.reduce((s, p) => s + p.totalCost, 0)
  const totalPrior = prior.reduce((s, p) => s + p.totalCost, 0)

  const rows = current.map((p) => ({
    ...p,
    priorCost: priorMap[p.ticker] ?? 0,
  }))

  // also include positions held in prior year but sold in current year
  const tickers = new Set(current.map((p) => p.ticker))
  for (const p of prior) {
    if (!tickers.has(p.ticker)) {
      rows.push({ ...p, quantity: 0, avgCost: 0, totalCost: 0, priorCost: p.totalCost })
    }
  }

  rows.sort((a, b) => a.ticker.localeCompare(b.ticker))

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

/* ─── Renda Variável ── */

const RendaVariavelSection = ({
  year,
  trades,
  assets,
}: {
  year: number
  trades: Trade[]
  assets: Asset[]
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const gains = useMemo(() => calcRealizedGains(trades, year, assets), [trades, year, assets])
  const monthly = useMemo(() => calcMonthlyRV(gains, year), [gains, year])

  const totalIr = monthly.reduce((s, m) => s + m.irDue, 0)
  const totalGain = monthly.reduce((s, m) => s + m.gain, 0)
  const activeMonths = monthly.filter((m) => m.sales > 0)

  return (
    <Section
      title="Renda Variável — Mercado à Vista"
      subtitle="Ganhos e perdas em operações de compra e venda de ações, FIIs e ETFs"
      badge={
        <div className="flex gap-2">
          <AmountBadge
            label="Ganho líquido"
            value={totalGain}
            variant={totalGain >= 0 ? 'success' : 'destructive'}
          />
          <AmountBadge
            label="IR devido (DARF)"
            value={totalIr}
            variant={totalIr > 0 ? 'destructive' : 'default'}
          />
        </div>
      }
    >
      {/* monthly summary table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Mês</Th>
              <Th right>Vendas</Th>
              <Th right>Resultado</Th>
              <Th right>Prejuízo acumulado</Th>
              <Th right>Base de cálculo</Th>
              <Th right>DARF (15%)</Th>
              <Th>Status</Th>
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
                  <Td right>{hasOps ? formatCurrency(m.sales) : '—'}</Td>
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
                    {hasOps && !m.isExempt && m.netTaxable > 0
                      ? formatCurrency(m.netTaxable)
                      : hasOps
                        ? '—'
                        : '—'}
                  </Td>
                  <Td right>
                    {m.irDue > 0 ? (
                      <span className="text-destructive font-semibold">
                        {formatCurrency(m.irDue)}
                      </span>
                    ) : (
                      '—'
                    )}
                  </Td>
                  <Td>
                    {!hasOps ? null : m.isExempt ? (
                      <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full">
                        Isento &lt; 20k
                      </span>
                    ) : m.gain < 0 ? (
                      <span className="text-xs bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                        Prejuízo
                      </span>
                    ) : m.irDue > 0 ? (
                      <span className="text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full">
                        DARF
                      </span>
                    ) : (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        Zerado
                      </span>
                    )}
                  </Td>
                </tr>
              )
            })}
            {totalIr > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td className="font-semibold" colSpan={5}>
                  Total IR a recolher no ano
                </Td>
                <Td right className="font-semibold text-destructive">
                  {formatCurrency(totalIr)}
                </Td>
                <Td>{null}</Td>
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
            <div className="mt-3 overflow-x-auto border border-border rounded-md">
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
                  {gains.map((g, i) => (
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
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
        <AlertCircle size={13} className="mt-0.5 shrink-0" />
        Cálculo pelo preço médio ponderado (PME). Isenção de IR para vendas de ações ≤ R$20.000/mês
        (mercado à vista, swing trade). Day-trade e FII não possuem isenção. Prejuízo de anos
        anteriores não é considerado automaticamente.
      </p>
    </Section>
  )
}

/* ─── tabs ── */

type Tab = 'bens' | 'isentos' | 'tributavel' | 'rv'

const TABS: { id: Tab; label: string }[] = [
  { id: 'bens', label: 'Bens e Direitos' },
  { id: 'isentos', label: 'Rendimentos Isentos' },
  { id: 'tributavel', label: 'Tributação Exclusiva' },
  { id: 'rv', label: 'Renda Variável' },
]

/* ─── page ── */

export const TaxPage = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('bens')

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

  // pick best default year once data loads
  useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(years[0])
    }
  }, [years, selectedYear])

  const totalIrJcp = useMemo(
    () => calcRendimentosTributaveis(dividends, selectedYear).reduce((s, i) => s + i.ir, 0),
    [dividends, selectedYear],
  )

  const totalIsento = useMemo(
    () => calcRendimentosIsentos(dividends, selectedYear).reduce((s, i) => s + i.amount, 0),
    [dividends, selectedYear],
  )

  const gains = useMemo(
    () => calcRealizedGains(trades, selectedYear, assets),
    [trades, selectedYear, assets],
  )
  const monthlyRV = useMemo(() => calcMonthlyRV(gains, selectedYear), [gains, selectedYear])
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
            Informe para DIRPF · Ano-base {selectedYear}
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
                  selectedYear === y
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Rendimentos Isentos</p>
          <p className="text-xl font-bold text-success mt-1">{formatCurrency(totalIsento)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Dividendos + FII</p>
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
      {activeTab === 'bens' && <BenesSection year={selectedYear} trades={trades} assets={assets} />}
      {activeTab === 'isentos' && (
        <RendimentosIsentosSection year={selectedYear} dividends={dividends} />
      )}
      {activeTab === 'tributavel' && (
        <TributacaoExclusivaSection year={selectedYear} dividends={dividends} />
      )}
      {activeTab === 'rv' && (
        <RendaVariavelSection year={selectedYear} trades={trades} assets={assets} />
      )}

      <p className="text-xs text-muted-foreground text-center pb-2">
        Este relatório é gerado automaticamente a partir dos dados cadastrados. Sempre revise com
        seu contador antes de enviar a declaração.
      </p>
    </div>
  )
}
