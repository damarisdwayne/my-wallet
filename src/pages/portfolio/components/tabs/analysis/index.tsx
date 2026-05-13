import { useState } from 'react'
import type { Props } from './types'
import {
  AssetCompactCard,
  AssetDetailView,
  FiiSectorBreakdown,
  StockSectorBreakdown,
} from './components'
import { DocumentGuide } from './components/document-guide'
import { WatchlistTab } from './components/watchlist/watchlist-tab'

type TopTab = 'portfolio' | 'watchlist'

export const AnalysisTab = ({
  uid,
  assets,
  categories,
  fundamentals,
  saveManualSnapshot,
  deleteSnapshot,
  fiiInfo,
  saveFiiInfo,
  stockInfo,
  saveStockInfo,
  exteriorInfo,
  saveExteriorInfo,
}: Props) => {
  const [topTab, setTopTab] = useState<TopTab>('portfolio')
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null)

  const availableCategories = categories.filter((c) => assets.some((a) => a.categoryId === c.id))
  const [subCategoryId, setSubCategoryId] = useState<string>(availableCategories[0]?.id ?? '')

  const currentCategory = availableCategories.find((c) => c.id === subCategoryId)
  const allShown = assets.filter((a) => a.categoryId === subCategoryId)
  const selectedAsset = allShown.find((a) => a.ticker === selectedTicker) ?? null

  const categoryTypes = currentCategory?.assetTypes ?? []
  const isFiiCategory = categoryTypes.every((t) => t === 'fii')
  const isStockCategory =
    !isFiiCategory && !categoryTypes.some((t) => t === 'fixed_income' || t === 'tesouro')
  const showSectorBreakdown = isFiiCategory || (isStockCategory && categoryTypes.includes('stock'))
  const showDocGuide = isFiiCategory || categoryTypes.includes('stock')

  if (topTab === 'portfolio' && selectedAsset) {
    return (
      <AssetDetailView
        asset={selectedAsset}
        record={fundamentals[selectedAsset.ticker.toUpperCase()]}
        isFii={selectedAsset.type === 'fii'}
        fiiInfoData={fiiInfo[selectedAsset.ticker.toUpperCase()]}
        stockInfoData={stockInfo[selectedAsset.ticker.toUpperCase()]}
        onBack={() => setSelectedTicker(null)}
        onSaveSnapshot={saveManualSnapshot}
        onDeleteSnapshot={(fetchedAt) => deleteSnapshot(selectedAsset.ticker, fetchedAt)}
        onSaveFiiInfo={saveFiiInfo}
        onSaveStockInfo={saveStockInfo}
        exteriorInfoData={exteriorInfo[selectedAsset.ticker.toUpperCase()]}
        onSaveExteriorInfo={saveExteriorInfo}
      />
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-1">
        {(
          [
            { id: 'portfolio', label: 'Minha Carteira' },
            { id: 'watchlist', label: 'Em Avaliação' },
          ] as { id: TopTab; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setTopTab(tab.id)
              setSelectedTicker(null)
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${topTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {topTab === 'watchlist' ? (
        <WatchlistTab uid={uid} />
      ) : (
        <>
          <div className="flex flex-wrap gap-1">
            {availableCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSubCategoryId(cat.id)
                  setSelectedTicker(null)
                }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${subCategoryId === cat.id ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {showDocGuide && <DocumentGuide type={isFiiCategory ? 'fii' : 'stock'} />}

          {showSectorBreakdown &&
            (isFiiCategory ? (
              <FiiSectorBreakdown assets={allShown} fiiInfo={fiiInfo} />
            ) : (
              <StockSectorBreakdown assets={allShown} stockInfo={stockInfo} />
            ))}

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
                  isFii={asset.type === 'fii'}
                  onClick={() => setSelectedTicker(asset.ticker)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
