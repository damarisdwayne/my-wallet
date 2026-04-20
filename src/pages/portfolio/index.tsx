import { useMemo, useState } from 'react'
import { usePortfolio } from '@/hooks/use-portfolio'
import { AllocationTab } from './components/allocation-tab'
import { AnalysisTab } from './components/analysis-tab'
import { AporteTab } from './components/aporte-tab'
import { DiagramTab } from './components/diagram-tab'
import { ImportsTab } from './components/imports-tab'
import { OverviewTab } from './components/overview-tab'

const tabs = ['Visão Geral', 'Alocação', 'Diagrama do Cerrado', 'Aporte', 'Importações', 'Análise']

export const PortfolioPage = () => {
  const {
    assets,
    categories,
    diagrams,
    answers,
    importRecords,
    addAsset,
    editAsset,
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
    fiiManual,
    refreshingFundamentals,
    fundamentalErrors,
    refreshFundamentals,
    saveManualSnapshot,
    saveFiiManual,
  } = usePortfolio()
  const [activeTab, setActiveTab] = useState(0)

  const totalValue = useMemo(
    () => assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0),
    [assets],
  )

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
          editAsset={editAsset}
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
        />
      )}
      {activeTab === 2 && (
        <DiagramTab
          assets={assets}
          categories={categories}
          diagrams={diagrams}
          answers={answers}
          saveDiagram={saveDiagram}
          saveAnswers={saveAnswers}
        />
      )}
      {activeTab === 3 && (
        <AporteTab assets={assets} categories={categories} totalValue={totalValue} />
      )}
      {activeTab === 4 && <ImportsTab records={importRecords} onRevert={revertImport} />}
      {activeTab === 5 && (
        <AnalysisTab
          assets={assets}
          fundamentals={fundamentals}
          fiiManual={fiiManual}
          refreshingFundamentals={refreshingFundamentals}
          fundamentalErrors={fundamentalErrors}
          refreshFundamentals={refreshFundamentals}
          saveFiiManual={saveFiiManual}
          saveManualSnapshot={saveManualSnapshot}
        />
      )}
    </div>
  )
}
