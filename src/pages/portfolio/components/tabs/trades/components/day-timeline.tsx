import { useMemo } from 'react'
import type { Asset, Trade } from '@/types'
import { groupTradesByDay } from '../utils'
import { DayCard } from './day-card'
import { TradeList } from './trade-list'
import { TradeMoney } from './trade-money'

interface Props {
  trades: Trade[]
  getAsset: (ticker: string) => Asset | undefined
  onDeleteTrade: (tradeId: string) => Promise<void>
  onEditTrade: (tradeId: string, patch: Partial<Trade>) => Promise<void>
}

const sumTotal = (items: Trade[], type: Trade['type']) =>
  items.filter((t) => t.type === type).reduce((s, t) => s + t.total, 0)

export const DayTimeline = ({ trades, getAsset, onDeleteTrade, onEditTrade }: Props) => {
  const days = useMemo(() => groupTradesByDay(trades), [trades])

  return (
    <div className="space-y-3">
      {days.map(({ date, items }) => {
        const bought = sumTotal(items, 'buy')
        const sold = sumTotal(items, 'sell')
        return (
          <DayCard
            key={date}
            date={date}
            count={`${items.length} op.`}
            summary={
              <>
                {bought > 0 && <TradeMoney brl={bought} className="text-success" />}
                {sold > 0 && <TradeMoney brl={sold} className="text-destructive" />}
              </>
            }
          >
            <TradeList
              items={items}
              getAsset={getAsset}
              byDay
              onDeleteTrade={onDeleteTrade}
              onEditTrade={onEditTrade}
            />
          </DayCard>
        )
      })}
    </div>
  )
}
