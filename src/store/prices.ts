import { atom } from 'jotai'

// Set by useAssets.refreshPrices after every successful price fetch
// usePriceAlerts watches this to run alert checks
export const freshPricesAtom = atom<Record<string, number> | null>(null)
