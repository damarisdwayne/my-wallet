import { BarChart3, Home, LayoutDashboard, Receipt, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { id: 'expenses', label: 'Gastos', icon: <Receipt size={18} /> },
  { id: 'portfolio', label: 'Carteira', icon: <TrendingUp size={18} /> },
  { id: 'dividends', label: 'Proventos', icon: <BarChart3 size={18} /> },
  { id: 'tax', label: 'Imposto de Renda', icon: <Home size={18} /> },
]

interface SidebarProps {
  activePage: string
  onNavigate: (page: string) => void
}

export const Sidebar = ({ activePage, onNavigate }: SidebarProps) => (
  <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-border bg-card min-h-screen">
    <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
      <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
        <TrendingUp size={14} className="text-primary-foreground" />
      </div>
      <span className="font-semibold text-foreground text-sm tracking-wide">My Wallet</span>
    </div>

    <nav className="flex-1 p-3 space-y-0.5">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors text-left',
            activePage === item.id
              ? 'bg-primary/10 text-primary font-medium'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  </aside>
)
