import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TABS } from '../constants'
import type { Tab } from '../constants'

type Props = {
  activeTab: Tab
  onSelect: (tab: Tab) => void
}

export const TabBar = ({ activeTab, onSelect }: Props) => {
  const activeLabel = TABS.find((t) => t.id === activeTab)?.label ?? ''

  return (
    <>
      {/* Mobile: dropdown */}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-card text-sm font-medium text-foreground w-full justify-between">
              {activeLabel}
              <ChevronDown size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            {TABS.map((tab) => (
              <DropdownMenuItem key={tab.id} onClick={() => onSelect(tab.id)} className="gap-2">
                <Check size={14} className={tab.id === activeTab ? 'text-primary' : 'opacity-0'} />
                {tab.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop: tab bar */}
      <div className="hidden md:block border-b border-border">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`px-4 py-2.5 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
