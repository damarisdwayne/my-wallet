import { useState } from 'react'
import type { Props } from './types'
import { AssetCompactCard, AssetDetailView } from './components'
import { DocumentGuide } from './components/document-guide'

export const AnalysisTab = ({
  assets,
  fundamentals,
  saveManualSnapshot,
  deleteSnapshot,
  fiiInfo,
  saveFiiInfo,
  stockInfo,
  saveStockInfo,
}: Props) => {
  const [subTab, setSubTab] = useState<'stock' | 'fii'>('stock')
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  const isFii = subTab === 'fii'
  const allShown = assets.filter((a) => a.type === (isFii ? 'fii' : 'stock'))
  const selectedAsset = allShown.find((a) => a.ticker === selectedTicker) ?? null

  if (selectedAsset) {
    return (
      <AssetDetailView
        asset={selectedAsset}
        record={fundamentals[selectedAsset.ticker.toUpperCase()]}
        isFii={isFii}
        fiiInfoData={fiiInfo[selectedAsset.ticker.toUpperCase()]}
        stockInfoData={stockInfo[selectedAsset.ticker.toUpperCase()]}
        onBack={() => setSelectedTicker(null)}
        onSaveSnapshot={saveManualSnapshot}
        onDeleteSnapshot={(fetchedAt) => deleteSnapshot(selectedAsset.ticker, fetchedAt)}
        onSaveFiiInfo={saveFiiInfo}
        onSaveStockInfo={saveStockInfo}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1">
        {(['stock', 'fii'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSubTab(tab)
              setSelectedTicker(null)
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${subTab === tab ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {tab === 'stock' ? 'Ações BR' : 'FIIs'}
          </button>
        ))}
      </div>

      <DocumentGuide type={isFii ? 'fii' : 'stock'} />

      {allShown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Nenhum ativo nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {allShown.map((asset) => (
            <AssetCompactCard
              key={asset.id}
              asset={asset}
              record={fundamentals[asset.ticker.toUpperCase()]}
              isFii={isFii}
              onClick={() => setSelectedTicker(asset.ticker)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
