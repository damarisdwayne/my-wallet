import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Asset, AssetType, FixedIncomeType, PortfolioCategory, RateType, Trade } from '@/types'
import { typeLabel } from '../constants'

/* ─── Constants ─────────────────────────────────────────────────── */

const TYPE_GROUPS: { label: string; types: AssetType[] }[] = [
  { label: 'Renda Variável BR', types: ['stock', 'fii', 'etf', 'bdr'] },
  { label: 'Internacional', types: ['stock_us'] },
  { label: 'Outros', types: ['crypto', 'fixed_income', 'other'] },
]

const FIXED_INCOME_TYPES: FixedIncomeType[] = [
  'CDB',
  'LCI',
  'LCA',
  'LCE',
  'CRI',
  'CRA',
  'Debenture',
  'Tesouro IPCA+',
  'Tesouro Selic',
  'Tesouro Prefixado',
  'Outros',
]

const RATE_TYPES: { value: RateType; label: string }[] = [
  { value: 'pos_cdi', label: 'CDI' },
  { value: 'ipca_plus', label: 'IPCA+' },
  { value: 'igpm_plus', label: 'IGP-M+' },
  { value: 'pos_selic', label: 'SELIC' },
  { value: 'prefixado', label: 'Prefixado' },
]

const KNOWN_CRYPTOS = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'SOL', name: 'Solana' },
  { ticker: 'BNB', name: 'BNB' },
  { ticker: 'ADA', name: 'Cardano' },
  { ticker: 'XRP', name: 'XRP' },
  { ticker: 'DOT', name: 'Polkadot' },
  { ticker: 'AVAX', name: 'Avalanche' },
  { ticker: 'MATIC', name: 'Polygon' },
  { ticker: 'LINK', name: 'Chainlink' },
  { ticker: 'UNI', name: 'Uniswap' },
  { ticker: 'ATOM', name: 'Cosmos' },
]

type OpMode = 'buy' | 'sell' | 'bonificacao' | 'amortizacao'

const OP_MODES: { value: OpMode; label: string; desc: string }[] = [
  { value: 'buy', label: 'Compra', desc: 'Registrar compra ou adicionar ativo' },
  { value: 'sell', label: 'Venda', desc: 'Registrar venda de ativo' },
  { value: 'bonificacao', label: 'Bonificação', desc: 'Cotas recebidas como bonificação' },
  { value: 'amortizacao', label: 'Amortização', desc: 'Amortização de ativo' },
]

const todayStr = new Date().toISOString().slice(0, 10)

/* ─── Helpers ───────────────────────────────────────────────────── */

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    {children}
  </div>
)

/* ─── Props ─────────────────────────────────────────────────────── */

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: PortfolioCategory[]
  assets: Asset[]
  onAdd: (asset: Asset) => Promise<void>
  onAddTrade: (trade: Omit<Trade, 'id' | 'source'>) => Promise<void>
}

/* ─── Step 0: Op selector ───────────────────────────────────────── */

const OpSelector = ({ onSelect }: { onSelect: (op: OpMode) => void }) => (
  <div className="grid grid-cols-2 gap-2 mt-3">
    {OP_MODES.map((op) => (
      <button
        key={op.value}
        onClick={() => onSelect(op.value)}
        className="py-3 px-3 rounded-md border border-border text-left hover:border-primary/60 hover:bg-muted/40 transition-colors"
      >
        <p className="text-sm font-medium text-foreground">{op.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{op.desc}</p>
      </button>
    ))}
  </div>
)

/* ─── Step 1: Asset type selector (buy only) ────────────────────── */

const TypeSelector = ({ onSelect }: { onSelect: (t: AssetType) => void }) => (
  <div className="space-y-4 mt-2">
    {TYPE_GROUPS.map((group) => (
      <div key={group.label}>
        <p className="text-xs text-muted-foreground mb-2">{group.label}</p>
        <div className="grid grid-cols-4 gap-2">
          {group.types.map((t) => (
            <button
              key={t}
              onClick={() => onSelect(t)}
              className="py-2 px-1 rounded-md border border-border text-xs font-medium text-muted-foreground hover:border-primary/60 hover:text-foreground hover:bg-muted/40 transition-colors text-center"
            >
              {typeLabel[t]}
            </button>
          ))}
        </div>
      </div>
    ))}
  </div>
)

/* ─── Trade form (sell / bonificação / amortização) ─────────────── */

const TradeForm = ({
  opMode,
  assets,
  onSave,
}: {
  opMode: 'sell' | 'bonificacao' | 'amortizacao'
  assets: Asset[]
  onSave: (trade: Omit<Trade, 'id' | 'source'>) => void
}) => {
  const [form, setForm] = useState({ ticker: '', quantity: '', price: '', date: todayStr })
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const canSave = form.ticker.trim() && Number(form.quantity) > 0 && form.date

  const handleSave = () => {
    if (!canSave) return
    const qty = Number(form.quantity)
    const price = Number(form.price)
    const ticker = form.ticker.trim().toUpperCase()
    const type = opMode === 'sell' ? 'sell' : 'buy'
    const label =
      opMode === 'bonificacao'
        ? 'bonificacao'
        : opMode === 'amortizacao'
          ? 'amortizacao'
          : undefined
    onSave({ ticker, type, quantity: qty, price, total: qty * price, date: form.date, label })
  }

  const priceLabel =
    opMode === 'bonificacao' || opMode === 'amortizacao' ? 'Preço (pode ser R$0)' : 'Preço (R$)'

  return (
    <div className="space-y-3 mt-2">
      <Field label="Ativo">
        <input
          list="trade-ticker-list"
          className={inputClass}
          placeholder="Ex: SAPR4"
          value={form.ticker}
          onChange={(e) => set('ticker', e.target.value)}
          autoFocus
        />
        <datalist id="trade-ticker-list">
          {assets.map((a) => (
            <option key={a.id} value={a.ticker} />
          ))}
        </datalist>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantidade">
          <input
            type="number"
            min="0"
            step="any"
            className={inputClass}
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </Field>
        <Field label={priceLabel}>
          <input
            type="number"
            min="0"
            step="any"
            className={inputClass}
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Data">
        <input
          type="date"
          className={inputClass}
          value={form.date}
          onChange={(e) => set('date', e.target.value)}
        />
      </Field>
      <button
        onClick={handleSave}
        disabled={!canSave}
        className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Salvar
      </button>
    </div>
  )
}

/* ─── Step 2: Asset forms ───────────────────────────────────────── */

const StandardForm = ({
  type,
  categories,
  onSave,
}: {
  type: AssetType
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const [form, setForm] = useState({
    ticker: '',
    name: '',
    quantity: '',
    avgPrice: '',
    currentPrice: '',
    targetPercent: '10',
    categoryId: '',
    autoCategory: true,
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const catType = type === 'etf' || type === 'bdr' ? 'stock' : type
  const autoCatId = categories.find((c) => c.type === catType)?.id ?? ''
  const resolvedCatId = form.autoCategory ? autoCatId : form.categoryId
  const resolvedCatName = form.autoCategory
    ? (categories.find((c) => c.id === autoCatId)?.name ?? 'Nenhuma encontrada')
    : (categories.find((c) => c.id === form.categoryId)?.name ?? '—')

  const canSave = form.ticker.trim() && form.name.trim()

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Ticker">
          <input
            className={inputClass}
            placeholder="PETR4"
            value={form.ticker}
            onChange={(e) => set('ticker', e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Nome">
          <input
            className={inputClass}
            placeholder="Petrobras PN"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Field label="Quantidade">
          <input
            className={inputClass}
            type="number"
            min={0}
            placeholder="100"
            value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)}
          />
        </Field>
        <Field label="PM (R$)">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="30.00"
            value={form.avgPrice}
            onChange={(e) => set('avgPrice', e.target.value)}
          />
        </Field>
        <Field label="Atual (R$)">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="35.00"
            value={form.currentPrice}
            onChange={(e) => set('currentPrice', e.target.value)}
          />
        </Field>
      </div>
      <Field label="% alvo na categoria">
        <input
          className={inputClass}
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={form.targetPercent}
          onChange={(e) => set('targetPercent', e.target.value)}
        />
      </Field>
      <div>
        <p className="text-xs text-muted-foreground mb-1">Categoria</p>
        <div className="flex gap-2 mb-2">
          {(['auto', 'manual'] as const).map((m) => (
            <button
              key={m}
              onClick={() => set('autoCategory', m === 'auto' ? 'true' : 'false')}
              className={cn(
                'flex-1 py-1.5 rounded-md text-xs font-medium transition-colors',
                (m === 'auto') === form.autoCategory
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {m === 'auto' ? 'Automático' : 'Manual'}
            </button>
          ))}
        </div>
        {form.autoCategory ? (
          <p className="text-xs px-3 py-2 rounded-md bg-muted text-muted-foreground">
            Detectada: <span className="text-foreground font-medium">{resolvedCatName}</span>
          </p>
        ) : (
          <select
            className={inputClass}
            value={form.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
          >
            <option value="">Selecione...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        onClick={() =>
          canSave &&
          onSave({
            ticker: form.ticker.trim().toUpperCase(),
            name: form.name.trim(),
            type,
            categoryId: resolvedCatId,
            quantity: Number.parseFloat(form.quantity) || 0,
            avgPrice: Number.parseFloat(form.avgPrice) || 0,
            currentPrice: Number.parseFloat(form.currentPrice) || 0,
            targetPercent: Number.parseFloat(form.targetPercent) || 0,
          })
        }
        disabled={!canSave}
        className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Adicionar
      </button>
    </div>
  )
}

const RATE_LABEL: Record<RateType, string> = {
  prefixado: 'Pré',
  pos_cdi: 'Pós CDI',
  ipca_plus: 'IPCA+',
  igpm_plus: 'IGP-M+',
  pos_selic: 'Pós SELIC',
}

const buildFiName = (f: {
  fixedIncomeType: FixedIncomeType
  rateType: RateType
  indexerRate: string
  prefixedRate: string
  issuer: string
  institution: string
  maturityDate: string
}): string => {
  const parts: string[] = [f.fixedIncomeType, RATE_LABEL[f.rateType]]
  const rate = f.rateType === 'prefixado' ? f.prefixedRate : f.indexerRate
  if (rate) parts.push(`${rate}%`)
  const emitter = f.issuer || f.institution
  if (emitter) parts.push(emitter)
  return parts.join(' ')
}

const TESOURO_RATE_TYPE: Partial<Record<FixedIncomeType, RateType>> = {
  'Tesouro IPCA+': 'ipca_plus',
  'Tesouro Selic': 'pos_selic',
  'Tesouro Prefixado': 'prefixado',
}

const isTesourotType = (t: FixedIncomeType) => t in TESOURO_RATE_TYPE

const FixedIncomeForm = ({
  categories,
  onSave,
}: {
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const fiCatId = categories.find((c) => c.type === 'fixed_income')?.id ?? ''
  const [form, setForm] = useState({
    fixedIncomeType: 'CDB' as FixedIncomeType,
    institution: '',
    issuer: '',
    rateType: 'pos_cdi' as RateType,
    indexerRate: '100',
    prefixedRate: '',
    totalInvested: '',
    quantity: '',
    avgPrice: '',
    maturityYear: '',
    operationDate: '',
    maturityDate: '',
    categoryId: fiCatId,
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const isTesouro = isTesourotType(form.fixedIncomeType)

  const handleTypeChange = (t: string) => {
    const ft = t as FixedIncomeType
    const autoRate = TESOURO_RATE_TYPE[ft]
    setForm((p) => ({ ...p, fixedIncomeType: ft, ...(autoRate ? { rateType: autoRate } : {}) }))
  }

  const rateLabel: Record<RateType, string> = {
    prefixado: 'Taxa a.a. (%)',
    pos_cdi: '% do CDI',
    ipca_plus: 'IPCA + (% a.a.)',
    igpm_plus: 'IGP-M + (% a.a.)',
    pos_selic: '% da SELIC',
  }

  const showRateField = !isTesouro || form.rateType !== 'pos_selic'

  const canSave = isTesouro
    ? Number.parseFloat(form.quantity) > 0 && Number.parseFloat(form.avgPrice) > 0
    : Number.parseFloat(form.totalInvested) > 0

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Tipo">
          <select
            className={inputClass}
            value={form.fixedIncomeType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {FIXED_INCOME_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        {isTesouro ? (
          <Field label="Ano de vencimento">
            <input
              className={inputClass}
              placeholder="2029"
              maxLength={4}
              value={form.maturityYear}
              onChange={(e) => set('maturityYear', e.target.value)}
              autoFocus
            />
          </Field>
        ) : (
          <Field label="Instituição">
            <input
              className={inputClass}
              placeholder="Nubank, Inter..."
              value={form.institution}
              onChange={(e) => set('institution', e.target.value)}
            />
          </Field>
        )}
      </div>

      {isTesouro ? (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Quantidade de títulos">
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder="3.69"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
            />
          </Field>
          <Field label="Preço unitário (R$)">
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder="3285.55"
              value={form.avgPrice}
              onChange={(e) => set('avgPrice', e.target.value)}
            />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Total investido (R$)">
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder="5000.00"
              value={form.totalInvested}
              onChange={(e) => set('totalInvested', e.target.value)}
            />
          </Field>
          <Field label="Emissor (opcional)">
            <input
              className={inputClass}
              placeholder="Banco XYZ"
              value={form.issuer}
              onChange={(e) => set('issuer', e.target.value)}
            />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {!isTesouro && (
          <Field label="Tipo de Taxa">
            <select
              className={inputClass}
              value={form.rateType}
              onChange={(e) => set('rateType', e.target.value)}
            >
              {RATE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        {showRateField && (
          <Field
            label={
              isTesouro
                ? form.rateType === 'prefixado'
                  ? 'Taxa prefixada (% a.a.)'
                  : 'Spread (% a.a.)'
                : rateLabel[form.rateType]
            }
          >
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder={form.rateType === 'pos_cdi' ? '110' : '12.5'}
              value={form.rateType === 'prefixado' ? form.prefixedRate : form.indexerRate}
              onChange={(e) =>
                set(form.rateType === 'prefixado' ? 'prefixedRate' : 'indexerRate', e.target.value)
              }
            />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Data de aplicação">
          <input
            className={inputClass}
            type="date"
            value={form.operationDate}
            onChange={(e) => set('operationDate', e.target.value)}
          />
        </Field>
        {!isTesouro && (
          <Field label="Vencimento">
            <input
              className={inputClass}
              type="date"
              value={form.maturityDate}
              onChange={(e) => set('maturityDate', e.target.value)}
            />
          </Field>
        )}
      </div>

      <Field label="Categoria">
        <select
          className={inputClass}
          value={form.categoryId}
          onChange={(e) => set('categoryId', e.target.value)}
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <button
        onClick={() => {
          if (!canSave) return
          if (isTesouro) {
            const qty = Number.parseFloat(form.quantity)
            const pu = Number.parseFloat(form.avgPrice)
            const year = form.maturityYear.trim()
            const yearSuffix = year ? ` ${year}` : ''
            const ticker = `${form.fixedIncomeType.toUpperCase()}${yearSuffix}`
            onSave({
              ticker,
              name: ticker,
              type: 'fixed_income',
              categoryId: form.categoryId,
              quantity: qty,
              avgPrice: pu,
              currentPrice: pu,
              targetPercent: 0,
              fixedIncomeType: form.fixedIncomeType,
              rateType: form.rateType,
              indexerRate:
                form.rateType === 'prefixado'
                  ? undefined
                  : Number.parseFloat(form.indexerRate) || undefined,
              prefixedRate:
                form.rateType === 'prefixado'
                  ? Number.parseFloat(form.prefixedRate) || undefined
                  : undefined,
              operationDate: form.operationDate || undefined,
            })
          } else {
            const invested = Number.parseFloat(form.totalInvested)
            const suffix = form.institution ? `-${form.institution.slice(0, 8).toUpperCase()}` : ''
            const ticker = `${form.fixedIncomeType}${suffix}`
            onSave({
              ticker,
              name: buildFiName(form),
              type: 'fixed_income',
              categoryId: form.categoryId,
              quantity: 1,
              avgPrice: invested,
              currentPrice: invested,
              targetPercent: 0,
              institution: form.institution || undefined,
              fixedIncomeType: form.fixedIncomeType,
              rateType: form.rateType,
              indexerRate:
                form.rateType === 'prefixado'
                  ? undefined
                  : Number.parseFloat(form.indexerRate) || undefined,
              prefixedRate:
                form.rateType === 'prefixado'
                  ? Number.parseFloat(form.prefixedRate) || undefined
                  : undefined,
              maturityDate: form.maturityDate || undefined,
              operationDate: form.operationDate || undefined,
              issuer: form.issuer || undefined,
            })
          }
        }}
        disabled={!canSave}
        className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Adicionar
      </button>
    </div>
  )
}

const CryptoForm = ({
  categories,
  onSave,
}: {
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const cryptoCatId = categories.find((c) => c.type === 'crypto')?.id ?? ''
  const [ticker, setTicker] = useState('')
  const [customTicker, setCustomTicker] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [categoryId, setCategoryId] = useState(cryptoCatId)

  const resolvedTicker = isCustom ? customTicker.toUpperCase() : ticker
  const resolvedName = isCustom
    ? customTicker
    : (KNOWN_CRYPTOS.find((c) => c.ticker === ticker)?.name ?? ticker)
  const canSave =
    resolvedTicker && Number.parseFloat(quantity) > 0 && Number.parseFloat(avgPrice) > 0

  return (
    <div className="space-y-3 mt-2">
      <div>
        <p className="text-xs text-muted-foreground mb-2">Criptomoeda</p>
        <div className="grid grid-cols-4 gap-1.5 mb-2">
          {KNOWN_CRYPTOS.map((c) => (
            <button
              key={c.ticker}
              onClick={() => {
                setIsCustom(false)
                setTicker(c.ticker)
              }}
              className={cn(
                'py-1.5 px-1 rounded-md text-xs font-medium border transition-colors text-left',
                !isCustom && ticker === c.ticker
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/40',
              )}
            >
              <span className="font-bold block">{c.ticker}</span>
              <span className="text-[10px] truncate block">{c.name}</span>
            </button>
          ))}
          <button
            onClick={() => {
              setIsCustom(true)
              setTicker('')
            }}
            className={cn(
              'py-1.5 px-1 rounded-md text-xs font-medium border transition-colors',
              isCustom
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="font-bold block">Outro</span>
            <span className="text-[10px] block">manual</span>
          </button>
        </div>
        {isCustom && (
          <input
            className={inputClass}
            placeholder="DOGE, SHIB..."
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value)}
            autoFocus
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Quantidade">
          <input
            className={inputClass}
            type="number"
            min={0}
            step="any"
            placeholder="0.5"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </Field>
        <Field label="PM em R$">
          <input
            className={inputClass}
            type="number"
            min={0}
            step={0.01}
            placeholder="350000"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Categoria">
        <select
          className={inputClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <button
        onClick={() =>
          canSave &&
          onSave({
            ticker: resolvedTicker,
            name: resolvedName,
            type: 'crypto',
            categoryId,
            quantity: Number.parseFloat(quantity),
            avgPrice: Number.parseFloat(avgPrice),
            currentPrice: Number.parseFloat(avgPrice),
            targetPercent: 0,
          })
        }
        disabled={!canSave}
        className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Adicionar
      </button>
    </div>
  )
}

/* ─── Main dialog ───────────────────────────────────────────────── */

export const AddAssetDialog = ({
  open,
  onOpenChange,
  categories,
  assets,
  onAdd,
  onAddTrade,
}: Props) => {
  const [opMode, setOpMode] = useState<OpMode | null>(null)
  const [selectedType, setSelectedType] = useState<AssetType | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setOpMode(null)
    setSelectedType(null)
  }

  const handleBack = () => {
    if (opMode === 'buy' && selectedType) {
      setSelectedType(null)
    } else {
      setOpMode(null)
    }
  }

  const handleSaveAsset = async (partial: Partial<Asset>) => {
    setSaving(true)
    try {
      const asset: Asset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ticker: partial.ticker ?? '',
        name: partial.name ?? '',
        type: partial.type ?? 'other',
        categoryId: partial.categoryId ?? '',
        quantity: partial.quantity ?? 0,
        avgPrice: partial.avgPrice ?? 0,
        currentPrice: partial.currentPrice ?? 0,
        targetPercent: partial.targetPercent ?? 0,
        ...partial,
      }
      await onAdd(asset)
      if (asset.avgPrice > 0 && asset.quantity > 0) {
        await onAddTrade({
          ticker: asset.ticker,
          type: 'buy',
          quantity: asset.quantity,
          price: asset.avgPrice,
          total: asset.avgPrice * asset.quantity,
          date: asset.operationDate ?? new Date().toISOString().slice(0, 10),
        })
      }
      reset()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTrade = async (trade: Omit<Trade, 'id' | 'source'>) => {
    setSaving(true)
    try {
      await onAddTrade(trade)
      reset()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const opTitles: Record<string, string> = {
    sell: 'Venda',
    bonificacao: 'Bonificação',
    amortizacao: 'Amortização',
  }
  const title = opMode
    ? opMode === 'buy'
      ? selectedType
        ? `Adicionar ${typeLabel[selectedType]}`
        : 'Compra – Tipo de ativo'
      : opTitles[opMode]
    : 'Nova operação'

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {opMode && (
              <button
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Voltar"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        {!opMode && <OpSelector onSelect={setOpMode} />}

        {opMode === 'buy' && !selectedType && <TypeSelector onSelect={setSelectedType} />}

        {opMode === 'buy' &&
          selectedType &&
          selectedType !== 'fixed_income' &&
          selectedType !== 'crypto' && (
            <StandardForm type={selectedType} categories={categories} onSave={handleSaveAsset} />
          )}

        {opMode === 'buy' && selectedType === 'fixed_income' && (
          <FixedIncomeForm categories={categories} onSave={handleSaveAsset} />
        )}

        {opMode === 'buy' && selectedType === 'crypto' && (
          <CryptoForm categories={categories} onSave={handleSaveAsset} />
        )}

        {(opMode === 'sell' || opMode === 'bonificacao' || opMode === 'amortizacao') && (
          <TradeForm opMode={opMode} assets={assets} onSave={handleSaveTrade} />
        )}

        {saving && (
          <DialogFooter>
            <p className="text-xs text-muted-foreground">Salvando...</p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
