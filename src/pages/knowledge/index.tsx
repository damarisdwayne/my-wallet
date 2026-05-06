import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AcoesBr, Exterior, Fiis, Fundamentos, GestaoCarteira, ImpostoRenda, RendaFixa, ReservaValor } from './components'

const tabs = [
  { label: 'Fundamentos', description: 'Mentalidade, ativos vs passivos, juros compostos, liberdade financeira e como evitar golpes' },
  { label: 'Renda Fixa', description: 'Hierarquia de risco, Tesouro Direto, FGC e tributação' },
  { label: 'FIIs', description: 'Tipos de fundo, indicadores e como montar uma carteira de FIIs' },
  { label: 'Ações BR', description: 'Indicadores, análise fundamentalista e estratégia para ações brasileiras' },
  { label: 'Reserva de Valor', description: 'Ouro e Bitcoin: proteção patrimonial e como investir' },
  { label: 'Exterior', description: 'ETFs americanos, REITs, Treasuries e como investir fora do Brasil' },
  { label: 'Imposto de Renda', description: 'Regras de IR para cada classe de ativo, DARF e declaração anual' },
  { label: 'Gestão de Carteira', description: 'Perfis de risco, diversificação, quando vender e mentalidade do investidor de longo prazo' },
]

export const KnowledgePage = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Base de Conhecimento</h1>
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

      {activeTab === 0 && <Fundamentos />}
      {activeTab === 1 && <RendaFixa />}
      {activeTab === 2 && <Fiis />}
      {activeTab === 3 && <AcoesBr />}
      {activeTab === 4 && <ReservaValor />}
      {activeTab === 5 && <Exterior />}
      {activeTab === 6 && <ImpostoRenda />}
      {activeTab === 7 && <GestaoCarteira />}
    </div>
  )
}
