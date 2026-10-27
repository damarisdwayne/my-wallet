import { useCallback, useMemo, useState } from 'react'
import type { Trade } from '@/types'
import { ALL } from '../../../constants'
import { monthKey, monthsOf } from './utils'
import type { TradeTypeFilter } from './utils'

export const usePeriodFilter = (trades: Trade[]) => {
  const [month, setMonth] = useState<string | typeof ALL>(ALL)
  const [type, setType] = useState<TradeTypeFilter>('all')

  const months = useMemo(() => monthsOf(trades.map((t) => t.date)), [trades])

  const matches = useCallback(
    (t: Trade) =>
      (month === ALL || monthKey(t.date) === month) && (type === 'all' || t.type === type),
    [month, type],
  )

  return {
    month,
    setMonth,
    type,
    setType,
    months,
    matches,
    active: month !== ALL || type !== 'all',
  }
}
