import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  Pencil,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type {
  Asset,
  FiiInfo,
  FundamentalRecord,
  FundamentalSnapshot,
  PricePoint,
  StockInfo,
} from '@/types'

/* ─── Shared ────────────────────────────────────────────────────── */

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  assets: Asset[]
  fundamentals: Record<string, FundamentalRecord>
  saveManualSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  fiiInfo: Record<string, FiiInfo>
  saveFiiInfo: (data: FiiInfo) => Promise<void>
  stockInfo: Record<string, StockInfo>
  saveStockInfo: (data: StockInfo) => Promise<void>
}

type TrendType = 'up-good' | 'up-bad' | 'neutral'

interface IndicatorTooltip {
  title: string
  description: string
  ideal?: string
  calc?: string
}

interface IndicatorDef {
  key: keyof FundamentalSnapshot
  label: string
  format: (v: number) => string
  trendType: TrendType
  inputStep?: string
  inputLabel?: string
  tooltip?: IndicatorTooltip
}

const directPct = (v: number) => v.toFixed(2) + '%'
const ratio = (v: number) => v.toFixed(2) + 'x'
const num1 = (v: number) => v.toFixed(1) + 'x'

const STOCK_INDICATORS: IndicatorDef[] = [
  {
    key: 'priceEarnings',
    label: 'P/L',
    format: num1,
    trendType: 'neutral',
    inputStep: '0.1',
    inputLabel: 'P/L (ex: 12.5)',
    tooltip: {
      title: 'P/L = Preço sobre o Lucro',
      description:
        'Quanto o mercado paga por cada R$ 1 de lucro líquido. P/L alto pode indicar expectativa de crescimento ou sobrevalorização.',
      ideal: 'Abaixo de 15 é considerado barato; acima de 25, caro — mas varia por setor.',
      calc: 'Preço atual ÷ lucro por ação (LPA)',
    },
  },
  {
    key: 'priceToBook',
    label: 'P/VP',
    format: ratio,
    trendType: 'neutral',
    inputStep: '0.01',
    inputLabel: 'P/VP (ex: 1.40)',
    tooltip: {
      title: 'P/VP = Preço sobre o Valor Patrimonial',
      description:
        'Compara o preço de mercado com o patrimônio líquido por ação. Abaixo de 1 pode indicar ação sendo negociada abaixo do valor contábil.',
      ideal:
        'Menor que 1,5x é geralmente razoável; abaixo de 1x pode ser oportunidade ou sinal de problema.',
      calc: 'Preço atual ÷ valor patrimonial por ação',
    },
  },
  {
    key: 'dividendYield',
    label: 'DY',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'DY em % (ex: 6)',
    tooltip: {
      title: 'DY = Dividend Yield',
      description:
        'Percentual dos dividendos pagos em relação ao preço atual da ação. Mede o retorno em dividendos do investimento.',
      ideal: 'Acima de 5% ao ano é considerado bom para ações brasileiras.',
      calc: 'Dividendos pagos nos últimos 12 meses ÷ preço atual × 100',
    },
  },
  {
    key: 'payout',
    label: 'Payout',
    format: directPct,
    trendType: 'neutral',
    inputStep: '0.1',
    inputLabel: 'Payout em % (ex: 40)',
    tooltip: {
      title: 'Payout = Taxa de Distribuição de Dividendos',
      description:
        'Percentual do lucro líquido distribuído como dividendos. Payout muito alto pode comprometer o reinvestimento no negócio.',
      ideal: 'Entre 30% e 60% é saudável. Acima de 80% pode ser insustentável a longo prazo.',
      calc: 'Dividendos pagos ÷ lucro líquido × 100',
    },
  },
  {
    key: 'profitMargins',
    label: 'Mg. Líquida',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'Margem Líquida em % (ex: 18)',
    tooltip: {
      title: 'Margem Líquida',
      description:
        'Percentual da receita que sobra como lucro após todos os custos, despesas, juros e impostos. Indica eficiência geral da empresa.',
      ideal:
        'Acima de 10% é bom; varia bastante por setor (bancos têm margens altas, varejo tem margens baixas).',
      calc: 'Lucro líquido ÷ receita líquida × 100',
    },
  },
  {
    key: 'grossMargins',
    label: 'Mg. Bruta',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'Margem Bruta em % (ex: 45)',
    tooltip: {
      title: 'Margem Bruta',
      description:
        'Percentual da receita que sobra após deduzir o custo dos produtos vendidos (CPV). Reflete o poder de precificação e eficiência produtiva.',
      ideal: 'Acima de 30% é razoável; acima de 50% indica vantagem competitiva forte.',
      calc: 'Lucro bruto ÷ receita líquida × 100',
    },
  },
  {
    key: 'ebitdaMargins',
    label: 'Mg. EBITDA',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'Margem EBITDA em % (ex: 30)',
    tooltip: {
      title: 'Margem EBITDA',
      description:
        'Percentual da receita convertido em EBITDA (lucro antes de juros, impostos, depreciação e amortização). Mede eficiência operacional pura.',
      ideal: 'Acima de 20% é considerado bom na maioria dos setores.',
      calc: 'EBITDA ÷ receita líquida × 100',
    },
  },
  {
    key: 'evToEbitda',
    label: 'EV/EBITDA',
    format: ratio,
    trendType: 'neutral',
    inputStep: '0.01',
    inputLabel: 'EV/EBITDA (ex: 8.5)',
    tooltip: {
      title: 'EV/EBITDA = Valor da Empresa sobre EBITDA',
      description:
        'Quantos anos de EBITDA seriam necessários para pagar o valor total da empresa (incluindo dívida). Útil para comparar empresas com estruturas de capital diferentes.',
      ideal: 'Abaixo de 8x é considerado barato; acima de 15x, caro — depende do setor.',
      calc: 'Valor da empresa (market cap + dívida líquida) ÷ EBITDA',
    },
  },
  {
    key: 'returnOnEquity',
    label: 'ROE',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'ROE em % (ex: 25)',
    tooltip: {
      title: 'ROE = Retorno sobre o Patrimônio Líquido',
      description:
        'Quanto a empresa gera de lucro para cada R$ 1 de patrimônio dos acionistas. Mede a eficiência no uso do capital próprio.',
      ideal: 'Acima de 15% é bom; empresas excelentes sustentam acima de 20% consistentemente.',
      calc: 'Lucro líquido ÷ patrimônio líquido × 100',
    },
  },
  {
    key: 'roic',
    label: 'ROIC',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'ROIC em % (ex: 15)',
    tooltip: {
      title: 'ROIC = Retorno sobre o Capital Investido',
      description:
        'Mede a eficiência com que a empresa utiliza todo o capital investido (próprio + terceiros) para gerar lucro operacional. É um dos melhores indicadores de qualidade do negócio.',
      ideal:
        'Acima do custo de capital (WACC); acima de 15% é excelente. Empresas com ROIC alto e consistente tendem a criar valor a longo prazo.',
      calc: 'NOPAT (lucro operacional após impostos) ÷ capital investido × 100',
    },
  },
  {
    key: 'returnOnAssets',
    label: 'ROA',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'ROA em % (ex: 10)',
    tooltip: {
      title: 'ROA = Retorno sobre os Ativos',
      description:
        'Quanto a empresa lucra em relação ao total de ativos que possui. Indica a eficiência no uso de todos os recursos (próprios e financiados).',
      ideal:
        'Acima de 5% é razoável; acima de 10% é muito bom. Bancos naturalmente têm ROA baixo (0,5–1,5%).',
      calc: 'Lucro líquido ÷ ativo total × 100',
    },
  },
  {
    key: 'debtToEquity',
    label: 'Dívida/PL',
    format: ratio,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Dívida/PL (ex: 1.60)',
    tooltip: {
      title: 'Dívida/PL = Alavancagem Financeira',
      description:
        'Relação entre a dívida total e o patrimônio líquido. Mostra o grau de alavancagem da empresa. Quanto maior, maior o risco financeiro.',
      ideal: 'Abaixo de 1x é conservador; entre 1x e 2x é aceitável; acima de 3x requer atenção.',
      calc: 'Dívida total ÷ patrimônio líquido',
    },
  },
  {
    key: 'netDebtToEbitda',
    label: 'Dív. Líq./EBITDA',
    format: ratio,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Dívida Líquida/EBITDA (ex: 2.5)',
    tooltip: {
      title: 'Dívida Líquida / EBITDA',
      description:
        'Quantos anos de geração de caixa operacional (EBITDA) a empresa precisaria para quitar sua dívida líquida. Principal métrica de endividamento usada pelo mercado.',
      ideal: 'Abaixo de 2x é saudável; entre 2x e 3x é tolerável; acima de 4x é alto risco.',
      calc: '(Dívida bruta − caixa) ÷ EBITDA',
    },
  },
  {
    key: 'revenueGrowth',
    label: 'Cresc. Receita',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'Crescimento de Receita em % (ex: 8)',
    tooltip: {
      title: 'Crescimento de Receita',
      description:
        'Variação percentual da receita líquida em relação ao mesmo período do ano anterior. Indica se a empresa está expandindo suas vendas.',
      ideal: 'Acima de 10% a.a. é bom; acima de 20% é excelente para empresas maduras.',
      calc: '(Receita atual − receita anterior) ÷ receita anterior × 100',
    },
  },
  {
    key: 'earningsGrowth',
    label: 'Cresc. Lucro',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'Crescimento de Lucro em % (ex: 12)',
    tooltip: {
      title: 'Crescimento de Lucro',
      description:
        'Variação percentual do lucro líquido em relação ao mesmo período do ano anterior. Deve crescer junto com (ou mais rápido que) a receita.',
      ideal:
        'Acima de 10% a.a. é bom; idealmente maior que o crescimento da receita (margem expandindo).',
      calc: '(Lucro atual − lucro anterior) ÷ lucro anterior × 100',
    },
  },
  {
    key: 'fcf',
    label: 'FCF',
    format: (v) => `R$ ${v.toFixed(0)} M`,
    trendType: 'up-good',
    inputStep: '1',
    inputLabel: 'FCF em R$ milhões (ex: 2300)',
    tooltip: {
      title: 'FCF = Fluxo de Caixa Livre',
      description:
        'Caixa gerado pelas operações após descontar investimentos em ativos fixos (capex). Representa o dinheiro disponível para pagar dividendos, recomprar ações ou quitar dívidas.',
      ideal: 'Deve ser positivo e crescente. FCF consistentemente negativo é sinal de alerta.',
      calc: 'Fluxo de caixa operacional − capex',
    },
  },
  {
    key: 'fcfYield',
    label: 'FCF Yield',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'FCF Yield em % (ex: 8)',
    tooltip: {
      title: 'FCF Yield = Rendimento do Fluxo de Caixa Livre',
      description:
        'Percentual do FCF em relação ao valor de mercado da empresa. Mede quanto do preço pago se converte em caixa livre para o acionista.',
      ideal: 'Acima de 5% é atrativo; acima de 8% é muito bom.',
      calc: 'FCF ÷ capitalização de mercado × 100',
    },
  },
  {
    key: 'cashConversion',
    label: 'Conv. de Caixa',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.1',
    inputLabel: 'Conversão de Caixa em % (ex: 80)',
    tooltip: {
      title: 'Conversão de Caixa',
      description:
        'Percentual do lucro líquido (ou EBITDA) que se converte em caixa livre. Alta conversão indica que os lucros reportados são reais e não apenas contábeis.',
      ideal:
        'Acima de 80% é excelente. Abaixo de 50% indica que o lucro pode não estar se materializando em caixa.',
      calc: 'FCF ÷ lucro líquido × 100 (ou FCF ÷ EBITDA × 100)',
    },
  },
  {
    key: 'pegRatio',
    label: 'PEG Ratio',
    format: ratio,
    trendType: 'neutral',
    inputStep: '0.01',
    inputLabel: 'PEG Ratio (ex: 1.5)',
    tooltip: {
      title: 'PEG Ratio = P/L ajustado pelo Crescimento',
      description:
        'Relaciona o P/L com a taxa de crescimento dos lucros. Corrige a limitação do P/L ao considerar o crescimento esperado — uma empresa com P/L alto mas crescimento alto pode ser barata.',
      ideal: 'Abaixo de 1x é considerado barato; entre 1x e 2x é justo; acima de 2x está caro.',
      calc: 'P/L ÷ taxa de crescimento anual dos lucros (%)',
    },
  },
]

const fmtDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

/* ─── Trend helpers ─────────────────────────────────────────────── */

const TrendIcon = ({ isIncrease, isGood }: { isIncrease: boolean; isGood: boolean | null }) => {
  const colorClass =
    isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'
  return isIncrease ? (
    <TrendingUp size={11} className={colorClass} />
  ) : (
    <TrendingDown size={11} className={colorClass} />
  )
}

/* ─── History dialog ────────────────────────────────────────────── */

const HistoryDialog = ({
  title,
  open,
  onOpenChange,
  children,
}: {
  title: string
  open: boolean
  onOpenChange: (v: boolean) => void
  children: React.ReactNode
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Histórico — {title}</DialogTitle>
      </DialogHeader>
      <div className="space-y-1 max-h-80 overflow-y-auto">{children}</div>
    </DialogContent>
  </Dialog>
)

/* ─── Price card ────────────────────────────────────────────────── */

const PriceCard = ({ points, currentPrice }: { points: PricePoint[]; currentPrice: number }) => {
  const [histOpen, setHistOpen] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  const allPoints = points.length > 0 ? points : [{ date: today, close: currentPrice }]
  const current = allPoints.at(-1)!
  const prev = allPoints.length >= 2 ? allPoints[allPoints.length - 2] : null
  const delta = prev ? current.close - prev.close : null
  const isIncrease = delta !== null ? delta > 0 : null
  const hasHistory = allPoints.length > 1

  return (
    <>
      <div className="rounded-lg border border-border p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Preço</span>
          {hasHistory && (
            <button
              onClick={() => setHistOpen(true)}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <Clock size={11} />
            </button>
          )}
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-sm font-bold text-foreground">{formatCurrency(current.close)}</span>
          {delta !== null && Math.abs(delta) > 0.001 && (
            <span
              className={`flex items-center gap-0.5 text-xs ${isIncrease ? 'text-success' : 'text-destructive'}`}
            >
              <TrendIcon isIncrease={isIncrease!} isGood={isIncrease} />
              {delta > 0 ? '+' : ''}
              {formatCurrency(delta)}
            </span>
          )}
        </div>
      </div>

      <HistoryDialog title="Preço" open={histOpen} onOpenChange={setHistOpen}>
        {[...allPoints].reverse().map((p, i, arr) => {
          const nextP = arr[i + 1]
          const d = nextP ? p.close - nextP.close : null
          const up = d !== null ? d > 0 : null
          return (
            <div
              key={p.date}
              className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
            >
              <span className="text-muted-foreground">{fmtDate(p.date)}</span>
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{formatCurrency(p.close)}</span>
                {d !== null && Math.abs(d) > 0.001 && (
                  <span
                    className={`flex items-center gap-0.5 ${up ? 'text-success' : 'text-destructive'}`}
                  >
                    <TrendIcon isIncrease={up!} isGood={up} />
                    {d > 0 ? '+' : ''}
                    {formatCurrency(d)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </HistoryDialog>
    </>
  )
}

const IndicatorHistoryContent = ({
  snapshots,
  def,
}: {
  snapshots: FundamentalSnapshot[]
  def: IndicatorDef
}) => {
  const entries = [...snapshots]
    .reverse()
    .filter((s) => (s[def.key] as number | null | undefined) != null)
  return (
    <>
      {entries.map((s, i) => {
        const val = s[def.key] as number
        const nextEntry = entries[i + 1]
        const prevVal = nextEntry ? (nextEntry[def.key] as number | null) : null
        const delta = prevVal !== null ? val - prevVal : null
        const isIncrease = delta !== null ? delta > 0 : null
        const isGood =
          delta === null || def.trendType === 'neutral'
            ? null
            : def.trendType === 'up-good'
              ? isIncrease!
              : !isIncrease!
        return (
          <div
            key={s.fetchedAt}
            className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
          >
            <span className="text-muted-foreground">{fmtDate(s.fetchedAt)}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{def.format(val)}</span>
              {delta !== null &&
                Math.abs(delta) > 0.0001 &&
                def.format(Math.abs(delta)) !== def.format(0) && (
                  <span
                    className={`flex items-center gap-0.5 ${isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'}`}
                  >
                    <TrendIcon isIncrease={isIncrease ?? false} isGood={isGood} />
                    {delta > 0 ? '+' : ''}
                    {def.format(delta)}
                  </span>
                )}
            </div>
          </div>
        )
      })}
    </>
  )
}

const IndicatorCard = ({
  def,
  snapshots,
}: {
  def: IndicatorDef
  snapshots: FundamentalSnapshot[]
}) => {
  const [histOpen, setHistOpen] = useState(false)
  const current = snapshots.at(-1)
  const val = current != null ? ((current[def.key] as number | null | undefined) ?? null) : null
  if (val == null && snapshots.every((s) => (s[def.key] as number | null | undefined) == null))
    return null

  const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const prevVal = prev != null ? ((prev[def.key] as number | null | undefined) ?? null) : null
  const delta = val != null && prevVal != null ? val - prevVal : null
  const isIncrease = delta !== null ? delta > 0 : null
  const isGood =
    delta === null || def.trendType === 'neutral'
      ? null
      : def.trendType === 'up-good'
        ? isIncrease!
        : !isIncrease!
  const hasHistory =
    snapshots.filter((s) => (s[def.key] as number | null | undefined) != null).length >= 1

  return (
    <TooltipProvider delayDuration={200}>
      <>
        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {def.label}
            </span>
            {def.tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <HelpCircle size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs space-y-1.5 p-3">
                  <p className="font-semibold text-xs">{def.tooltip.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {def.tooltip.description}
                  </p>
                  {def.tooltip.ideal && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Ideal:</span>{' '}
                      {def.tooltip.ideal}
                    </p>
                  )}
                  {def.tooltip.calc && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Cálculo:</span>{' '}
                      {def.tooltip.calc}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-1.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              {val !== null ? (
                <span className="text-sm font-bold text-foreground">{def.format(val)}</span>
              ) : (
                <span className="text-sm text-muted-foreground/40">—</span>
              )}
              {delta !== null &&
                Math.abs(delta) > 0.0001 &&
                def.format(Math.abs(delta)) !== def.format(0) && (
                  <span
                    className={`flex items-center gap-0.5 text-xs ${isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'}`}
                  >
                    <TrendIcon isIncrease={isIncrease ?? false} isGood={isGood} />
                    {delta > 0 ? '+' : ''}
                    {def.format(delta)}
                  </span>
                )}
            </div>
            {hasHistory && (
              <button
                onClick={() => setHistOpen(true)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0"
              >
                <Clock size={11} />
              </button>
            )}
          </div>
        </div>

        {hasHistory && (
          <HistoryDialog title={def.label} open={histOpen} onOpenChange={setHistOpen}>
            <IndicatorHistoryContent snapshots={snapshots} def={def} />
          </HistoryDialog>
        )}
      </>
    </TooltipProvider>
  )
}

/* ─── FII indicator definitions ────────────────────────────────── */

interface FiiTextDef {
  type: 'text'
  key: keyof FundamentalSnapshot
  label: string
  inputPlaceholder?: string
  tooltip?: IndicatorTooltip
}

interface FiiNumericDef {
  type: 'number'
  key: keyof FundamentalSnapshot
  label: string
  format: (v: number) => string
  trendType: TrendType
  inputStep?: string
  inputLabel?: string
  tooltip?: IndicatorTooltip
}

type FiiIndicatorDef = FiiNumericDef | FiiTextDef

const FII_COMMON: FiiIndicatorDef[] = [
  {
    type: 'number',
    key: 'dividendYield',
    label: 'DY',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'DY em % (ex: 8.5)',
    tooltip: {
      title: 'DY = Dividend Yield',
      description:
        'Percentual dos rendimentos distribuídos nos últimos 12 meses em relação ao preço atual da cota. Principal indicador de renda de um FII.',
      ideal: 'Acima de 8% ao ano é considerado atrativo para FIIs.',
      calc: 'Rendimentos pagos nos últimos 12 meses ÷ preço atual da cota × 100',
    },
  },
  {
    type: 'number',
    key: 'priceToBook',
    label: 'P/VP',
    format: ratio,
    trendType: 'neutral',
    inputStep: '0.01',
    inputLabel: 'P/VP (ex: 0.95)',
    tooltip: {
      title: 'P/VP = Preço sobre o Valor Patrimonial',
      description:
        'Relação entre o preço de mercado da cota e o valor patrimonial (patrimônio líquido ÷ cotas). Abaixo de 1 significa que o mercado precifica o fundo com desconto sobre seu patrimônio.',
      ideal: 'Entre 0,9x e 1,1x é considerado justo. Abaixo de 0,95x pode ser oportunidade.',
      calc: 'Preço da cota ÷ valor patrimonial por cota',
    },
  },
  {
    type: 'number',
    key: 'debtToEquity',
    label: 'Alavancagem (Dívida/PL)',
    format: ratio,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Alavancagem (Dívida/PL) (ex: 0.30)',
    tooltip: {
      title: 'Alavancagem = Dívida / Patrimônio Líquido',
      description:
        'Mede o grau de endividamento do fundo em relação ao seu patrimônio. FIIs com alta alavancagem têm maior risco em cenários de alta de juros.',
      ideal: 'Abaixo de 0,3x é conservador; acima de 0,5x requer atenção ao custo da dívida.',
      calc: 'Dívida total ÷ patrimônio líquido',
    },
  },
  {
    type: 'text',
    key: 'majorRevenueConcentration',
    label: 'Concentração de Receita',
    inputPlaceholder: 'Ex: Tenant A — 35% da receita',
    tooltip: {
      title: 'Concentração de Receita',
      description:
        'Percentual da receita do fundo proveniente dos maiores locatários ou devedores. Alta concentração em poucos inquilinos aumenta o risco de queda de renda.',
      ideal: 'Nenhum locatário respondendo por mais de 20–25% da receita total.',
    },
  },
]

const FII_TIJOLO: FiiIndicatorDef[] = [
  {
    type: 'number',
    key: 'physicalVacancy',
    label: 'Vacância Física',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Vacância Física em % (ex: 8)',
    tooltip: {
      title: 'Vacância Física',
      description:
        'Percentual da área total do fundo que está desocupada. Área vaga não gera aluguel e pressiona os rendimentos distribuídos.',
      ideal: 'Abaixo de 5% é ótimo; entre 5% e 10% é aceitável; acima de 15% é preocupante.',
      calc: 'Área total vaga (m²) ÷ área total do fundo (m²) × 100',
    },
  },
  {
    type: 'number',
    key: 'financialVacancy',
    label: 'Vacância Financeira',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Vacância Financeira em % (ex: 6)',
    tooltip: {
      title: 'Vacância Financeira',
      description:
        'Percentual da receita potencial total que não está sendo recebida devido a áreas vagas. Difere da física pois pondera pelo valor de aluguel de cada área.',
      ideal:
        'Abaixo de 5% é saudável. Vacância financeira < física indica que as melhores áreas estão ocupadas.',
      calc: 'Receita potencial de áreas vagas ÷ receita potencial total × 100',
    },
  },
  {
    type: 'number',
    key: 'propertyCount',
    label: 'Qtd. Imóveis',
    format: (v) => String(Math.round(v)),
    trendType: 'up-good',
    inputStep: '1',
    inputLabel: 'Quantidade de imóveis',
    tooltip: {
      title: 'Quantidade de Imóveis',
      description:
        'Número total de imóveis na carteira do fundo. Maior diversificação geográfica e por ativo reduz o risco de concentração.',
      ideal: 'Quanto mais imóveis, menor o risco de um único ativo impactar os rendimentos.',
    },
  },
  {
    type: 'text',
    key: 'propertyQuality',
    label: 'Qualidade dos Imóveis',
    inputPlaceholder: 'Ex: AAA — lajes corporativas classe A em SP',
    tooltip: {
      title: 'Qualidade dos Imóveis',
      description:
        'Classificação e perfil dos ativos do fundo (classe A, B ou C; localização; padrão construtivo). Imóveis de alta qualidade têm menor vacância e maior valorização.',
      ideal:
        'Imóveis classe A em regiões prime tendem a ter locatários mais sólidos e contratos mais longos.',
    },
  },
  {
    type: 'number',
    key: 'noiPerSqm',
    label: 'NOI/m²',
    format: (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'NOI por m² em R$ (ex: 85.50)',
    tooltip: {
      title: 'NOI/m² = Renda Operacional Líquida por m²',
      description:
        'Receita de aluguel menos despesas operacionais do imóvel, dividida pela área total. Mede a geração de caixa por metro quadrado.',
      ideal: 'Deve ser crescente ao longo do tempo e superior à inflação.',
      calc: '(Receita de aluguel − despesas operacionais) ÷ área total (m²)',
    },
  },
  {
    type: 'number',
    key: 'salesPerSqm',
    label: 'Vendas/m²',
    format: (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'Vendas por m² em R$ (ex: 1119)',
    tooltip: {
      title: 'Vendas/m² (para FIIs de Shopping)',
      description:
        'Volume de vendas dos lojistas por metro quadrado de ABL. Indica a saúde do varejo dentro do shopping e a capacidade de pagar aluguel.',
      ideal:
        'Deve crescer acima da inflação. Quedas consecutivas sinalizam dificuldade dos lojistas.',
      calc: 'Vendas totais dos lojistas ÷ área bruta locável (m²)',
    },
  },
  {
    type: 'text',
    key: 'operators',
    label: 'Operadores',
    inputPlaceholder: 'Ex: Multiplan, BR Malls, Iguatemi',
    tooltip: {
      title: 'Operadores',
      description:
        'Empresas responsáveis pela gestão e operação dos imóveis do fundo (ex: administradora de shopping, operadora logística). A qualidade do operador afeta diretamente a taxa de ocupação.',
    },
  },
  {
    type: 'number',
    key: 'tenantCount',
    label: 'Qtd. Inquilinos',
    format: (v) => String(Math.round(v)),
    trendType: 'up-good',
    inputStep: '1',
    inputLabel: 'Quantidade de inquilinos',
    tooltip: {
      title: 'Quantidade de Inquilinos',
      description:
        'Número total de locatários ativos no fundo. Maior número de inquilinos reduz o risco de vacância concentrada em poucos contratos.',
      ideal:
        'Quanto mais diversificado o mix de inquilinos, menor o risco de perda súbita de renda.',
    },
  },
  {
    type: 'text',
    key: 'regionDiversification',
    label: 'Diversificação por Região',
    inputPlaceholder: 'Ex: SP 60%, RJ 25%, MG 15%',
    tooltip: {
      title: 'Diversificação Geográfica',
      description:
        'Distribuição dos imóveis do fundo por estado ou cidade. Concentração excessiva em uma região expõe o fundo a riscos locais (recessão, desastres naturais, excesso de oferta).',
      ideal:
        'Presença em múltiplos estados, com predominância em mercados líquidos como SP, RJ e MG.',
    },
  },
  {
    type: 'text',
    key: 'rentalContracts',
    label: 'Contratos de Aluguel',
    inputPlaceholder: 'Ex: 70% típico, 30% atípico',
    tooltip: {
      title: 'Tipo de Contratos de Aluguel',
      description:
        'Contratos típicos seguem a Lei do Inquilinato (revisão a cada 3 anos, rescisão com multa). Contratos atípicos são personalizados, geralmente mais longos e com multa mais alta — maior previsibilidade de renda.',
      ideal: 'Contratos atípicos de longo prazo com bons pagadores oferecem renda mais estável.',
    },
  },
  {
    type: 'text',
    key: 'avgContractDuration',
    label: 'Prazo Médio dos Contratos',
    inputPlaceholder: 'Ex: 7 anos (vencimento médio 2031)',
    tooltip: {
      title: 'Prazo Médio dos Contratos',
      description:
        'Duração média (ou data média de vencimento) dos contratos de locação vigentes. Contratos mais longos garantem maior previsibilidade de receita.',
      ideal: 'Acima de 5 anos é considerado longo prazo e reduz o risco de renovação.',
    },
  },
]

const FII_PAPEL: FiiIndicatorDef[] = [
  {
    type: 'text',
    key: 'creditQuality',
    label: 'Qualidade do Crédito',
    inputPlaceholder: 'Ex: 80% AAA/AA, 15% A, 5% BB',
    tooltip: {
      title: 'Qualidade do Crédito',
      description:
        'Rating médio dos CRIs e CRAs na carteira do fundo. Créditos de alta qualidade (AAA/AA) têm menor risco de inadimplência, mas geralmente pagam spreads menores.',
      ideal: 'Carteira com pelo menos 70–80% dos ativos classificados como AA ou superior.',
    },
  },
  {
    type: 'text',
    key: 'indexationType',
    label: 'Tipo de Indexação',
    inputPlaceholder: 'Ex: 75% IPCA, 25% CDI',
    tooltip: {
      title: 'Tipo de Indexação',
      description:
        'Índice de correção dos ativos do fundo (IPCA, CDI, IGP-M, prefixado). Define como os rendimentos se comportam em diferentes cenários de inflação e juros.',
      ideal:
        'IPCA protege contra inflação; CDI é favorável em ambiente de juros altos. Boa mistura reduz o risco.',
    },
  },
  {
    type: 'text',
    key: 'paperSegments',
    label: 'Segmentos',
    inputPlaceholder: 'Ex: Residencial, Logística, Shoppings',
    tooltip: {
      title: 'Segmentos dos Recebíveis',
      description:
        'Setores imobiliários aos quais os CRIs/CRAs da carteira estão expostos (residencial, logístico, corporativo, shopping, agro). Diversificação reduz o risco setorial.',
      ideal: 'Exposição a múltiplos segmentos com preponderância em setores resilientes.',
    },
  },
  {
    type: 'text',
    key: 'debtorConcentration',
    label: 'Concentração de Devedores',
    inputPlaceholder: 'Ex: Top 5 devedores = 40% da carteira',
    tooltip: {
      title: 'Concentração de Devedores',
      description:
        'Percentual da carteira concentrado nos maiores devedores. Alta concentração em poucos emissores aumenta o risco de crédito — um calote pode impactar fortemente os rendimentos.',
      ideal: 'Nenhum devedor representando mais de 15–20% da carteira.',
    },
  },
  {
    type: 'number',
    key: 'spread',
    label: 'Spread Médio',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'Spread em % (ex: 8)',
    tooltip: {
      title: 'Spread Médio',
      description:
        'Taxa adicional paga pelos CRIs/CRAs acima do indexador (ex: IPCA + 7% → spread de 7%). Representa o prêmio pelo risco de crédito assumido.',
      ideal: 'Acima de 6–7% a.a. acima do IPCA é considerado atrativo com risco controlado.',
      calc: 'Taxa total do ativo − taxa do indexador de referência',
    },
  },
  {
    type: 'number',
    key: 'ltv',
    label: 'LTV',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'LTV em % (ex: 60)',
    tooltip: {
      title: 'LTV = Loan-to-Value',
      description:
        'Relação entre o valor do empréstimo (CRI/CRA) e o valor do imóvel dado em garantia. Quanto menor, maior a margem de segurança para o fundo em caso de execução da garantia.',
      ideal: 'Abaixo de 65% é conservador e oferece boa proteção ao credor.',
      calc: 'Valor total do CRI ÷ valor de avaliação do imóvel em garantia × 100',
    },
  },
  {
    type: 'number',
    key: 'defaultRate',
    label: 'Inadimplência',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Inadimplência em % (ex: 2)',
    tooltip: {
      title: 'Taxa de Inadimplência',
      description:
        'Percentual dos CRIs/CRAs com pagamentos em atraso ou em default. Inadimplência elevada reduz diretamente os rendimentos distribuídos e pode exigir provisões.',
      ideal: 'Abaixo de 2% é saudável. Acima de 5% é sinal de alerta relevante.',
      calc: 'Valor em atraso ou default ÷ carteira total × 100',
    },
  },
]

/* ─── Text indicator card ───────────────────────────────────────── */

const TextIndicatorCard = ({
  def,
  snapshots,
}: {
  def: FiiTextDef
  snapshots: FundamentalSnapshot[]
}) => {
  const [histOpen, setHistOpen] = useState(false)
  const entries = [...snapshots]
    .reverse()
    .filter(
      (s) => (s[def.key] as string | null | undefined) != null && (s[def.key] as string) !== '',
    )

  const current = entries[0]
  const val = current ? (current[def.key] as string) : null
  if (!val && entries.length === 0) return null

  const hasHistory = entries.length >= 1

  return (
    <TooltipProvider delayDuration={200}>
      <>
        <div className="rounded-lg border border-border p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {def.label}
            </span>
            {def.tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                    <HelpCircle size={12} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs space-y-1.5 p-3">
                  <p className="font-semibold text-xs">{def.tooltip.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {def.tooltip.description}
                  </p>
                  {def.tooltip.ideal && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Ideal:</span>{' '}
                      {def.tooltip.ideal}
                    </p>
                  )}
                  {def.tooltip.calc && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Cálculo:</span>{' '}
                      {def.tooltip.calc}
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-start justify-between gap-1.5">
            {val ? (
              <p className="text-sm font-medium text-foreground leading-snug">{val}</p>
            ) : (
              <span className="text-sm text-muted-foreground/40">—</span>
            )}
            {hasHistory && (
              <button
                onClick={() => setHistOpen(true)}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors shrink-0 mt-0.5"
              >
                <Clock size={11} />
              </button>
            )}
          </div>
        </div>

        {hasHistory && (
          <HistoryDialog title={def.label} open={histOpen} onOpenChange={setHistOpen}>
            {entries.map((s) => (
              <div
                key={s.fetchedAt}
                className="text-xs py-1.5 border-b border-border last:border-0"
              >
                <span className="text-muted-foreground block mb-0.5">{fmtDate(s.fetchedAt)}</span>
                <span className="text-foreground">{s[def.key] as string}</span>
              </div>
            ))}
          </HistoryDialog>
        )}
      </>
    </TooltipProvider>
  )
}

/* ─── Manual snapshot dialog ────────────────────────────────────── */

const ManualSnapshotDialog = ({
  ticker,
  isFii,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  isFii: boolean
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
}) => {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const buildPartial = (defs: FiiIndicatorDef[]): Partial<FundamentalSnapshot> => {
    const partial: Partial<FundamentalSnapshot> = {}
    for (const def of defs) {
      const raw = form[def.key as string]
      if (raw === undefined || raw === '') continue
      if (def.type === 'number') {
        ;(partial as Record<string, number>)[def.key as string] = Number(raw)
      } else {
        ;(partial as Record<string, string>)[def.key as string] = raw
      }
    }
    return partial
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let partial: Partial<FundamentalSnapshot>
      if (isFii) {
        partial = {
          ...buildPartial(FII_COMMON),
          ...buildPartial(FII_TIJOLO),
          ...buildPartial(FII_PAPEL),
        }
      } else {
        partial = buildPartial(STOCK_INDICATORS.map((d) => ({ ...d, type: 'number' as const })))
      }
      if (form['notes'] !== undefined && form['notes'] !== '') {
        ;(partial as Record<string, string>)['notes'] = form['notes']
      }
      await onSave(ticker, partial)
      onOpenChange(false)
      setForm({})
    } finally {
      setSaving(false)
    }
  }

  const renderField = (def: FiiIndicatorDef) => {
    const key = def.key as string
    if (def.type === 'number') {
      return (
        <div key={key}>
          <label className="text-xs text-muted-foreground mb-1 block">
            {def.inputLabel ?? def.label}
          </label>
          <input
            className={inputClass}
            type="number"
            step={def.inputStep}
            placeholder="—"
            value={form[key] ?? ''}
            onChange={(e) => setField(key, e.target.value)}
          />
        </div>
      )
    }
    return (
      <div key={key}>
        <label className="text-xs text-muted-foreground mb-1 block">{def.label}</label>
        <input
          className={inputClass}
          type="text"
          placeholder={def.inputPlaceholder ?? '—'}
          value={form[key] ?? ''}
          onChange={(e) => setField(key, e.target.value)}
        />
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar indicadores — {ticker}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">
          Salva os dados do mês atual. Deixe em branco para não alterar.
        </p>

        {isFii ? (
          <div className="space-y-3 mt-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1 border-b border-border">
              Todos os FIIs
            </p>
            {FII_COMMON.map(renderField)}

            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1 border-b border-border">
              FII de Tijolo
            </p>
            {FII_TIJOLO.map(renderField)}

            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1 border-b border-border">
              FII de Papel
            </p>
            {FII_PAPEL.map(renderField)}
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {STOCK_INDICATORS.map((def) => renderField({ ...def, type: 'number' }))}
          </div>
        )}

        <div className="mt-2">
          <label htmlFor="snapshot-notes" className="text-xs text-muted-foreground mb-1 block">
            Observações
          </label>
          <textarea
            id="snapshot-notes"
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Ex: Vacância alta em 2026, reavaliar no próximo trimestre"
            value={form['notes'] ?? ''}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Registrar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── FII info dialog ───────────────────────────────────────────── */

const FII_INFO_FIELDS: {
  key: keyof Omit<FiiInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
}[] = [
  {
    key: 'longName',
    label: 'Nome do Fundo',
    placeholder: 'Ex: XP Malls Fundo de Investimento Imobiliário',
  },
  { key: 'cnpj', label: 'CNPJ', placeholder: 'Ex: 28.757.546/0001-00' },
  { key: 'startDate', label: 'Início do Fundo', placeholder: 'Ex: 2012-05-17 ou 17/05/2012' },
  {
    key: 'segment',
    label: 'Segmento',
    placeholder: 'Ex: Shoppings, Lajes Corporativas, Logística...',
  },
  { key: 'marketCap', label: 'Valor de Mercado', placeholder: 'Ex: R$ 2,4 bi' },
  {
    key: 'adminName',
    label: 'Administradora / Gestora',
    placeholder: 'Ex: BTG Pactual (adm.) / XP Asset (gestora)',
  },
  { key: 'adminFee', label: 'Taxa de Administração', placeholder: 'Ex: 0,85% a.a.' },
  {
    key: 'performanceFee',
    label: 'Taxa de Performance',
    placeholder: 'Ex: 20% sobre IPCA+6% ou Não há',
  },
]

const FiiInfoDialog = ({
  ticker,
  existing,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  existing: FiiInfo | undefined
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: FiiInfo) => Promise<void>
}) => {
  const empty = {
    longName: '',
    cnpj: '',
    startDate: '',
    segment: '',
    marketCap: '',
    adminName: '',
    adminFee: '',
    performanceFee: '',
  }
  const [form, setForm] = useState<Omit<FiiInfo, 'ticker' | 'updatedAt'>>(
    existing
      ? {
          longName: existing.longName,
          cnpj: existing.cnpj,
          startDate: existing.startDate,
          segment: existing.segment,
          marketCap: existing.marketCap,
          adminName: existing.adminName,
          adminFee: existing.adminFee,
          performanceFee: existing.performanceFee,
        }
      : empty,
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(
        existing
          ? {
              longName: existing.longName,
              cnpj: existing.cnpj,
              startDate: existing.startDate,
              segment: existing.segment,
              marketCap: existing.marketCap,
              adminName: existing.adminName,
              adminFee: existing.adminFee,
              performanceFee: existing.performanceFee,
            }
          : empty,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ ticker, updatedAt: new Date().toISOString(), ...form })
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">
            Informações do Fundo
            <span className="ml-2 text-xs font-normal text-muted-foreground">{ticker}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {FII_INFO_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-muted-foreground mb-1">{label}</label>
              <input
                className={inputClass}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── FII info section ──────────────────────────────────────────── */

const FiiInfoSection = ({ info, onEdit }: { info: FiiInfo | undefined; onEdit: () => void }) => {
  const fields: { label: string; value: string }[] = info
    ? [
        { label: 'Nome do Fundo', value: info.longName },
        { label: 'CNPJ', value: info.cnpj },
        { label: 'Início', value: info.startDate },
        { label: 'Segmento', value: info.segment },
        { label: 'Valor de Mercado', value: info.marketCap },
        { label: 'Administradora / Gestora', value: info.adminName },
        { label: 'Taxa de Adm.', value: info.adminFee },
        { label: 'Taxa de Performance', value: info.performanceFee },
      ].filter((f) => f.value.trim() !== '')
    : []

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Informações do Fundo
        </p>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={11} />
          {info ? 'Editar' : 'Preencher'}
        </button>
      </div>
      {fields.length > 0 ? (
        <div className="rounded-lg border border-border p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                {f.label}
              </p>
              <p className="text-sm font-medium text-foreground break-words">{f.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma informação registrada.</p>
        </div>
      )}
    </div>
  )
}

/* ─── Stock info fields / dialog / section ─────────────────────── */

const STOCK_INFO_FIELDS: {
  key: keyof Omit<StockInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  { key: 'companyName', label: 'Nome da Empresa', placeholder: 'Ex: Itaú Unibanco Holding S.A.' },
  { key: 'sector', label: 'Setor', placeholder: 'Ex: Financeiro' },
  { key: 'subsector', label: 'Subsetor / Segmento', placeholder: 'Ex: Bancos / Large Caps' },
  {
    key: 'about',
    label: 'Sobre a Empresa',
    placeholder: 'Mini descrição da empresa e modelo de negócio...',
    multiline: true,
  },
  { key: 'foundedYear', label: 'Fundação', placeholder: 'Ex: 1945' },
  { key: 'ipoYear', label: 'IPO', placeholder: 'Ex: 2002' },
  { key: 'marketCap', label: 'Valor de Mercado', placeholder: 'Ex: R$ 280 bi' },
  {
    key: 'governanceLevel',
    label: 'Governança',
    placeholder: 'Ex: Novo Mercado, Nível 2, Nível 1',
  },
  { key: 'controller', label: 'Controlador', placeholder: 'Ex: Família Villela / Itaúsa' },
  {
    key: 'geographicExposure',
    label: 'Exposição Geográfica',
    placeholder: 'Ex: Brasil 85%, América Latina 15%',
  },
  { key: 'tagAlong', label: 'Tag Along', placeholder: 'Ex: 100%' },
]

const StockInfoDialog = ({
  ticker,
  existing,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  existing: StockInfo | undefined
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: StockInfo) => Promise<void>
}) => {
  const empty: Omit<StockInfo, 'ticker' | 'updatedAt'> = {
    companyName: '',
    sector: '',
    subsector: '',
    about: '',
    foundedYear: '',
    ipoYear: '',
    marketCap: '',
    governanceLevel: '',
    controller: '',
    geographicExposure: '',
    tagAlong: '',
  }

  const fromExisting = (e: StockInfo): Omit<StockInfo, 'ticker' | 'updatedAt'> => ({
    companyName: e.companyName,
    sector: e.sector,
    subsector: e.subsector,
    about: e.about,
    foundedYear: e.foundedYear,
    ipoYear: e.ipoYear,
    marketCap: e.marketCap,
    governanceLevel: e.governanceLevel,
    controller: e.controller,
    geographicExposure: e.geographicExposure,
    tagAlong: e.tagAlong,
  })

  const [form, setForm] = useState<Omit<StockInfo, 'ticker' | 'updatedAt'>>(
    existing ? fromExisting(existing) : empty,
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(existing ? fromExisting(existing) : empty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ ticker, updatedAt: new Date().toISOString(), ...form })
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Informações da Empresa
            <span className="ml-2 text-xs font-normal text-muted-foreground">{ticker}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {STOCK_INFO_FIELDS.map(({ key, label, placeholder, multiline }) => (
            <div key={key}>
              <label className="block text-xs text-muted-foreground mb-1">{label}</label>
              {multiline ? (
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              ) : (
                <input
                  className={inputClass}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* ─── Stock info section ────────────────────────────────────────── */

const StockInfoSection = ({
  info,
  onEdit,
}: {
  info: StockInfo | undefined
  onEdit: () => void
}) => {
  const fields: { label: string; value: string }[] = info
    ? [
        { label: 'Nome da Empresa', value: info.companyName },
        { label: 'Setor', value: info.sector },
        { label: 'Subsetor / Segmento', value: info.subsector },
        { label: 'Fundação', value: info.foundedYear },
        { label: 'IPO', value: info.ipoYear },
        { label: 'Valor de Mercado', value: info.marketCap },
        { label: 'Governança', value: info.governanceLevel },
        { label: 'Controlador', value: info.controller },
        { label: 'Exposição Geográfica', value: info.geographicExposure },
        { label: 'Tag Along', value: info.tagAlong },
        { label: 'Sobre a Empresa', value: info.about },
      ].filter((f) => f.value.trim() !== '')
    : []

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Informações da Empresa
        </p>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={11} />
          {info ? 'Editar' : 'Preencher'}
        </button>
      </div>
      {fields.length > 0 ? (
        <div className="rounded-lg border border-border p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                {f.label}
              </p>
              <p className="text-sm font-medium text-foreground break-words">{f.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma informação registrada.</p>
        </div>
      )}
    </div>
  )
}

/* ─── Asset detail view (inline) ───────────────────────────────── */

const AssetDetailView = ({
  asset,
  record,
  isFii,
  fiiInfoData,
  stockInfoData,
  onBack,
  onSaveSnapshot,
  onSaveFiiInfo,
  onSaveStockInfo,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  isFii: boolean
  fiiInfoData: FiiInfo | undefined
  stockInfoData: StockInfo | undefined
  onBack: () => void
  onSaveSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  onSaveFiiInfo: (data: FiiInfo) => Promise<void>
  onSaveStockInfo: (data: StockInfo) => Promise<void>
}) => {
  const [registerOpen, setRegisterOpen] = useState(false)
  const [fiiInfoOpen, setFiiInfoOpen] = useState(false)
  const [stockInfoOpen, setStockInfoOpen] = useState(false)

  const snapshots = record?.snapshots ?? []
  const current = snapshots.at(-1) ?? null
  const indicators = STOCK_INDICATORS

  return (
    <>
      <div className="space-y-6">
        {/* Top bar: back + ticker + badges */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <span className="text-muted-foreground">/</span>
          <a
            href={`https://investidor10.com.br/${isFii ? 'fiis' : 'acoes'}/${asset.ticker.toLowerCase()}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-foreground shrink-0 hover:underline"
          >
            {asset.ticker}
          </a>
          {asset.name !== asset.ticker && (
            <p className="text-sm text-muted-foreground truncate hidden sm:block">{asset.name}</p>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(asset.currentPrice)}
          </span>
          {current?.industry && (
            <span className="text-xs text-muted-foreground/70">{current.industry}</span>
          )}
        </div>

        {/* FII fund info */}
        {isFii && <FiiInfoSection info={fiiInfoData} onEdit={() => setFiiInfoOpen(true)} />}

        {/* Stock company info */}
        {!isFii && <StockInfoSection info={stockInfoData} onEdit={() => setStockInfoOpen(true)} />}

        {/* Indicators */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Indicadores
            </p>
            <button
              onClick={() => setRegisterOpen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus size={12} />
              Registrar indicadores
            </button>
          </div>
          {isFii ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[...FII_COMMON, ...FII_TIJOLO, ...FII_PAPEL].map((def) =>
                def.type === 'number' ? (
                  <IndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
                ) : (
                  <TextIndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
                ),
              )}
              <TextIndicatorCard
                def={{ type: 'text', key: 'notes', label: 'Observações' }}
                snapshots={snapshots}
              />
              {snapshots.length === 0 && (
                <p className="text-xs text-muted-foreground col-span-full mt-1">
                  Nenhum indicador registrado ainda
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {snapshots.length > 0 ? (
                indicators.map((def) => (
                  <IndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-full mt-1">
                  Nenhum indicador registrado ainda
                </p>
              )}
              <TextIndicatorCard
                def={{ type: 'text', key: 'notes', label: 'Observações' }}
                snapshots={snapshots}
              />
            </div>
          )}
        </div>
      </div>

      <ManualSnapshotDialog
        ticker={asset.ticker}
        isFii={isFii}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSave={onSaveSnapshot}
      />
      {isFii && (
        <FiiInfoDialog
          ticker={asset.ticker}
          existing={fiiInfoData}
          open={fiiInfoOpen}
          onOpenChange={setFiiInfoOpen}
          onSave={onSaveFiiInfo}
        />
      )}
      {!isFii && (
        <StockInfoDialog
          ticker={asset.ticker}
          existing={stockInfoData}
          open={stockInfoOpen}
          onOpenChange={setStockInfoOpen}
          onSave={onSaveStockInfo}
        />
      )}
    </>
  )
}

/* ─── Compact asset card ────────────────────────────────────────── */

const AssetCompactCard = ({
  asset,
  record,
  isFii,
  onClick,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  isFii: boolean
  onClick: () => void
}) => {
  const snapshots = record?.snapshots ?? []
  const current = snapshots.at(-1) ?? null

  const keyDefs: {
    key: keyof FundamentalSnapshot
    label: string
    format: (v: number) => string
  }[] = isFii
    ? (FII_COMMON.filter(
        (d) => d.key === 'dividendYield' || d.key === 'priceToBook',
      ) as FiiNumericDef[])
    : STOCK_INDICATORS.filter((d) => d.key === 'priceEarnings' || d.key === 'dividendYield')

  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors group"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <span className="font-bold text-foreground">{asset.ticker}</span>
            {asset.name !== asset.ticker && (
              <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
            )}
          </div>
          <ChevronRight
            size={14}
            className="text-muted-foreground/50 group-hover:text-muted-foreground shrink-0 mt-1 transition-colors"
          />
        </div>

        <p className="text-lg font-bold text-foreground mb-3">
          {formatCurrency(asset.currentPrice)}
        </p>

        {keyDefs.length > 0 && current && (
          <div className="flex gap-4">
            {keyDefs.map((def) => {
              const val = current[def.key] as number | null
              if (val == null) return null
              return (
                <div key={def.key as string}>
                  <p className="text-[10px] text-muted-foreground">{def.label}</p>
                  <p className="text-xs font-medium text-foreground">{def.format(val)}</p>
                </div>
              )
            })}
          </div>
        )}

        {snapshots.length === 0 && (
          <p className="text-xs text-muted-foreground/50 italic">Sem indicadores</p>
        )}
      </div>
    </Card>
  )
}

/* ─── Main tab ──────────────────────────────────────────────────── */

export const AnalysisTab = ({
  assets,
  fundamentals,
  saveManualSnapshot,
  fiiInfo,
  saveFiiInfo,
  stockInfo,
  saveStockInfo,
}: Props) => {
  const [subTab, setSubTab] = useState<'stock' | 'fii'>('stock')
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  const stocks = assets.filter((a) => a.type === 'stock')
  const fiis = assets.filter((a) => a.type === 'fii')

  const allShown = subTab === 'stock' ? stocks : fiis
  const selectedAsset = allShown.find((a) => a.ticker === selectedTicker) ?? null

  if (stocks.length === 0 && fiis.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Nenhuma ação BR ou FII na carteira.
      </div>
    )
  }

  if (selectedAsset) {
    return (
      <AssetDetailView
        asset={selectedAsset}
        record={fundamentals[selectedAsset.ticker.toUpperCase()]}
        isFii={subTab === 'fii'}
        fiiInfoData={fiiInfo[selectedAsset.ticker.toUpperCase()]}
        stockInfoData={stockInfo[selectedAsset.ticker.toUpperCase()]}
        onBack={() => setSelectedTicker(null)}
        onSaveSnapshot={saveManualSnapshot}
        onSaveFiiInfo={saveFiiInfo}
        onSaveStockInfo={saveStockInfo}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1">
        {stocks.length > 0 && (
          <button
            onClick={() => setSubTab('stock')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${subTab === 'stock' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Ações BR <span className="ml-1 text-xs opacity-70">({stocks.length})</span>
          </button>
        )}
        {fiis.length > 0 && (
          <button
            onClick={() => setSubTab('fii')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${subTab === 'fii' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            FIIs <span className="ml-1 text-xs opacity-70">({fiis.length})</span>
          </button>
        )}
      </div>

      {allShown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Nenhum ativo nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allShown.map((asset) => (
            <AssetCompactCard
              key={asset.id}
              asset={asset}
              record={fundamentals[asset.ticker.toUpperCase()]}
              isFii={subTab === 'fii'}
              onClick={() => setSelectedTicker(asset.ticker)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
