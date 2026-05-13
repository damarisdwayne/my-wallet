import { lazy, Suspense, useMemo, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePortfolio } from '@/hooks/use-portfolio'
import { PortfolioSkeleton } from '@/skeleton'
import { PageLoader } from '@/components'

const OverviewTab = lazy(() =>
  import('./components/tabs/overview').then((m) => ({ default: m.OverviewTab })),
)
const AllocationTab = lazy(() =>
  import('./components/tabs/allocation').then((m) => ({ default: m.AllocationTab })),
)
const AporteTab = lazy(() =>
  import('./components/tabs/aporte').then((m) => ({ default: m.AporteTab })),
)
const DividendsTab = lazy(() =>
  import('./components/tabs/dividends').then((m) => ({ default: m.DividendsTab })),
)
const TradesTab = lazy(() =>
  import('./components/tabs/trades').then((m) => ({ default: m.TradesTab })),
)
const ImportsTab = lazy(() =>
  import('./components/tabs/imports').then((m) => ({ default: m.ImportsTab })),
)
const AnalysisTab = lazy(() =>
  import('./components/tabs/analysis').then((m) => ({ default: m.AnalysisTab })),
)
const tabs = [
  'Visão Geral',
  'Alocação',
  'Simular Aporte',
  'Proventos',
  'Análises',
  'Movimentações',
  'Importações',
]

export const PortfolioPage = () => {
  const {
    uid,
    assets,
    categories,
    diagrams,
    answers,
    importRecords,
    trades,
    addAsset,
    recordTrade,
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
    deleteDiagram,
    saveAnswers,
    refreshPrices,
    refreshPricesIfStale,
    refreshingPrices,
    priceError,
    fundamentals,
    saveManualSnapshot,
    deleteSnapshot,
    fiiInfo,
    saveFiiInfo,
    stockInfo,
    saveStockInfo,
    exteriorInfo,
    saveExteriorInfo,
    loading,
  } = usePortfolio()
  const [activeTab, setActiveTab] = useState(0)

  const totalValue = useMemo(
    () => assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0),
    [assets],
  )

  if (loading) return <PortfolioSkeleton />

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Mobile: dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm font-medium text-foreground w-full justify-between">
              {tabs[activeTab]}
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {tabs.map((tab, i) => (
              <DropdownMenuItem key={tab} onClick={() => setActiveTab(i)} className="gap-2">
                <Check size={14} className={i === activeTab ? 'text-primary' : 'opacity-0'} />
                {tab}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: tab bar */}
      <div className="relative hidden md:block pb-px">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`relative shrink-0 px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
                activeTab === i
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Suspense fallback={<PageLoader />}>
        {activeTab === 0 && (
          <OverviewTab
            assets={assets}
            categories={categories}
            diagrams={diagrams}
            answers={answers}
            totalValue={totalValue}
            addAsset={addAsset}
            recordTrade={recordTrade}
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
            deleteDiagram={deleteDiagram}
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
            refreshPrices={refreshPricesIfStale}
            refreshingPrices={refreshingPrices}
          />
        )}
        {activeTab === 3 && <DividendsTab assets={assets} />}
        {activeTab === 4 && (
          <AnalysisTab
            uid={uid}
            assets={assets}
            categories={categories}
            fundamentals={fundamentals}
            saveManualSnapshot={saveManualSnapshot}
            deleteSnapshot={deleteSnapshot}
            fiiInfo={fiiInfo}
            saveFiiInfo={saveFiiInfo}
            stockInfo={stockInfo}
            saveStockInfo={saveStockInfo}
            exteriorInfo={exteriorInfo}
            saveExteriorInfo={saveExteriorInfo}
          />
        )}
        {activeTab === 5 && (
          <TradesTab
            trades={trades}
            assets={assets}
            categories={categories}
            onDeleteTrade={deleteTrade}
            onSyncMissingTrades={syncMissingTrades}
          />
        )}
        {activeTab === 6 && <ImportsTab records={importRecords} onRevert={revertImport} />}
      </Suspense>
    </div>
  )
}
