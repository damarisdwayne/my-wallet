import { TABS } from '../constants'
import type { Tab } from '../constants'

type Props = {
  activeTab: Tab
  onSelect: (tab: Tab) => void
}

export const TabBar = ({ activeTab, onSelect }: Props) => (
  <div className="border-b border-border">
    <div className="flex gap-0 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelect(tab.id)}
          className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === tab.id
              ? 'border-b-2 border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  </div>
)
