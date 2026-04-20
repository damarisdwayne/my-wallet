import { useMemo, useState } from 'react'
import { usePortfolio } from '@/hooks/use-portfolio'
import { AllocationTab } from './components/allocation-tab'
import { DiagramTab } from './components/diagram-tab'
import { OverviewTab } from './components/overview-tab'

const tabs = ['Visão Geral', 'Alocação', 'Diagrama do Cerrado', 'Análise']

export const PortfolioPage = () => {
  const {
    assets,
    categories,
    diagrams,
    answers,
    addAsset,
    saveCategory,
    saveDiagram,
    saveAnswers,
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
          totalValue={totalValue}
          addAsset={addAsset}
        />
      )}
      {activeTab === 1 && (
        <AllocationTab
          assets={assets}
          categories={categories}
          totalValue={totalValue}
          saveCategory={saveCategory}
        />
      )}
      {activeTab === 2 && (
        <DiagramTab
          assets={assets}
          diagrams={diagrams}
          answers={answers}
          saveDiagram={saveDiagram}
          saveAnswers={saveAnswers}
        />
      )}
      {activeTab === 3 && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Análise de ativos — em breve
        </div>
      )}
    </div>
  )
}
