import { ChevronDown, ChevronUp } from 'lucide-react'
import { formatCurrency, formatQuantity } from '@/lib/utils'
import type { RealizedGain } from '@/lib/ir-calc'
import { assetTypeLabel } from '../../../constants'
import { EmptyRow, Td, Th, TypeFilterChips } from '../../ui'

type Props = {
  gains: RealizedGain[]
  filteredGains: RealizedGain[]
  availableGainTypes: string[]
  filterType: string | null
  onFilterChange: (type: string | null) => void
  showDetails: boolean
  onToggle: () => void
}

export const OperationsDetail = ({
  gains,
  filteredGains,
  availableGainTypes,
  filterType,
  onFilterChange,
  showDetails,
  onToggle,
}: Props) => (
  <div className="mt-4">
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      {showDetails ? 'Ocultar' : 'Ver'} detalhamento por operação ({gains.length} vendas)
    </button>
    {showDetails && (
      <div className="mt-3">
        {availableGainTypes.length > 1 && (
          <TypeFilterChips
            types={availableGainTypes}
            active={filterType}
            onChange={onFilterChange}
          />
        )}
        <div className="overflow-x-auto border border-border rounded-md">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <Th>Data</Th>
                <Th>Ticker</Th>
                <Th>Tipo</Th>
                <Th right>Qtd.</Th>
                <Th right>PM Custo</Th>
                <Th right>Preço Venda</Th>
                <Th right>Custo Total</Th>
                <Th right>Receita</Th>
                <Th right>Resultado</Th>
              </tr>
            </thead>
            <tbody>
              {filteredGains.length === 0 ? (
                <EmptyRow cols={9} message="Nenhuma operação encontrada." />
              ) : (
                filteredGains.map((g, i) => (
                  <tr key={`${g.ticker}-${g.date}-${i}`} className="border-t border-border/50 hover:bg-muted/20">
                    <Td className="text-muted-foreground">
                      {g.date ? new Date(g.date + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}
                    </Td>
                    <Td className="font-semibold text-foreground">{g.ticker}</Td>
                    <Td>
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {assetTypeLabel[g.assetType] ?? g.assetType}
                      </span>
                    </Td>
                    <Td right>{formatQuantity(g.quantity)}</Td>
                    <Td right className="text-muted-foreground">
                      {formatCurrency(g.avgCost)}
                    </Td>
                    <Td right>{formatCurrency(g.sellPrice)}</Td>
                    <Td right className="text-muted-foreground">
                      {formatCurrency(g.costTotal)}
                    </Td>
                    <Td right>{formatCurrency(g.sellTotal)}</Td>
                    <Td right>
                      <span
                        className={
                          g.gain >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'
                        }
                      >
                        {formatCurrency(g.gain)}
                      </span>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)
