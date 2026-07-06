import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Carteira, Gastos, Imposto, Proventos } from './components'

const tabs = [
  {
    label: 'Carteira',
    description: 'Como lançar operações e importar notas da B3 e da Inter',
  },
  { label: 'Gastos', description: 'Lançamento manual (normal, fixo, parcelado) e importação OFX' },
  { label: 'Proventos', description: 'De onde vêm os dividendos e como são projetados' },
  {
    label: 'Imposto de Renda',
    description: 'Como o IR é calculado e o que você precisa alimentar',
  },
]

export const GuidePage = () => {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Como usar</h1>
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

      {activeTab === 0 && <Carteira />}
      {activeTab === 1 && <Gastos />}
      {activeTab === 2 && <Proventos />}
      {activeTab === 3 && <Imposto />}
    </div>
  )
}
