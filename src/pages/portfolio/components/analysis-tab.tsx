import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { Asset, FiiInfo, FundamentalRecord, FundamentalSnapshot, PricePoint } from '@/types'

/* ─── Shared ────────────────────────────────────────────────────── */

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  assets: Asset[]
  fundamentals: Record<string, FundamentalRecord>
  saveManualSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  fiiInfo: Record<string, FiiInfo>
  saveFiiInfo: (data: FiiInfo) => Promise<void>
}

type TrendType = 'up-good' | 'up-bad' | 'neutral'

interface IndicatorDef {
  key: keyof FundamentalSnapshot
  label: string
  format: (v: number) => string
  trendType: TrendType
  inputStep?: string
  inputLabel?: string
}

const pct = (v: number) => (v * 100).toFixed(1) + '%'
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
  },
  {
    key: 'priceToBook',
    label: 'P/VP',
    format: ratio,
    trendType: 'neutral',
    inputStep: '0.01',
    inputLabel: 'P/VP (ex: 1.40)',
  },
  {
    key: 'returnOnEquity',
    label: 'ROE',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'ROE decimal (ex: 0.25 = 25%)',
  },
  {
    key: 'profitMargins',
    label: 'Mg. Líquida',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'Margem Líquida decimal',
  },
  {
    key: 'grossMargins',
    label: 'Mg. Bruta',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'Margem Bruta decimal',
  },
  {
    key: 'ebitdaMargins',
    label: 'Mg. EBITDA',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'Margem EBITDA decimal',
  },
  {
    key: 'returnOnAssets',
    label: 'ROA',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'ROA decimal',
  },
  {
    key: 'debtToEquity',
    label: 'Dívida/PL',
    format: ratio,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Dívida/PL (ex: 1.60)',
  },
  {
    key: 'dividendYield',
    label: 'DY',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'DY decimal (ex: 0.05 = 5%)',
  },
  {
    key: 'earningsGrowth',
    label: 'Cresc. Lucro',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'Cresc. Lucro decimal',
  },
  {
    key: 'revenueGrowth',
    label: 'Cresc. Receita',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'Cresc. Receita decimal',
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

/* ─── Indicator cards ───────────────────────────────────────────── */

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

/* ─── Indicator cards ───────────────────────────────────────────── */

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
    snapshots.filter((s) => (s[def.key] as number | null | undefined) != null).length > 1

  return (
    <>
      <div className="rounded-lg border border-border p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {def.label}
          </span>
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
      </div>

      {hasHistory && (
        <HistoryDialog title={def.label} open={histOpen} onOpenChange={setHistOpen}>
          <IndicatorHistoryContent snapshots={snapshots} def={def} />
        </HistoryDialog>
      )}
    </>
  )
}

/* ─── FII indicator definitions ────────────────────────────────── */

interface FiiTextDef {
  type: 'text'
  key: keyof FundamentalSnapshot
  label: string
  inputPlaceholder?: string
}

interface FiiNumericDef {
  type: 'number'
  key: keyof FundamentalSnapshot
  label: string
  format: (v: number) => string
  trendType: TrendType
  inputStep?: string
  inputLabel?: string
}

type FiiIndicatorDef = FiiNumericDef | FiiTextDef

const directPct = (v: number) => v.toFixed(2) + '%'

const FII_COMMON: FiiIndicatorDef[] = [
  {
    type: 'number',
    key: 'dividendYield',
    label: 'DY',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'DY em % (ex: 8.5)',
  },
  {
    type: 'number',
    key: 'priceToBook',
    label: 'P/VP',
    format: ratio,
    trendType: 'neutral',
    inputStep: '0.01',
    inputLabel: 'P/VP (ex: 0.95)',
  },
  {
    type: 'number',
    key: 'debtToEquity',
    label: 'Alavancagem (Dívida/PL)',
    format: ratio,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Alavancagem (Dívida/PL) (ex: 0.30)',
  },
  {
    type: 'text',
    key: 'majorRevenueConcentration',
    label: 'Concentração de Receita',
    inputPlaceholder: 'Ex: Tenant A — 35% da receita',
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
  },
  {
    type: 'number',
    key: 'financialVacancy',
    label: 'Vacância Financeira',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Vacância Financeira em % (ex: 6)',
  },
  {
    type: 'number',
    key: 'propertyCount',
    label: 'Qtd. Imóveis',
    format: (v) => String(Math.round(v)),
    trendType: 'up-good',
    inputStep: '1',
    inputLabel: 'Quantidade de imóveis',
  },
  {
    type: 'text',
    key: 'propertyQuality',
    label: 'Qualidade dos Imóveis',
    inputPlaceholder: 'Ex: AAA — lajes corporativas classe A em SP',
  },
  {
    type: 'number',
    key: 'noiPerSqm',
    label: 'NOI/m²',
    format: (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'NOI por m² em R$ (ex: 85.50)',
  },
  {
    type: 'number',
    key: 'salesPerSqm',
    label: 'Vendas/m²',
    format: (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'Vendas por m² em R$ (ex: 1119)',
  },
  {
    type: 'text',
    key: 'operators',
    label: 'Operadores',
    inputPlaceholder: 'Ex: Multiplan, BR Malls, Iguatemi',
  },
  {
    type: 'number',
    key: 'tenantCount',
    label: 'Qtd. Inquilinos',
    format: (v) => String(Math.round(v)),
    trendType: 'up-good',
    inputStep: '1',
    inputLabel: 'Quantidade de inquilinos',
  },
  {
    type: 'text',
    key: 'regionDiversification',
    label: 'Diversificação por Região',
    inputPlaceholder: 'Ex: SP 60%, RJ 25%, MG 15%',
  },
  {
    type: 'text',
    key: 'rentalContracts',
    label: 'Contratos de Aluguel',
    inputPlaceholder: 'Ex: 70% típico, 30% atípico',
  },
  {
    type: 'text',
    key: 'avgContractDuration',
    label: 'Prazo Médio dos Contratos',
    inputPlaceholder: 'Ex: 7 anos (vencimento médio 2031)',
  },
]

const FII_PAPEL: FiiIndicatorDef[] = [
  {
    type: 'text',
    key: 'creditQuality',
    label: 'Qualidade do Crédito',
    inputPlaceholder: 'Ex: 80% AAA/AA, 15% A, 5% BB',
  },
  {
    type: 'text',
    key: 'indexationType',
    label: 'Tipo de Indexação',
    inputPlaceholder: 'Ex: 75% IPCA, 25% CDI',
  },
  {
    type: 'text',
    key: 'paperSegments',
    label: 'Segmentos',
    inputPlaceholder: 'Ex: Residencial, Logística, Shoppings',
  },
  {
    type: 'text',
    key: 'debtorConcentration',
    label: 'Concentração de Devedores',
    inputPlaceholder: 'Ex: Top 5 devedores = 40% da carteira',
  },
  {
    type: 'number',
    key: 'spread',
    label: 'Spread Médio',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'Spread em % (ex: 8)',
  },
  {
    type: 'number',
    key: 'ltv',
    label: 'LTV',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'LTV em % (ex: 60)',
  },
  {
    type: 'number',
    key: 'defaultRate',
    label: 'Inadimplência',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Inadimplência em % (ex: 2)',
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

  const hasHistory = entries.length > 1

  return (
    <>
      <div className="rounded-lg border border-border p-3 col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {def.label}
          </span>
          {hasHistory && (
            <button
              onClick={() => setHistOpen(true)}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <Clock size={11} />
            </button>
          )}
        </div>
        {val ? (
          <p className="text-sm font-medium text-foreground leading-snug">{val}</p>
        ) : (
          <span className="text-sm text-muted-foreground/40">—</span>
        )}
      </div>

      {hasHistory && (
        <HistoryDialog title={def.label} open={histOpen} onOpenChange={setHistOpen}>
          {entries.map((s) => (
            <div key={s.fetchedAt} className="text-xs py-1.5 border-b border-border last:border-0">
              <span className="text-muted-foreground block mb-0.5">{fmtDate(s.fetchedAt)}</span>
              <span className="text-foreground">{s[def.key] as string}</span>
            </div>
          ))}
        </HistoryDialog>
      )}
    </>
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

/* ─── Asset detail view (inline) ───────────────────────────────── */

const AssetDetailView = ({
  asset,
  record,
  isFii,
  fiiInfoData,
  onBack,
  onSaveSnapshot,
  onSaveFiiInfo,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  isFii: boolean
  fiiInfoData: FiiInfo | undefined
  onBack: () => void
  onSaveSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  onSaveFiiInfo: (data: FiiInfo) => Promise<void>
}) => {
  const [registerOpen, setRegisterOpen] = useState(false)
  const [fiiInfoOpen, setFiiInfoOpen] = useState(false)

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
          <h2 className="text-xl font-bold text-foreground shrink-0">{asset.ticker}</h2>
          <p className="text-sm text-muted-foreground truncate hidden sm:block">{asset.name}</p>
          {current?.sector && (
            <Badge variant="secondary" className="shrink-0">
              {current.sector}
            </Badge>
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
              {snapshots.length === 0 && (
                <p className="text-xs text-muted-foreground col-span-full mt-1">
                  Nenhum indicador registrado ainda.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <PriceCard points={record?.priceHistory ?? []} currentPrice={asset.currentPrice} />
              {snapshots.length > 0 ? (
                indicators.map((def) => (
                  <IndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-full mt-1">
                  Nenhum indicador registrado ainda.
                </p>
              )}
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
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">{asset.ticker}</span>
              {current?.sector && (
                <Badge variant="secondary" className="text-xs">
                  {current.sector}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
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
        onBack={() => setSelectedTicker(null)}
        onSaveSnapshot={saveManualSnapshot}
        onSaveFiiInfo={saveFiiInfo}
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
