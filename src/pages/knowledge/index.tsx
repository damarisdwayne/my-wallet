import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AcoesBr,
  Exterior,
  Fiis,
  Fundamentos,
  GestaoCarteira,
  ImpostoRenda,
  RendaFixa,
  ReservaValor,
} from './components'

const tabs = [
  {
    label: 'Fundamentos',
    description:
      'Mentalidade, ativos vs passivos, juros compostos, liberdade financeira e como evitar golpes',
  },
  { label: 'Renda Fixa', description: 'Hierarquia de risco, Tesouro Direto, FGC e tributação' },
  { label: 'FIIs', description: 'Tipos de fundo, indicadores e como montar uma carteira de FIIs' },
  {
    label: 'Ações BR',
    description: 'Indicadores, análise fundamentalista e estratégia para ações brasileiras',
  },
  {
    label: 'Reserva de Valor',
    description: 'Ouro e Bitcoin: proteção patrimonial e como investir',
  },
  {
    label: 'Exterior',
    description: 'ETFs americanos, REITs, Treasuries e como investir fora do Brasil',
  },
  {
    label: 'Imposto de Renda',
    description: 'Regras de IR para cada classe de ativo, DARF e declaração anual',
  },
  {
    label: 'Gestão de Carteira',
    description:
      'Perfis de risco, diversificação, quando vender e mentalidade do investidor de longo prazo',
  },
]

export const KnowledgePage = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Base de Conhecimento</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{tabs[activeTab].description}</p>
      </div>

      {/* Mobile: dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm font-medium text-foreground w-full justify-between">
              {tabs[activeTab].label}
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {tabs.map((tab, i) => (
              <DropdownMenuItem key={tab.label} onClick={() => setActiveTab(i)} className="gap-2">
                <Check size={14} className={i === activeTab ? 'text-primary' : 'opacity-0'} />
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: tab bar */}
      <div className="relative hidden md:flex gap-1 pb-px">
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
