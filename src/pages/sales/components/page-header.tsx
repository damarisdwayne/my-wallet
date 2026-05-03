import { ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'
import { formatMonthLabel } from '../utils'

interface PageHeaderProps {
  selectedMonth: string
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
  onRegisterBuy: () => void
}

export const PageHeader = ({
  selectedMonth,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onRegisterBuy,
}: PageHeaderProps) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h2 className="text-base font-semibold text-foreground">Vendas</h2>
      <div className="flex items-center gap-1">
        <button
          onClick={onPrev}
          disabled={!canGoPrev}
          className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-medium text-foreground w-16 text-center">
          {formatMonthLabel(selectedMonth)}
        </span>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
    <button
      onClick={onRegisterBuy}
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
    >
      <PlusCircle size={15} />
      Registrar compra
    </button>
  </div>
)
