import { useMemo } from 'react'
import { getDividendBrl } from '@/lib/utils'
import type { Dividend } from '@/types'
import { groupByDay } from '../../utils'
import { DayCard } from '../day-card'
import { TradeMoney } from '../trade-money'
import { DividendList } from './dividend-list'

interface Props {
  dividends: Dividend[]
  usdRate: number
  onDelete: (id: string) => void
}

const byTicker = (a: Dividend, b: Dividend) => a.ticker.localeCompare(b.ticker)

export const DividendTimeline = ({ dividends, usdRate, onDelete }: Props) => {
  const days = useMemo(() => groupByDay(dividends, (d) => d.paymentDate, byTicker), [dividends])

  return (
    <div className="space-y-3">
      {days.map(({ date, items }) => (
        <DayCard
          key={date}
          date={date}
          count={`${items.length} provento(s)`}
          summary={
            <TradeMoney
              brl={items.reduce((s, d) => s + getDividendBrl(d, usdRate), 0)}
              className="text-success"
            />
          }
        >
          <DividendList items={items} usdRate={usdRate} onDelete={onDelete} />
        </DayCard>
      ))}
    </div>
  )
}
