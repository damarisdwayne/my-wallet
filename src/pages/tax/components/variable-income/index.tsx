import { useMemo, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { calcMonthlyRV, calcRealizedGains, RV_EXEMPT_TYPES } from '@/lib/ir-calc'
import type { TickerSets } from '@/services/quotes'
import type { Asset, Trade } from '@/types'
import { SummaryCards, MonthlyTable, OperationsDetail, DarfGuide } from './components'

type Props = { year: number; trades: Trade[]; assets: Asset[]; sets?: TickerSets }

export const VariableIncomeSection = ({ year, trades, assets, sets }: Props) => {
  const [showDetails, setShowDetails] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)

  const gains = useMemo(
    () => calcRealizedGains(trades, year, assets, sets).filter((g) => !RV_EXEMPT_TYPES.has(g.assetType)),
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
      <SummaryCards
        totalGain={totalGain}
        totalDarf={totalDarf}
        pendingDarf={pendingDarf}
        isCurrentYear={isCurrentYear}
        currentData={currentData}
        currentMonth={currentMonth}
        activeMonthsCount={activeMonths.length}
      />
      <MonthlyTable monthly={monthly} totalDarf={totalDarf}>
        {activeMonths.length > 0 && (
          <OperationsDetail
            gains={gains}
            filteredGains={filteredGains}
            availableGainTypes={availableGainTypes}
            filterType={filterType}
            onFilterChange={setFilterType}
            showDetails={showDetails}
            onToggle={() => setShowDetails((v) => !v)}
          />
        )}
        <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          Cálculo pelo preço médio ponderado (PME). Day-trade e FII não possuem isenção. Prejuízo de
          anos anteriores não é considerado automaticamente.
        </p>
      </MonthlyTable>
      <DarfGuide />
    </div>
  )
}
