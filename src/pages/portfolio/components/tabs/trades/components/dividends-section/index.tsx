import { useEffect, useMemo, useState } from 'react'
import { deleteDividend, subscribeToAllDividends } from '@/services/dividends'
import { formatCurrency, getDividendBrl } from '@/lib/utils'
import { useAuth } from '@/store/auth'
import { useDisplayCurrency } from '@/store/display-currency'
import type { Dividend } from '@/types'
import { THIS_YEAR } from '@/pages/dividends/constants'
import { ALL } from '../../../../../constants'
import { ChipRow } from './chip-row'
import { DividendTickerRow } from './ticker-row'

export const DividendsSection = () => {
  const { user } = useAuth()
  const { usdRate } = useDisplayCurrency()
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState<string>(THIS_YEAR)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

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

  const filtered = useMemo(
    () => (year === ALL ? dividends : dividends.filter((d) => d.paymentDate.startsWith(year))),
    [dividends, year],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, Dividend[]>()
    for (const d of filtered) {
      const list = map.get(d.ticker) ?? []
      list.push(d)
      map.set(d.ticker, list)
    }
    return [...map.entries()]
      .map(([ticker, items]) => ({
        ticker,
        items,
        total: items.reduce((s, d) => s + getDividendBrl(d, usdRate), 0),
        // Só soma em dólar quando todos os proventos do ticker têm o valor original em USD.
        totalUsd: items.every((d) => d.amountUsd != null)
          ? items.reduce((s, d) => s + (d.amountUsd ?? 0), 0)
          : undefined,
      }))
      .sort((a, b) => a.ticker.localeCompare(b.ticker))
  }, [filtered, usdRate])

  const total = grouped.reduce((s, g) => s + g.total, 0)

  const toggle = (ticker: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(ticker)) next.delete(ticker)
      else next.add(ticker)
      return next
    })

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
      <ChipRow options={yearOptions} selected={year} onSelect={setYear} />

      <p className="text-xs text-muted-foreground">
        {grouped.length} ativo(s) · {filtered.length} provento(s) ·{' '}
        <span className="font-medium text-success">{formatCurrency(total)}</span>
      </p>

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {year === ALL ? 'Nenhum provento.' : `Nenhum provento em ${year}.`}
        </p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          {grouped.map((g, idx) => (
            <div key={g.ticker} className={idx > 0 ? 'border-t border-border' : undefined}>
              <DividendTickerRow
                ticker={g.ticker}
                items={g.items}
                total={g.total}
                totalUsd={g.totalUsd}
                usdRate={usdRate}
                isExpanded={expanded.has(g.ticker)}
                onToggle={toggle}
                onDelete={(id) => user && deleteDividend(user.uid, id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
