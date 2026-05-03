import { HelpCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { FundamentalSnapshot } from '@/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components'

/* ─── Graham ─── */

const calcGraham = (price: number, pe: number, pb: number) => {
  if (pe <= 0 || pb <= 0 || price <= 0) return null
  const lpa = price / pe
  const vpa = price / pb
  if (lpa <= 0 || vpa <= 0) return null
  return Math.sqrt(22.5 * lpa * vpa)
}

/* ─── FII DY ─── */
const DY_TARGETS = [
  { label: '8%', value: 0.08 },
  { label: '10%', value: 0.1 },
  { label: '12%', value: 0.12 },
]

const calcFiiFairPrice = (price: number, dyPct: number, target: number) => {
  if (dyPct <= 0 || price <= 0) return null
  const annualDiv = price * (dyPct / 100)
  return annualDiv / target
}

/* ─── Shared UI ─── */

const Verdict = ({ upside }: { upside: number }) => {
  if (upside > 15)
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
        Barato
      </span>
    )
  if (upside < -15)
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
        Caro
      </span>
    )
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      Justo
    </span>
  )
}

const PriceRow = ({
  label,
  fairPrice,
  currentPrice,
  tooltip,
}: {
  label: string
  fairPrice: number
  currentPrice: number
  tooltip?: string
}) => {
  const upside = ((fairPrice - currentPrice) / currentPrice) * 100
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-muted-foreground">{label}</span>
        {tooltip && (
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  <HelpCircle size={11} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs ${upside >= 0 ? 'text-success' : 'text-destructive'}`}>
          {upside >= 0 ? '+' : ''}
          {upside.toFixed(1)}%
        </span>
        <span className="text-sm font-semibold text-foreground">{formatCurrency(fairPrice)}</span>
        <Verdict upside={upside} />
      </div>
    </div>
  )
}

/* ─── Stock Valuation ─── */

export const StockValuation = ({
  currentPrice,
  snapshot,
}: {
  currentPrice: number
  snapshot: FundamentalSnapshot | null
}) => {
  if (!snapshot) return null
  const pe = snapshot.priceEarnings ?? 0
  const pb = snapshot.priceToBook ?? 0
  const graham = calcGraham(currentPrice, pe, pb)

  if (!graham) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Valuation
        </p>
        <p className="text-xs text-muted-foreground italic">
          Registre P/L e P/VP para calcular o preço justo de Graham.
        </p>
      </div>
    )
  }

  const lpa = currentPrice / pe
  const vpa = currentPrice / pb

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Valuation
      </p>
      <PriceRow
        label="Graham √(22,5 × LPA × VPA)"
        fairPrice={graham}
        currentPrice={currentPrice}
        tooltip={`LPA = R$ ${lpa.toFixed(2)} · VPA = R$ ${vpa.toFixed(2)} · Fórmula: √(22,5 × ${lpa.toFixed(2)} × ${vpa.toFixed(2)})`}
      />
      <div className="pt-1 text-xs text-muted-foreground/60">
        LPA {formatCurrency(lpa)} · VPA {formatCurrency(vpa)}
      </div>
    </div>
  )
}

/* ─── FII Valuation ─── */

export const FiiValuation = ({
  currentPrice,
  snapshot,
}: {
  currentPrice: number
  snapshot: FundamentalSnapshot | null
}) => {
  if (!snapshot) return null
  const dy = snapshot.dividendYield ?? 0
  const pb = snapshot.priceToBook ?? 0

  const hasDy = dy > 0
  const hasPb = pb > 0

  if (!hasDy && !hasPb) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Valuation
        </p>
        <p className="text-xs text-muted-foreground italic">
          Registre DY e/ou P/VP para calcular os preços de referência.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-0.5">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Valuation
      </p>

      {hasDy &&
        DY_TARGETS.map(({ label, value }) => {
          const fair = calcFiiFairPrice(currentPrice, dy, value)
          if (!fair) return null
          return (
            <PriceRow
              key={label}
              label={`Preço Teto (DY ${label})`}
              fairPrice={fair}
              currentPrice={currentPrice}
              tooltip={`Dividendo anual estimado ÷ ${label} de DY alvo. DY atual: ${dy.toFixed(2)}%`}
            />
          )
        })}

      {hasPb &&
        (() => {
          const vpa = currentPrice / pb
          const fairPb1 = vpa * 1.0
          return (
            <PriceRow
              label="Valor Patrimonial (P/VP = 1)"
              fairPrice={fairPb1}
              currentPrice={currentPrice}
              tooltip={`VPA = R$ ${vpa.toFixed(2)} · Fundo negociado a P/VP ${pb.toFixed(2)}x`}
            />
          )
        })()}
    </div>
  )
}

/* ─── Compact badge for card ─── */

export const ValuationBadge = ({
  currentPrice,
  snapshot,
  isFii,
}: {
  currentPrice: number
  snapshot: FundamentalSnapshot | null
  isFii: boolean
}) => {
  if (!snapshot) return null

  let fairPrice: number | null = null
  let label = ''

  if (isFii) {
    const dy = snapshot.dividendYield ?? 0
    fairPrice = calcFiiFairPrice(currentPrice, dy, 0.08)
    label = 'P. Teto (8%)'
  } else {
    const pe = snapshot.priceEarnings ?? 0
    const pb = snapshot.priceToBook ?? 0
    fairPrice = calcGraham(currentPrice, pe, pb)
    label = 'Graham'
  }

  if (!fairPrice) return null

  const upside = ((fairPrice - currentPrice) / currentPrice) * 100
  const color =
    upside > 15 ? 'text-success' : upside < -15 ? 'text-destructive' : 'text-muted-foreground'

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs font-medium ${color}`}>
        {formatCurrency(fairPrice)}{' '}
        <span className="text-[10px]">
          ({upside >= 0 ? '+' : ''}
          {upside.toFixed(1)}%)
        </span>
      </p>
    </div>
  )
}
