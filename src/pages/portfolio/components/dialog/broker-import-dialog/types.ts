import type { B3Asset, B3Dividend, B3ParseResult, B3RawTrade } from '@/services/b3-import'
import type { ExtratoEntry } from '@/services/inter-extrato'
import type { Asset } from '@/types'

export type ParsedRow = B3Asset & { action: 'new' | 'update' | 'sell' }
export type InterMode = 'trades' | 'extrato'

// An operation in the import preview, paired with whether it's a duplicate of something already
// saved and whether the user has it selected to import. `key` is stable within a parsed file.
export interface SelectableItem {
  key: string
  duplicate: boolean
  included: boolean
}
export type TradeItem = SelectableItem & { trade: B3RawTrade }
export type DividendItem = SelectableItem & { dividend: B3Dividend }
export type ExtratoItem = SelectableItem & { entry: ExtratoEntry }

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
