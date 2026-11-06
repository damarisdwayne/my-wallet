import { useEffect, useMemo, useState } from 'react'
import { deleteDividend, subscribeToAllDividends } from '@/services/dividends'
import { formatCurrency, getDividendBrl } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useDisplayCurrency } from '@/store/display-currency'
import type { Dividend } from '@/types'
import { THIS_YEAR } from '@/pages/dividends/constants'
import { ALL } from '../../../../../constants'
import { formatMonth, monthKey, monthsOf } from '../../utils'
import { MonthPicker } from '../month-picker'
import { ChipRow } from './chip-row'
import { DividendTimeline } from './dividend-timeline'

export const DividendsSection = () => {
  const { user } = useAuth()
  const { usdRate } = useDisplayCurrency()
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState<string>(THIS_YEAR)
  const [month, setMonth] = useState<string>(ALL)

  useEffect(() => {
    if (!user) return
    return subscribeToAllDividends(user.uid, (data) => {
      setDividends(data)
      setLoading(false)
    })
  }, [user])

  const yearOptions = useMemo(() => {
    // O ano atual entra sempre, mesmo sem provento ainda, pra não ficar selecionado um chip inexistente.
    const set = new Set(dividends.map((d) => d.paymentDate.slice(0, 4)))
    set.add(THIS_YEAR)
    const years = [...set].sort((a, b) => b.localeCompare(a))
    return [{ value: ALL, label: 'Todos' }, ...years.map((y) => ({ value: y, label: y }))]
  }, [dividends])

  const inYear = useMemo(
    () => (year === ALL ? dividends : dividends.filter((d) => d.paymentDate.startsWith(year))),
    [dividends, year],
  )
  const monthOptions = useMemo(() => monthsOf(inYear.map((d) => d.paymentDate)), [inYear])
  const filtered = useMemo(
    () => (month === ALL ? inYear : inYear.filter((d) => monthKey(d.paymentDate) === month)),
    [inYear, month],
  )

  const selectYear = (value: string) => {
    setYear(value)
    setMonth(ALL)
  }

  const emptyPeriod = month !== ALL ? formatMonth(month) : year !== ALL ? year : null

  const total = useMemo(
    () => filtered.reduce((s, d) => s + getDividendBrl(d, usdRate), 0),
    [filtered, usdRate],
  )
  const dayCount = useMemo(() => new Set(filtered.map((d) => d.paymentDate)).size, [filtered])

  if (loading)
    return <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>

  if (dividends.length === 0)
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Nenhum provento registrado. Importe um relatório de movimentação da B3 ou um extrato do
        Inter.
      </p>
    )

  return (
    <div className="space-y-4">
      <ChipRow options={yearOptions} selected={year} onSelect={selectYear} />
      <div className="flex flex-wrap items-center gap-2">
        <MonthPicker
          month={month}
          months={monthOptions}
          onChange={setMonth}
          allLabel="Todos os meses"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {dayCount} dia(s) · {filtered.length} provento(s) ·{' '}
        <span className="font-medium text-success">{formatCurrency(total)}</span>
      </p>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {emptyPeriod ? `Nenhum provento em ${emptyPeriod}.` : 'Nenhum provento.'}
        </p>
      ) : (
        <DividendTimeline
          dividends={filtered}
          usdRate={usdRate}
          onDelete={(id) => user && deleteDividend(user.uid, id)}
        />
      )}
    </div>
  )
}
