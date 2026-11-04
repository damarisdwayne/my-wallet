import { useState } from 'react'
import { cn, formatQuantity } from '@/lib/utils'
import { getFiLabel } from '@/lib/fi'
import type { Asset, Trade } from '@/types'
import { tradeLabel, tradeColor, sourceLabel } from '../utils'
import { DeleteControl, EditButton } from './trade-actions'
import { EditTradeDialog } from './edit-trade-dialog'
import { TradeMoney } from './trade-money'

interface Props {
  items: Trade[]
  getAsset: (ticker: string) => Asset | undefined
  /** Shows the ticker column and hides the date one — used by the day-grouped timeline. */
  byDay?: boolean
  onDeleteTrade: (tradeId: string) => Promise<void>
  onEditTrade: (tradeId: string, patch: Partial<Trade>) => Promise<void>
}

const formatDate = (date: string) =>
  date ? new Date(date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'

const tickerName = (t: Trade, asset: Asset | undefined) =>
  asset?.type === 'fixed_income' ? getFiLabel(asset) : t.ticker

const MiniLabel = ({ children }: { children: string }) => (
  <p className="text-muted-foreground/60 uppercase tracking-wide text-[9px]">{children}</p>
)

const TypeBadge = ({ trade }: { trade: Trade }) => (
  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', tradeColor(trade))}>
    {tradeLabel(trade)}
  </span>
)

export const TradeList = ({ items, getAsset, byDay, onDeleteTrade, onEditTrade }: Props) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null)

  const handleDelete = (id: string) => {
    onDeleteTrade(id)
    setConfirmDeleteId(null)
  }

  const actions = (t: Trade) => (
    <div className="flex items-center justify-end gap-0.5">
      <EditButton onClick={() => setEditingTrade(t)} />
      <DeleteControl
        tradeId={t.id}
        confirmDeleteId={confirmDeleteId}
        onDelete={handleDelete}
        onConfirm={setConfirmDeleteId}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  )

  return (
    <>
      <div className="md:hidden divide-y divide-border/60">
        {items.map((t) => {
          const asset = getAsset(t.ticker)
          return (
            <div key={t.id} className="px-4 py-2.5 hover:bg-accent/20 transition-colors">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {byDay ? (
                    <span className="truncate text-sm font-semibold text-foreground">
                      {tickerName(t, asset)}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatDate(t.date)}
                    </span>
                  )}
                  <TypeBadge trade={t} />
                </div>
                {actions(t)}
              </div>
              <div className="mt-1.5 flex items-start justify-between text-xs">
                <div>
                  <MiniLabel>Qtd</MiniLabel>
                  <p className="tabular-nums text-foreground">
                    {formatQuantity(t.quantity, asset?.type)}
                  </p>
                </div>
                <div>
                  <MiniLabel>Preço</MiniLabel>
                  <TradeMoney
                    brl={t.price}
                    usd={t.priceUsd}
                    className="tabular-nums text-muted-foreground"
                  />
                </div>
                <div>
                  <MiniLabel>Total</MiniLabel>
                  <TradeMoney
                    brl={t.total}
                    usd={t.totalUsd}
                    className="tabular-nums font-medium text-foreground"
                  />
                </div>
                <div>
                  <MiniLabel>Origem</MiniLabel>
                  <p className="text-muted-foreground">{sourceLabel(t)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <table className="hidden md:table w-full text-sm">
        <thead>
          <tr className="text-left text-muted-foreground bg-muted/30">
            <th className="px-4 py-2 font-medium text-xs">{byDay ? 'Ativo' : 'Data'}</th>
            <th className="px-4 py-2 font-medium text-xs">Tipo</th>
            <th className="px-4 py-2 font-medium text-xs text-right">Qtd</th>
            <th className="px-4 py-2 font-medium text-xs text-right">Preço</th>
            <th className="px-4 py-2 font-medium text-xs text-right">Total</th>
            <th className="px-4 py-2 font-medium text-xs text-right">Origem</th>
            <th className="px-4 py-2" />
          </tr>
        </thead>
        <tbody>
          {items.map((t) => {
            const asset = getAsset(t.ticker)
            return (
              <tr
                key={t.id}
                className="border-t border-border/60 hover:bg-accent/20 transition-colors"
              >
                {byDay ? (
                  <td className="px-4 py-2 text-xs font-semibold text-foreground">
                    {tickerName(t, asset)}
                  </td>
                ) : (
                  <td className="px-4 py-2 text-muted-foreground tabular-nums text-xs">
                    {formatDate(t.date)}
                  </td>
                )}
                <td className="px-4 py-2">
                  <TypeBadge trade={t} />
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-xs">
                  {formatQuantity(t.quantity, asset?.type)}
                </td>
                <td className="px-4 py-2 text-right text-muted-foreground tabular-nums text-xs">
                  <TradeMoney brl={t.price} usd={t.priceUsd} />
                </td>
                <td className="px-4 py-2 text-right font-medium tabular-nums text-xs">
                  <TradeMoney brl={t.total} usd={t.totalUsd} />
                </td>
                <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                  {sourceLabel(t)}
                </td>
                <td className="px-4 py-2 text-right">{actions(t)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <EditTradeDialog
        key={editingTrade?.id}
        trade={editingTrade}
        onClose={() => setEditingTrade(null)}
        onSave={onEditTrade}
      />
    </>
  )
}
