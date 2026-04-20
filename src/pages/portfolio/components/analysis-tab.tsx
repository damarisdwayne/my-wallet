import { useState } from 'react'
import { ChevronDown, ChevronUp, Pencil, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type {
  Asset,
  FiiManualData,
  FundamentalRecord,
  FundamentalSnapshot,
  PricePoint,
} from '@/types'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  assets: Asset[]
  fundamentals: Record<string, FundamentalRecord>
  fiiManual: Record<string, FiiManualData>
  refreshingFundamentals: Record<string, boolean>
  fundamentalErrors: Record<string, string>
  refreshFundamentals: (tickers: string[]) => Promise<void>
  saveFiiManual: (data: FiiManualData) => Promise<void>
  saveManualSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
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
    inputLabel: 'Margem Líquida decimal (ex: 0.22)',
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

const FII_INDICATORS: IndicatorDef[] = [
  {
    key: 'dividendYield',
    label: 'DY',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'DY decimal (ex: 0.08 = 8%)',
  },
  {
    key: 'priceToBook',
    label: 'P/VP',
    format: ratio,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'P/VP (ex: 0.95)',
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
    key: 'returnOnEquity',
    label: 'ROE',
    format: pct,
    trendType: 'up-good',
    inputStep: '0.001',
    inputLabel: 'ROE decimal',
  },
]

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })

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

/* ─── Historical mini-list ──────────────────────────────────────── */

const HistoryList = ({
  snapshots,
  def,
}: {
  snapshots: FundamentalSnapshot[]
  def: IndicatorDef
}) => {
  const entries = [...snapshots].reverse().filter((s) => (s[def.key] as number | null) !== null)
  if (entries.length === 0) return null

  return (
    <div className="mt-1 mb-2 rounded-md bg-muted/50 p-2 space-y-1">
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
          <div key={s.fetchedAt} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{fmtDate(s.fetchedAt)}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-medium text-foreground">{def.format(val)}</span>
              {delta !== null && Math.abs(delta) > 0.0001 && (
                <div
                  className={`flex items-center gap-0.5 ${isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'}`}
                >
                  <TrendIcon isIncrease={isIncrease!} isGood={isGood} />
                  <span>
                    {delta > 0 ? '+' : ''}
                    {def.format(delta)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Indicator row with expandable history ─────────────────────── */

const IndicatorRow = ({
  def,
  snapshots,
}: {
  def: IndicatorDef
  snapshots: FundamentalSnapshot[]
}) => {
  const [expanded, setExpanded] = useState(false)
  const current = snapshots.at(-1)
  const val = current ? (current[def.key] as number | null) : null
  if (val === null && snapshots.every((s) => (s[def.key] as number | null) === null)) return null

  const prev = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null
  const prevVal = prev ? (prev[def.key] as number | null) : null
  const delta = val !== null && prevVal !== null ? val - prevVal : null
  const isIncrease = delta !== null ? delta > 0 : null
  const isGood =
    delta === null || def.trendType === 'neutral'
      ? null
      : def.trendType === 'up-good'
        ? isIncrease!
        : !isIncrease!

  const hasHistory = snapshots.filter((s) => (s[def.key] as number | null) !== null).length > 1

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-center justify-between py-1.5 group"
        onClick={() => hasHistory && setExpanded((v) => !v)}
        disabled={!hasHistory}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{def.label}</span>
          {hasHistory &&
            (expanded ? (
              <ChevronUp size={10} className="text-muted-foreground/60" />
            ) : (
              <ChevronDown size={10} className="text-muted-foreground/60" />
            ))}
        </div>
        <div className="flex items-center gap-2">
          {val !== null ? (
            <span className="text-xs font-medium text-foreground">{def.format(val)}</span>
          ) : (
            <span className="text-xs text-muted-foreground/50">—</span>
          )}
          {delta !== null && Math.abs(delta) > 0.0001 && (
            <div
              className={`flex items-center gap-0.5 text-xs ${isGood === null ? 'text-muted-foreground' : isGood ? 'text-success' : 'text-destructive'}`}
            >
              <TrendIcon isIncrease={isIncrease!} isGood={isGood} />
              {delta > 0 ? '+' : ''}
              {def.format(delta)}
            </div>
          )}
        </div>
      </button>
      {expanded && hasHistory && <HistoryList snapshots={snapshots} def={def} />}
    </div>
  )
}

/* ─── Price row with expandable history ────────────────────────── */

const PriceRow = ({ points, currentPrice }: { points: PricePoint[]; currentPrice: number }) => {
  const [expanded, setExpanded] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const allPoints = points.length > 0 ? points : [{ date: today, close: currentPrice }]
  const current = allPoints.at(-1)!
  const prev = allPoints.length >= 2 ? allPoints[allPoints.length - 2] : null
  const delta = prev ? current.close - prev.close : null
  const isIncrease = delta !== null ? delta > 0 : null

  return (
    <div className="border-b border-border last:border-0">
      <button
        className="w-full flex items-center justify-between py-1.5"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Preço</span>
          {expanded ? (
            <ChevronUp size={10} className="text-muted-foreground/60" />
          ) : (
            <ChevronDown size={10} className="text-muted-foreground/60" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">
            {formatCurrency(current.close)}
          </span>
          {delta !== null && Math.abs(delta) > 0.001 && (
            <div
              className={`flex items-center gap-0.5 text-xs ${isIncrease ? 'text-success' : 'text-destructive'}`}
            >
              <TrendIcon isIncrease={isIncrease!} isGood={isIncrease} />
              {delta > 0 ? '+' : ''}
              {formatCurrency(delta)}
            </div>
          )}
        </div>
      </button>
      {expanded && (
        <div className="mt-1 mb-2 rounded-md bg-muted/50 p-2 space-y-1">
          {[...allPoints].reverse().map((p, i, arr) => {
            const nextP = arr[i + 1]
            const d = nextP ? p.close - nextP.close : null
            const up = d !== null ? d > 0 : null
            return (
              <div key={p.date} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {new Date(p.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-foreground">{formatCurrency(p.close)}</span>
                  {d !== null && Math.abs(d) > 0.001 && (
                    <div
                      className={`flex items-center gap-0.5 ${up ? 'text-success' : 'text-destructive'}`}
                    >
                      <TrendIcon isIncrease={up!} isGood={up} />
                      <span>
                        {d > 0 ? '+' : ''}
                        {formatCurrency(d)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── FII manual data section ───────────────────────────────────── */

const FiiManualSection = ({
  ticker,
  data,
  onEdit,
}: {
  ticker: string
  data: FiiManualData | undefined
  onEdit: () => void
}) => (
  <div className="mt-3 pt-3 border-t border-border">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-muted-foreground">Dados manuais FII</span>
      <button
        onClick={onEdit}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Pencil size={11} />
        {data ? 'Editar' : 'Preencher'}
      </button>
    </div>
    {data ? (
      <div className="space-y-0.5">
        {data.vacancy !== null && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Vacância</span>
            <span className="text-xs font-medium text-foreground">{data.vacancy.toFixed(1)}%</span>
          </div>
        )}
        {data.propertyCount !== null && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Imóveis</span>
            <span className="text-xs font-medium text-foreground">{data.propertyCount}</span>
          </div>
        )}
        {data.manager && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Gestora</span>
            <span className="text-xs font-medium text-foreground truncate ml-2">
              {data.manager}
            </span>
          </div>
        )}
        {data.location && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Localização</span>
            <span className="text-xs font-medium text-foreground">{data.location}</span>
          </div>
        )}
        {data.adminFee !== null && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Taxa adm.</span>
            <span className="text-xs font-medium text-foreground">
              {data.adminFee.toFixed(2)}% a.a.
            </span>
          </div>
        )}
        {data.avgContractDuration && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Prazo médio</span>
            <span className="text-xs font-medium text-foreground">{data.avgContractDuration}</span>
          </div>
        )}
        {data.propertyQuality && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Qualidade</span>
            <span className="text-xs font-medium text-foreground">{data.propertyQuality}</span>
          </div>
        )}
      </div>
    ) : (
      <p className="text-xs text-muted-foreground italic">Nenhum dado para {ticker}</p>
    )}
  </div>
)

/* ─── FII edit dialog ───────────────────────────────────────────── */

const emptyFiiForm = (): Omit<FiiManualData, 'ticker' | 'updatedAt'> => ({
  vacancy: null,
  propertyCount: null,
  location: '',
  manager: '',
  adminFee: null,
  avgContractDuration: '',
  propertyQuality: '',
})

const FiiEditDialog = ({
  ticker,
  existing,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  existing: FiiManualData | undefined
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: FiiManualData) => Promise<void>
}) => {
  const [form, setForm] = useState(() =>
    existing
      ? {
          vacancy: existing.vacancy,
          propertyCount: existing.propertyCount,
          location: existing.location,
          manager: existing.manager,
          adminFee: existing.adminFee,
          avgContractDuration: existing.avgContractDuration,
          propertyQuality: existing.propertyQuality,
        }
      : emptyFiiForm(),
  )
  const [saving, setSaving] = useState(false)

  const setNum = (k: 'vacancy' | 'propertyCount' | 'adminFee', v: string) =>
    setForm((p) => ({ ...p, [k]: v === '' ? null : Number(v) }))
  const setStr = (
    k: 'location' | 'manager' | 'avgContractDuration' | 'propertyQuality',
    v: string,
  ) => setForm((p) => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({ ticker, ...form, updatedAt: new Date().toISOString() })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Dados manuais — {ticker}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Vacância (%)</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="5.2"
                value={form.vacancy ?? ''}
                onChange={(e) => setNum('vacancy', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Qtd. imóveis</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step={1}
                placeholder="12"
                value={form.propertyCount ?? ''}
                onChange={(e) => setNum('propertyCount', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Gestora / Adm.</label>
            <input
              className={inputClass}
              placeholder="BTG Pactual"
              value={form.manager}
              onChange={(e) => setStr('manager', e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Localização</label>
            <input
              className={inputClass}
              placeholder="SP, RJ, MG"
              value={form.location}
              onChange={(e) => setStr('location', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Taxa adm. (% a.a.)</label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step={0.01}
                placeholder="0.75"
                value={form.adminFee ?? ''}
                onChange={(e) => setNum('adminFee', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Prazo médio</label>
              <input
                className={inputClass}
                placeholder="7 anos"
                value={form.avgContractDuration}
                onChange={(e) => setStr('avgContractDuration', e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Qualidade dos imóveis
            </label>
            <input
              className={inputClass}
              placeholder="AAA, Lajes Corp."
              value={form.propertyQuality}
              onChange={(e) => setStr('propertyQuality', e.target.value)}
            />
          </div>
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
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
  const indicators = isFii ? FII_INDICATORS : STOCK_INDICATORS
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const partial: Partial<FundamentalSnapshot> = {}
      for (const def of indicators) {
        const raw = form[def.key as string]
        if (raw !== undefined && raw !== '') {
          ;(partial as Record<string, number>)[def.key as string] = Number(raw)
        }
      }
      await onSave(ticker, partial)
      onOpenChange(false)
      setForm({})
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar indicadores — {ticker}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">
          Salva os dados do mês atual no histórico. Deixe em branco para não alterar.
        </p>
        <div className="space-y-3 mt-2">
          {indicators.map((def) => (
            <div key={def.key as string}>
              <label className="text-xs text-muted-foreground mb-1 block">{def.inputLabel}</label>
              <input
                className={inputClass}
                type="number"
                step={def.inputStep}
                placeholder="—"
                value={form[def.key as string] ?? ''}
                onChange={(e) => setForm((p) => ({ ...p, [def.key as string]: e.target.value }))}
              />
            </div>
          ))}
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

/* ─── Asset card ────────────────────────────────────────────────── */

const AssetCard = ({
  asset,
  record,
  fiiData,
  isRefreshing,
  error,
  isFii,
  onRefresh,
  onEditFii,
  onRegister,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  fiiData: FiiManualData | undefined
  isRefreshing: boolean
  error: string | undefined
  isFii: boolean
  onRefresh: () => void
  onEditFii: () => void
  onRegister: () => void
}) => {
  const snapshots = record?.snapshots ?? []
  const current = snapshots.at(-1) ?? null
  const indicators = isFii ? FII_INDICATORS : STOCK_INDICATORS

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
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
            {current?.industry && (
              <p className="text-xs text-muted-foreground/70 truncate">{current.industry}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
              {isRefreshing ? 'Buscando...' : 'Atualizar'}
            </button>
            <button
              onClick={onRegister}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil size={11} />
              Registrar
            </button>
            {record?.updatedAt && (
              <span className="text-xs text-muted-foreground/60">{fmtDate(record.updatedAt)}</span>
            )}
          </div>
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </CardHeader>
      <CardContent>
        <div>
          <PriceRow points={record?.priceHistory ?? []} currentPrice={asset.currentPrice} />
          {snapshots.length > 0
            ? indicators.map((def) => (
                <IndicatorRow key={def.key} def={def} snapshots={snapshots} />
              ))
            : (record?.priceHistory ?? []).length === 0 && (
                <p className="text-xs text-muted-foreground py-2">
                  Nenhum dado. Clique em "Atualizar" para buscar.
                </p>
              )}
        </div>
        {(snapshots.length >= 2 || (record?.priceHistory ?? []).length >= 2) && (
          <p className="text-xs text-muted-foreground/50 mt-2">
            Clique em um indicador para ver o histórico completo
          </p>
        )}
        {isFii && <FiiManualSection ticker={asset.ticker} data={fiiData} onEdit={onEditFii} />}
      </CardContent>
    </Card>
  )
}

/* ─── Main tab ──────────────────────────────────────────────────── */

export const AnalysisTab = ({
  assets,
  fundamentals,
  fiiManual,
  refreshingFundamentals,
  fundamentalErrors,
  refreshFundamentals,
  saveFiiManual,
  saveManualSnapshot,
}: Props) => {
  const [subTab, setSubTab] = useState<'stock' | 'fii'>('stock')
  const [editingFii, setEditingFii] = useState<string | null>(null)
  const [registeringTicker, setRegisteringTicker] = useState<string | null>(null)

  const stocks = assets.filter((a) => a.type === 'stock')
  const fiis = assets.filter((a) => a.type === 'fii')
  const shown = subTab === 'stock' ? stocks : fiis

  const anyRefreshing = shown.some((a) => refreshingFundamentals[a.ticker])

  if (stocks.length === 0 && fiis.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Nenhuma ação BR ou FII na carteira.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
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
        <button
          onClick={() => refreshFundamentals(shown.map((a) => a.ticker))}
          disabled={anyRefreshing || shown.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw size={13} className={anyRefreshing ? 'animate-spin' : ''} />
          Atualizar brapi
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Nenhum ativo nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              record={fundamentals[asset.ticker.toUpperCase()]}
              fiiData={fiiManual[asset.ticker.toUpperCase()]}
              isRefreshing={!!refreshingFundamentals[asset.ticker]}
              error={fundamentalErrors[asset.ticker]}
              isFii={subTab === 'fii'}
              onRefresh={() => refreshFundamentals([asset.ticker])}
              onEditFii={() => setEditingFii(asset.ticker)}
              onRegister={() => setRegisteringTicker(asset.ticker)}
            />
          ))}
        </div>
      )}

      {editingFii && (
        <FiiEditDialog
          ticker={editingFii}
          existing={fiiManual[editingFii.toUpperCase()]}
          open={!!editingFii}
          onOpenChange={(v) => !v && setEditingFii(null)}
          onSave={saveFiiManual}
        />
      )}
      {registeringTicker && (
        <ManualSnapshotDialog
          ticker={registeringTicker}
          isFii={subTab === 'fii'}
          open={!!registeringTicker}
          onOpenChange={(v) => !v && setRegisteringTicker(null)}
          onSave={saveManualSnapshot}
        />
      )}
    </div>
  )
}
