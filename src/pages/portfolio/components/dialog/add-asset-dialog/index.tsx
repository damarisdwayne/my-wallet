import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Asset, AssetType, PortfolioCategory, Trade } from '@/types'
import { typeLabel } from '../../../constants'
import {
  OpSelector,
  TypeSelector,
  StandardForm,
  FixedIncomeForm,
  CryptoForm,
  TradeForm,
} from './components'
import type { OpMode } from './constants'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: PortfolioCategory[]
  assets: Asset[]
  onAdd: (asset: Asset) => Promise<void>
  onEdit: (assetId: string, data: Partial<Asset>) => Promise<void>
  onRecordTrade: (trade: Omit<Trade, 'id' | 'source'>) => Promise<void>
  onAddTrade: (trade: Omit<Trade, 'id' | 'source'>) => Promise<void>
}

export const AddAssetDialog = ({
  open,
  onOpenChange,
  categories,
  assets,
  onAdd,
  onEdit,
  onRecordTrade,
  onAddTrade,
}: Props) => {
  const [opMode, setOpMode] = useState<OpMode | null>(null)
  const [selectedType, setSelectedType] = useState<AssetType | null>(null)
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setOpMode(null)
    setSelectedType(null)
  }

  const handleBack = () => {
    if (opMode === 'buy' && selectedType) {
      setSelectedType(null)
    } else {
      setOpMode(null)
    }
  }

  // Campos em dólar do trade (cripto/exterior) — usados pelo IR para o custo em USD.
  const usdTradeFields = (priceBrl: number, qty: number, priceUsd?: number) =>
    priceUsd != null && priceUsd > 0
      ? { priceUsd, totalUsd: priceUsd * qty, usdRateAtTrade: priceBrl / priceUsd }
      : {}

  const handleSaveAsset = async (partial: Partial<Asset>) => {
    setSaving(true)
    try {
      const ticker = (partial.ticker ?? '').toUpperCase()
      const existing = assets.find(
        (a) => a.ticker.toUpperCase() === ticker && a.type === partial.type,
      )

      if (existing) {
        // Merge: weighted average price + sum quantities
        const newQty = partial.quantity ?? 0
        const newAvg = partial.avgPrice ?? 0
        const totalQty = existing.quantity + newQty
        const weighted = (a: number, b: number) =>
          totalQty > 0 ? (a * existing.quantity + b * newQty) / totalQty : a
        const mergedAvg = weighted(existing.avgPrice, newAvg)
        // Média ponderada em USD quando ambos os lados têm USD original
        const existingUsd = existing.avgPriceUsd
        const newUsd = partial.avgPriceUsd
        const mergedUsd =
          existingUsd != null && newUsd != null
            ? weighted(existingUsd, newUsd)
            : (existingUsd ?? newUsd)
        await onEdit(existing.id, {
          quantity: totalQty,
          avgPrice: mergedAvg,
          avgPriceUsd: mergedUsd,
          currentPrice: partial.currentPrice ?? existing.currentPrice,
          currentPriceUsd: partial.currentPriceUsd ?? existing.currentPriceUsd,
        })
        if (newAvg > 0 && newQty > 0) {
          await onRecordTrade({
            ticker: existing.ticker,
            type: 'buy',
            quantity: newQty,
            price: newAvg,
            total: newAvg * newQty,
            date: partial.operationDate ?? new Date().toISOString().slice(0, 10),
            ...usdTradeFields(newAvg, newQty, partial.avgPriceUsd),
          })
        }
      } else {
        const asset: Asset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          ticker,
          name: partial.name ?? '',
          type: partial.type ?? 'other',
          categoryId: partial.categoryId ?? '',
          quantity: partial.quantity ?? 0,
          avgPrice: partial.avgPrice ?? 0,
          currentPrice: partial.currentPrice ?? 0,
          targetPercent: partial.targetPercent ?? 0,
          ...partial,
        }
        await onAdd(asset)
        if (asset.avgPrice > 0 && asset.quantity > 0) {
          await onRecordTrade({
            ticker: asset.ticker,
            type: 'buy',
            quantity: asset.quantity,
            price: asset.avgPrice,
            total: asset.avgPrice * asset.quantity,
            date: asset.operationDate ?? new Date().toISOString().slice(0, 10),
            ...usdTradeFields(asset.avgPrice, asset.quantity, asset.avgPriceUsd),
          })
        }
      }
      reset()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTrade = async (trade: Omit<Trade, 'id' | 'source'>) => {
    setSaving(true)
    try {
      await onAddTrade(trade)
      reset()
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const opTitles: Record<string, string> = {
    sell: 'Venda',
    bonificacao: 'Bonificação',
    amortizacao: 'Amortização',
  }
  const title = opMode
    ? opMode === 'buy'
      ? selectedType
        ? `Adicionar ${typeLabel[selectedType]}`
        : 'Compra – Tipo de ativo'
      : opTitles[opMode]
    : 'Nova operação'

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {opMode && (
              <button
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Voltar"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {title}
          </DialogTitle>
        </DialogHeader>

        {!opMode && <OpSelector onSelect={setOpMode} />}

        {opMode === 'buy' && !selectedType && <TypeSelector onSelect={setSelectedType} />}

        {opMode === 'buy' &&
          selectedType &&
          selectedType !== 'fixed_income' &&
          selectedType !== 'crypto' && (
            <StandardForm type={selectedType} categories={categories} onSave={handleSaveAsset} />
          )}

        {opMode === 'buy' && selectedType === 'fixed_income' && (
          <FixedIncomeForm categories={categories} onSave={handleSaveAsset} />
        )}

        {opMode === 'buy' && selectedType === 'crypto' && (
          <CryptoForm categories={categories} onSave={handleSaveAsset} />
        )}

        {(opMode === 'sell' || opMode === 'bonificacao' || opMode === 'amortizacao') && (
          <TradeForm opMode={opMode} assets={assets} onSave={handleSaveTrade} />
        )}

        {saving && (
          <DialogFooter>
            <p className="text-xs text-muted-foreground">Salvando...</p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
