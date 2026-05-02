import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { usePortfolio } from '@/hooks/use-portfolio'
import { AllocationTab } from './components/allocation-tab'
import { AnalysisTab } from './components/analysis-tab'
import { AporteTab } from './components/aporte-tab'
import { ImportsTab } from './components/imports-tab'
import { OverviewTab } from './components/overview-tab'
import { TradesTab } from './components/trades-tab'

const tabs = ['Visão Geral', 'Meta', 'Aporte', 'Movimentações', 'Importações', 'Análise']

const PortfolioSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="relative flex gap-1 pb-px border-b border-border">
      {tabs.map((tab) => (
        <div key={tab} className="px-4 py-2">
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex gap-2">
          {(['a', 'b', 'c', 'd'] as const).map((k) => (
            <Skeleton key={k} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['a', 'b', 'c', 'd'] as const).map((k) => (
          <Card key={k}>
            <CardHeader className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-2 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex gap-4 pb-2 border-b border-border">
              {(['a', 'b', 'c', 'd', 'e', 'f'] as const).map((k) => (
                <Skeleton key={k} className="h-3 w-12" />
              ))}
            </div>
            {(['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).map((k) => (
              <div
                key={k}
                className="flex items-center gap-4 py-2 border-b border-border last:border-0"
              >
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14 ml-auto" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)

export const PortfolioPage = () => {
  const {
    assets,
    categories,
    diagrams,
    answers,
    importRecords,
    trades,
    addAsset,
    addManualTrade,
    deleteTrade,
    syncMissingTrades,
    editAsset,
    deleteAsset,
    importFromB3,
    revertImport,
    saveCategory,
    deleteCategory,
    saveDiagram,
    saveAnswers,
    refreshPrices,
    refreshingPrices,
    priceError,
    fundamentals,
    saveManualSnapshot,
    fiiInfo,
    saveFiiInfo,
    stockInfo,
    saveStockInfo,
    loading,
  } = usePortfolio()
  const [activeTab, setActiveTab] = useState(0)

  const totalValue = useMemo(
    () => assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0),
    [assets],
  )

  if (loading) return <PortfolioSkeleton />

  return (
    <div className="p-6 space-y-6">
      <div className="relative flex gap-1 pb-px">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`relative px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === i
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <OverviewTab
          assets={assets}
          categories={categories}
          diagrams={diagrams}
          answers={answers}
          totalValue={totalValue}
          addAsset={addAsset}
          addManualTrade={addManualTrade}
          editAsset={editAsset}
          deleteAsset={deleteAsset}
          importFromB3={importFromB3}
          refreshPrices={refreshPrices}
          refreshingPrices={refreshingPrices}
          priceError={priceError}
        />
      )}
      {activeTab === 1 && (
        <AllocationTab
          assets={assets}
          categories={categories}
          totalValue={totalValue}
          diagrams={diagrams}
          answers={answers}
          saveCategory={saveCategory}
          deleteCategory={deleteCategory}
          editAsset={editAsset}
          saveDiagram={saveDiagram}
          saveAnswers={saveAnswers}
        />
      )}
      {activeTab === 2 && (
        <AporteTab
          assets={assets}
          categories={categories}
          diagrams={diagrams}
          answers={answers}
          totalValue={totalValue}
          refreshPrices={refreshPrices}
          refreshingPrices={refreshingPrices}
        />
      )}
      {activeTab === 3 && (
        <TradesTab
          trades={trades}
          assets={assets}
          categories={categories}
          onDeleteTrade={deleteTrade}
          onSyncMissingTrades={syncMissingTrades}
        />
      )}
      {activeTab === 4 && <ImportsTab records={importRecords} onRevert={revertImport} />}
      {activeTab === 5 && (
        <AnalysisTab
          assets={assets}
          fundamentals={fundamentals}
          saveManualSnapshot={saveManualSnapshot}
          fiiInfo={fiiInfo}
          saveFiiInfo={saveFiiInfo}
          stockInfo={stockInfo}
          saveStockInfo={saveStockInfo}
        />
      )}
    </div>
  )
}
