import { formatCurrency } from '@/lib/utils'
import type { FundamentalSnapshot } from '@/types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components'

/* ─── Calculations ─── */

const calcGraham = (price: number, pe: number, pb: number) => {
  if (pe <= 0 || pb <= 0 || price <= 0) return null
  const lpa = price / pe
  const vpa = price / pb
  if (lpa <= 0 || vpa <= 0) return null
  return Math.sqrt(22.5 * lpa * vpa)
}

const DY_TARGETS = [
  { label: 'Teto 8%', value: 0.08 },
  { label: 'Teto 10%', value: 0.1 },
  { label: 'Teto 12%', value: 0.12 },
]

const calcFiiFairPrice = (price: number, dyPct: number, target: number) => {
  if (dyPct <= 0 || price <= 0) return null
  return (price * (dyPct / 100)) / target
}

/* ─── Shared ─── */

type Metric = { label: string; fair: number; tooltip: string }

const upsideColor = (u: number) =>
  u > 15 ? 'text-emerald-400' : u < -15 ? 'text-red-400' : 'text-muted-foreground'

const verdictDot = (u: number) =>
  u > 15 ? 'bg-emerald-400/80' : u < -15 ? 'bg-red-400/80' : 'bg-muted-foreground/40'

const ValuationStrip = ({ metrics, currentPrice }: { metrics: Metric[]; currentPrice: number }) => (
  <div className="flex flex-wrap gap-px rounded-lg overflow-hidden border border-border/60">
    {metrics.map(({ label, fair, tooltip }, i) => {
      const upside = ((fair - currentPrice) / currentPrice) * 100
      return (
        <TooltipProvider key={label} delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`flex-1 min-w-22.5 flex flex-col gap-0.5 px-3 py-2 bg-card hover:bg-muted/30 transition-colors cursor-default ${i > 0 ? 'border-l border-border/60' : ''}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${verdictDot(upside)}`} />
                  <span className="text-[10px] text-muted-foreground/70 truncate">{label}</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {formatCurrency(fair)}
                </span>
                <span className={`text-[10px] font-medium ${upsideColor(upside)}`}>
                  {upside >= 0 ? '+' : ''}
                  {upside.toFixed(1)}%
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs max-w-xs">
              {tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    })}
  </div>
)

/* ─── Stock ─── */

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
  if (!graham) return null

  const lpa = currentPrice / pe
  const vpa = currentPrice / pb

  return (
    <ValuationStrip
      currentPrice={currentPrice}
      metrics={[
        {
          label: 'Graham',
          fair: graham,
          tooltip: `LPA R$ ${lpa.toFixed(2)} · VPA R$ ${vpa.toFixed(2)} · √(22,5 × LPA × VPA)`,
        },
      ]}
    />
  )
}

/* ─── FII ─── */

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
  const metrics: Metric[] = []

  if (dy > 0) {
    DY_TARGETS.forEach(({ label, value }) => {
      const fair = calcFiiFairPrice(currentPrice, dy, value)
      if (fair)
        metrics.push({
          label,
          fair,
          tooltip: `DY atual ${dy.toFixed(2)}% ÷ alvo ${(value * 100).toFixed(0)}%`,
        })
    })
  }

  if (pb > 0) {
    const vpa = currentPrice / pb
    metrics.push({
      label: 'P/VP = 1',
      fair: vpa,
      tooltip: `VPA R$ ${vpa.toFixed(2)} · P/VP atual ${pb.toFixed(2)}x`,
    })
  }

  if (metrics.length === 0) return null
  return <ValuationStrip currentPrice={currentPrice} metrics={metrics} />
}

/* ─── Card badge ─── */

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

  let fair: number | null = null
  let label = ''

  if (isFii) {
    fair = calcFiiFairPrice(currentPrice, snapshot.dividendYield ?? 0, 0.08)
    label = 'Teto 8%'
  } else {
    fair = calcGraham(currentPrice, snapshot.priceEarnings ?? 0, snapshot.priceToBook ?? 0)
    label = 'Graham'
  }

  if (!fair) return null
  const upside = ((fair - currentPrice) / currentPrice) * 100

  return (
    <div className="mt-2 pt-2 border-t border-border/50">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs font-medium ${upsideColor(upside)}`}>
        {formatCurrency(fair)}{' '}
        <span className="text-[10px]">
          ({upside >= 0 ? '+' : ''}
          {upside.toFixed(1)}%)
        </span>
      </p>
    </div>
  )
}
