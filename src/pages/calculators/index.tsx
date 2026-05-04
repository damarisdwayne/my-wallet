import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AposentadoriaCalc } from './components/aposentadoria-calc'
import { CdbIrCalc } from './components/cdb-ir-calc'
import { LciCdbCalc } from './components/lci-cdb-calc'
import { TesouroDiretoCalc } from './components/tesouro-calc'

const tabs = [
  { label: 'LCI/LCA vs CDB', description: 'Equivalência de taxa considerando isenção de IR' },
  { label: 'CDB com IR', description: 'Rendimento líquido após imposto de renda' },
  {
    label: 'Tesouro Direto',
    description: 'Marcação a mercado — vender agora ou segurar até o vencimento?',
  },
  { label: 'Simuladores', description: 'Juros compostos e simulador de independência financeira' },
]

export const CalculatorsPage = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Calculadoras</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{tabs[activeTab].description}</p>
      </div>

      <div className="relative flex gap-1 pb-px overflow-x-auto">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(i)}
            className={cn(
              'relative whitespace-nowrap px-4 py-2 border-b-2 text-sm font-medium transition-colors',
              activeTab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 0 && <LciCdbCalc />}
      {activeTab === 1 && <CdbIrCalc />}
      {activeTab === 2 && <TesouroDiretoCalc />}
      {activeTab === 3 && <AposentadoriaCalc />}
    </div>
  )
}
