import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { buildPositions } from '@/lib/ir-calc'
import { formatCurrency, formatQuantity } from '@/lib/utils'
import type { TickerSets } from '@/services/quotes'
import type { Asset, Trade } from '@/types'
import { assetTypeLabel } from '../constants'
import { AmountBadge, EmptyRow, Section, Td, Th, TypeFilterChips } from './ui'

type Props = {
  year: number
  trades: Trade[]
  assets: Asset[]
  sets?: TickerSets
}

export const AssetsSection = ({ year, trades, assets, sets }: Props) => {
  const [filterType, setFilterType] = useState<string | null>(null)

  const currentDate = `${year}-12-31`
  const priorDate = `${year - 1}-12-31`

  const current = buildPositions(trades, currentDate, assets, sets)
  const prior = buildPositions(trades, priorDate, assets, sets)

  const priorMap = Object.fromEntries(prior.map((p) => [p.ticker, p.totalCost]))

  const allRows = current.map((p) => ({ ...p, priorCost: priorMap[p.ticker] ?? 0 }))

  const tickers = new Set(current.map((p) => p.ticker))
  for (const p of prior) {
    if (!tickers.has(p.ticker)) {
      allRows.push({ ...p, quantity: 0, avgCost: 0, totalCost: 0, priorCost: p.totalCost })
    }
  }
  allRows.sort((a, b) => a.ticker.localeCompare(b.ticker))

  const availableTypes = [...new Set(allRows.map((r) => r.assetType))].sort()
  const rows = filterType ? allRows.filter((r) => r.assetType === filterType) : allRows

  const totalCurrent = rows.reduce((s, r) => s + r.totalCost, 0)
  const totalPrior = rows.reduce((s, r) => s + r.priorCost, 0)

  return (
    <Section
      title="Bens e Direitos"
      subtitle={`Posição em 31/12/${year}`}
      badge={
        <div className="flex gap-2">
          <AmountBadge label={`31/12/${year - 1}`} value={totalPrior} />
          <AmountBadge label={`31/12/${year}`} value={totalCurrent} variant="success" />
        </div>
      }
    >
      {availableTypes.length > 1 && (
        <TypeFilterChips types={availableTypes} active={filterType} onChange={setFilterType} />
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Grupo/Código</Th>
              <Th>Ticker</Th>
              <Th>Tipo</Th>
              <Th right>Qtd.</Th>
              <Th right>PM Custo</Th>
              <Th right>{`31/12/${year - 1}`}</Th>
              <Th right>{`31/12/${year}`}</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <EmptyRow cols={7} message="Nenhuma posição encontrada para o ano selecionado." />
            ) : (
              rows.map((r, i) => (
                <tr
                  key={`${r.ticker}-${i}`}
                  className="border-t border-border/50 hover:bg-muted/20"
                >
                  <Td className="text-muted-foreground">
                    {r.dirpfGroup}/{r.dirpfCode}
                  </Td>
                  <Td className="font-semibold text-foreground">{r.ticker}</Td>
                  <Td>
                    <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {assetTypeLabel[r.assetType] ?? r.assetType}
                    </span>
                  </Td>
                  <Td right>{r.quantity > 0 ? formatQuantity(r.quantity) : '—'}</Td>
                  <Td right className="text-muted-foreground">
                    {r.avgCost > 0 ? formatCurrency(r.avgCost) : '—'}
                  </Td>
                  <Td right>{r.priorCost > 0 ? formatCurrency(r.priorCost) : '—'}</Td>
                  <Td
                    right
                    className={
                      r.totalCost > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                    }
                  >
                    {r.totalCost > 0 ? formatCurrency(r.totalCost) : '—'}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
        <AlertCircle size={13} className="mt-0.5 shrink-0" />O custo é calculado pelo preço médio
        ponderado das compras registradas. Bonificações recebidas são incluídas na quantidade sem
        acréscimo ao custo.
      </p>
    </Section>
  )
}
