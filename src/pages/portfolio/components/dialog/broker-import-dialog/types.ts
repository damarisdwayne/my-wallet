import type { B3Asset, B3ParseResult, B3RawTrade } from '@/services/b3-import'
import type { Asset } from '@/types'

export type ParsedRow = B3Asset & { action: 'new' | 'update' | 'sell' }
export type InterMode = 'trades' | 'extrato'

export interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingAssets: Asset[]
  onImport: (
    assets: B3Asset[],
    trades: B3RawTrade[],
    dividends: B3ParseResult['dividends'],
    filename: string,
    source: 'b3' | 'inter',
  ) => Promise<void>
}
