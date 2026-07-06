import { useState } from 'react'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn, formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import type { Asset, PortfolioCategory, Trade } from '@/types'
import type { CategoryAllocation } from '../constants'
import { AssetRow } from './asset-row'
import { RegisterFixedIncomeDialog } from './register-fixed-income-dialog'

interface CategoryRowProps {
  allocation: CategoryAllocation
  isOpen: boolean
  onToggle: () => void
  categories: PortfolioCategory[]
  onRegister: (trade: Omit<Trade, 'id' | 'source'>) => Promise<void>
  onSaveFixedIncome: (asset: Partial<Asset>) => Promise<void>
  launched: Set<string>
  onLaunched: (key: string) => void
}

export const CategoryRow = ({
  allocation,
  isOpen,
  onToggle,
  categories,
  onRegister,
  onSaveFixedIncome,
  launched,
  onLaunched,
}: CategoryRowProps) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))
  const {
    cat,
    catAporte,
    catRecommendedValue,
    catValueAfterAporte,
    catPercentBefore,
    catPercentAfter,
    assetAllocations,
  } = allocation
  const isFixedIncome = cat.assetTypes.some((t) => t === 'fixed_income' || t === 'tesouro')
  const [fiOpen, setFiOpen] = useState(false)
  const fiKey = `fi:${cat.id}`
  const fiDone = launched.has(fiKey)

  // Progresso de lançamentos da categoria, pra mostrar no cabeçalho mesmo recolhida.
  const launchedCount = isFixedIncome
    ? fiDone
      ? 1
      : 0
    : assetAllocations.filter((a) => launched.has(a.asset.id)).length
  const totalCount = isFixedIncome ? 1 : assetAllocations.length
  const allLaunched = totalCount > 0 && launchedCount === totalCount

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 bg-muted/30 text-left transition-colors hover:bg-muted/50 cursor-pointer"
      >
        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: cat.color }} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{cat.name}</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5 hidden sm:block">
            rec. {fmt(catRecommendedValue)}
            <span className="mx-1">→</span>
            <span className="text-foreground">após {fmt(catValueAfterAporte)}</span>
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs shrink-0">
          {launchedCount > 0 && (
            <span
              className={cn(
                'flex items-center gap-1 font-medium',
                allLaunched ? 'text-success' : 'text-muted-foreground',
              )}
            >
              <Check size={12} />
              {launchedCount}/{totalCount}
            </span>
          )}
          <span className="text-muted-foreground hidden sm:inline">
            {catPercentBefore.toFixed(1)}%<span className="mx-1">→</span>
            <span className="text-foreground font-medium">{catPercentAfter.toFixed(1)}%</span>
          </span>
          <span className="font-semibold text-foreground text-sm min-w-20 text-right">
            {fmt(catAporte)}
          </span>
          <ChevronDown
            size={14}
            className={cn('text-muted-foreground transition-transform', isOpen && 'rotate-180')}
          />
        </div>
      </button>

      {isOpen && isFixedIncome && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Aporte recomendado em renda fixa. Registre o título adquirido (CDB, Tesouro, LCI...).
          </p>
          {fiDone ? (
            <span className="flex items-center gap-1 text-xs text-success shrink-0">
              <Check size={14} /> Lançado
            </span>
          ) : (
            <button
              onClick={() => setFiOpen(true)}
              className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
            >
              <Plus size={14} /> Lançar
            </button>
          )}
        </div>
      )}

      {isOpen && !isFixedIncome && assetAllocations.length > 0 && (
        <div className="divide-y divide-border">
          {assetAllocations.map((a) => (
            <AssetRow
              key={a.asset.id}
              allocation={a}
              onRegister={onRegister}
              launched={launched.has(a.asset.id)}
              onLaunched={() => onLaunched(a.asset.id)}
            />
          ))}
        </div>
      )}

      {isOpen && !isFixedIncome && assetAllocations.length === 0 && (
        <p className="px-10 py-2.5 text-xs text-muted-foreground border-t border-border">
          Nenhum ativo elegível nesta categoria (verifique as pontuações no diagrama).
        </p>
      )}

      {fiOpen && (
        <RegisterFixedIncomeDialog
          categories={categories}
          defaultTotalInvested={catAporte}
          onClose={() => setFiOpen(false)}
          onSave={async (partial) => {
            await onSaveFixedIncome(partial)
            onLaunched(fiKey)
            toast.success('Renda fixa lançada na carteira')
          }}
        />
      )}
    </div>
  )
}
