import { atom } from 'jotai'
import type { PriceMap } from '@/services/quotes'

// Set by useAssets.refreshPrices after every successful price fetch
// usePriceAlerts watches this to run alert checks
export const freshPricesAtom = atom<PriceMap | null>(null)
