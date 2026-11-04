import { useMemo } from 'react'
import type { Asset, Trade } from '@/types'
import { groupTradesByDay } from '../utils'
import { TradeList } from './trade-list'
import { TradeMoney } from './trade-money'

interface Props {
  trades: Trade[]
  getAsset: (ticker: string) => Asset | undefined
  onDeleteTrade: (tradeId: string) => Promise<void>
  onEditTrade: (tradeId: string, patch: Partial<Trade>) => Promise<void>
}

const formatDayHeader = (date: string) =>
  new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })

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
          <div key={date} className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-3 bg-muted/40 px-4 py-2">
              <span className="text-sm font-semibold capitalize text-foreground">
                {formatDayHeader(date)}
              </span>
              <span className="text-xs text-muted-foreground">{items.length} op.</span>
              <div className="ml-auto flex items-center gap-3 text-xs tabular-nums">
                {bought > 0 && <TradeMoney brl={bought} className="text-success" />}
                {sold > 0 && <TradeMoney brl={sold} className="text-destructive" />}
              </div>
            </div>
            <div className="border-t border-border">
              <TradeList
                items={items}
                getAsset={getAsset}
                byDay
                onDeleteTrade={onDeleteTrade}
                onEditTrade={onEditTrade}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
