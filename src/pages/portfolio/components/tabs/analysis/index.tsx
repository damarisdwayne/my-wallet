import { useState } from 'react'
import type { Props } from './types'
import { AssetCompactCard, AssetDetailView } from './components'
import { DocumentGuide } from './components/document-guide'

export const AnalysisTab = ({
  assets,
  fundamentals,
  saveManualSnapshot,
  fiiInfo,
  saveFiiInfo,
  stockInfo,
  saveStockInfo,
}: Props) => {
  const [subTab, setSubTab] = useState<'stock' | 'fii'>('stock')
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  const stocks = assets.filter((a) => a.type === 'stock')
  const fiis = assets.filter((a) => a.type === 'fii')

  const allShown = subTab === 'stock' ? stocks : fiis
  const selectedAsset = allShown.find((a) => a.ticker === selectedTicker) ?? null

  if (stocks.length === 0 && fiis.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
        Nenhuma ação BR ou FII na carteira.
      </div>
    )
  }

  if (selectedAsset) {
    return (
      <AssetDetailView
        asset={selectedAsset}
        record={fundamentals[selectedAsset.ticker.toUpperCase()]}
        isFii={subTab === 'fii'}
        fiiInfoData={fiiInfo[selectedAsset.ticker.toUpperCase()]}
        stockInfoData={stockInfo[selectedAsset.ticker.toUpperCase()]}
        onBack={() => setSelectedTicker(null)}
        onSaveSnapshot={saveManualSnapshot}
        onSaveFiiInfo={saveFiiInfo}
        onSaveStockInfo={saveStockInfo}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1">
        {stocks.length > 0 && (
          <button
            onClick={() => setSubTab('stock')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${subTab === 'stock' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            Ações BR <span className="ml-1 text-xs opacity-70">({stocks.length})</span>
          </button>
        )}
        {fiis.length > 0 && (
          <button
            onClick={() => setSubTab('fii')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${subTab === 'fii' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            FIIs <span className="ml-1 text-xs opacity-70">({fiis.length})</span>
          </button>
        )}
      </div>

      <DocumentGuide type={subTab} />

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
              isFii={subTab === 'fii'}
              onClick={() => setSelectedTicker(asset.ticker)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
