import { useSetAtom } from 'jotai'
import { TrendingUp } from 'lucide-react'
import { priceChangesOpenAtom } from '@/store/prices'

export const PriceChangesButton = () => {
  const setOpen = useSetAtom(priceChangesOpenAtom)
  return (
    <button
      onClick={() => setOpen(true)}
      title="Ver variações de preço"
      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
    >
      <TrendingUp size={14} />
      <span className="hidden sm:inline">Variações</span>
    </button>
  )
}
