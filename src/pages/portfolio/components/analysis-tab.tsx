import { useCallback, useEffect, useState } from 'react'
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Pencil,
  RefreshCw,
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
import { fetchCvmDocuments } from '@/services/cvm'
import { formatCurrency } from '@/lib/utils'
import type {
  Asset,
  CvmDocument,
  FiiManualData,
  FundamentalRecord,
  FundamentalSnapshot,
  PricePoint,
} from '@/types'

/* ─── Shared ────────────────────────────────────────────────────── */

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  assets: Asset[]
  fundamentals: Record<string, FundamentalRecord>
  fiiManual: Record<string, FiiManualData>
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
  const entries = [...snapshots].reverse().filter((s) => (s[def.key] as number | null) !== null)
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
          Salva os dados do mês atual. Deixe em branco para não alterar.
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
          <DialogTitle>Dados manuais FII — {ticker}</DialogTitle>
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

/* ─── CVM documents ─────────────────────────────────────────────── */

const CATEGORY_BADGE: Record<string, string> = {
  'Fato Relevante': 'bg-destructive/15 text-destructive',
  'Comunicado ao Mercado': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  'Relatório Gerencial': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
}

const useDocuments = (assetName: string) => {
  const [docs, setDocs] = useState<CvmDocument[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchCvmDocuments(assetName).then(
      (data) => {
        if (!cancelled) {
          setDocs(data)
          setError(null)
          setLoading(false)
        }
      },
      (e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Erro ao buscar documentos')
          setLoading(false)
        }
      },
    )
    return () => {
      cancelled = true
    }
  }, [assetName, tick])

  const reload = useCallback(() => {
    setLoading(true)
    setTick((n) => n + 1)
  }, [])

  return { docs, loading, error, reload }
}

const DocumentsList = ({
  docs,
  loading,
  error,
}: {
  docs: CvmDocument[] | null
  loading: boolean
  error: string | null
}) => (
  <div>
    {error && <p className="text-xs text-destructive mb-2">{error}</p>}
    {loading && docs === null && (
      <p className="text-xs text-muted-foreground">Buscando documentos...</p>
    )}
    {!loading && docs !== null && docs.length === 0 && (
      <p className="text-xs text-muted-foreground italic">Nenhum documento encontrado.</p>
    )}
    {docs !== null && docs.length > 0 && (
      <div className="space-y-2">
        {docs.map((d, i) => (
          <a
            key={i}
            href={d.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-2 group hover:bg-muted/50 rounded-md p-2 -mx-2 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${CATEGORY_BADGE[d.category] ?? 'bg-muted text-muted-foreground'}`}
                >
                  {d.category}
                </span>
                <span className="text-[10px] text-muted-foreground">{fmtDate(d.deliveryDate)}</span>
              </div>
              {(d.subject || d.type) && (
                <p className="text-xs text-foreground line-clamp-2">{d.subject || d.type}</p>
              )}
            </div>
            <ExternalLink
              size={11}
              className="text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-1"
            />
          </a>
        ))}
      </div>
    )}
  </div>
)

/* ─── FII manual section (read-only) ────────────────────────────── */

const FiiManualReadSection = ({
  data,
  onEdit,
}: {
  data: FiiManualData | undefined
  onEdit: () => void
}) => (
  <div>
    <div className="flex justify-end mb-2">
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
            <span className="text-xs font-medium">{data.vacancy.toFixed(1)}%</span>
          </div>
        )}
        {data.propertyCount !== null && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Imóveis</span>
            <span className="text-xs font-medium">{data.propertyCount}</span>
          </div>
        )}
        {data.manager && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Gestora</span>
            <span className="text-xs font-medium truncate ml-2">{data.manager}</span>
          </div>
        )}
        {data.location && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Localização</span>
            <span className="text-xs font-medium">{data.location}</span>
          </div>
        )}
        {data.adminFee !== null && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Taxa adm.</span>
            <span className="text-xs font-medium">{data.adminFee.toFixed(2)}% a.a.</span>
          </div>
        )}
        {data.avgContractDuration && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Prazo médio</span>
            <span className="text-xs font-medium">{data.avgContractDuration}</span>
          </div>
        )}
        {data.propertyQuality && (
          <div className="flex justify-between py-0.5">
            <span className="text-xs text-muted-foreground">Qualidade</span>
            <span className="text-xs font-medium">{data.propertyQuality}</span>
          </div>
        )}
      </div>
    ) : (
      <p className="text-xs text-muted-foreground italic">Nenhum dado preenchido.</p>
    )}
  </div>
)

/* ─── Asset detail view (inline) ───────────────────────────────── */

const AssetDetailView = ({
  asset,
  record,
  fiiData,
  isFii,
  onBack,
  onSaveSnapshot,
  onSaveFii,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  fiiData: FiiManualData | undefined
  isFii: boolean
  onBack: () => void
  onSaveSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  onSaveFii: (data: FiiManualData) => Promise<void>
}) => {
  const [registerOpen, setRegisterOpen] = useState(false)
  const [fiiEditOpen, setFiiEditOpen] = useState(false)
  const {
    docs,
    loading: docsLoading,
    error: docsError,
    reload: reloadDocs,
  } = useDocuments(asset.name)
  const snapshots = record?.snapshots ?? []
  const current = snapshots.at(-1) ?? null
  const indicators = isFii ? FII_INDICATORS : STOCK_INDICATORS

  return (
    <>
      <div className="space-y-5">
        {/* Top bar: back + name + action */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <h2 className="text-xl font-bold text-foreground shrink-0">{asset.ticker}</h2>
              <span className="text-muted-foreground hidden sm:block">·</span>
              <p className="text-sm text-muted-foreground truncate hidden sm:block">{asset.name}</p>
              {current?.sector && (
                <Badge variant="secondary" className="shrink-0">
                  {current.sector}
                </Badge>
              )}
            </div>
          </div>
          <button
            onClick={() => setRegisterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
          >
            <Pencil size={13} />
            Registrar
          </button>
        </div>

        {/* Price + industry row */}
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(asset.currentPrice)}
          </span>
          {current?.industry && (
            <span className="text-xs text-muted-foreground/70">{current.industry}</span>
          )}
        </div>

        {/* Indicators grid */}
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Indicadores
          </p>
          {snapshots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <PriceCard points={record?.priceHistory ?? []} currentPrice={asset.currentPrice} />
              {indicators.map((def) => (
                <IndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              <PriceCard points={record?.priceHistory ?? []} currentPrice={asset.currentPrice} />
              <p className="text-xs text-muted-foreground col-span-full mt-1">
                Nenhum indicador registrado. Clique em "Registrar" para adicionar.
              </p>
            </div>
          )}
        </div>

        {/* Secondary: FII manual + CVM docs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {isFii && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Dados FII
              </p>
              <div className="rounded-lg border border-border p-3">
                <FiiManualReadSection data={fiiData} onEdit={() => setFiiEditOpen(true)} />
              </div>
            </div>
          )}
          <div className={isFii ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Documentos CVM
              </p>
              <button
                onClick={reloadDocs}
                disabled={docsLoading}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors disabled:opacity-40"
              >
                <RefreshCw size={11} className={docsLoading ? 'animate-spin' : ''} />
              </button>
            </div>
            <div className="rounded-lg border border-border p-3">
              <DocumentsList docs={docs} loading={docsLoading} error={docsError} />
            </div>
          </div>
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
        <FiiEditDialog
          ticker={asset.ticker}
          existing={fiiData}
          open={fiiEditOpen}
          onOpenChange={setFiiEditOpen}
          onSave={onSaveFii}
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
  const indicators = isFii ? FII_INDICATORS : STOCK_INDICATORS

  // Show up to 2 key indicators at a glance
  const keyDefs = isFii
    ? indicators.filter((d) => d.key === 'dividendYield' || d.key === 'priceToBook')
    : indicators.filter((d) => d.key === 'priceEarnings' || d.key === 'dividendYield')

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
              if (val === null) return null
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
  fiiManual,
  saveFiiManual,
  saveManualSnapshot,
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
        fiiData={fiiManual[selectedAsset.ticker.toUpperCase()]}
        isFii={subTab === 'fii'}
        onBack={() => setSelectedTicker(null)}
        onSaveSnapshot={saveManualSnapshot}
        onSaveFii={saveFiiManual}
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
