import { useState } from 'react'
import {
  BarChart3,
  Calculator,
  Home,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  Receipt,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { to: '/expenses', label: 'Gastos', icon: <Receipt size={20} /> },
  { to: '/portfolio', label: 'Carteira', icon: <TrendingUp size={20} /> },
  { to: '/dividends', label: 'Proventos', icon: <BarChart3 size={20} /> },
  { to: '/tax', label: 'Imposto de Renda', icon: <Home size={20} /> },
  { to: '/sales', label: 'Vendas', icon: <ShoppingBag size={20} /> },
  { to: '/calculators', label: 'Calculadoras', icon: <Calculator size={20} /> },
]

// Collapsed sidebar width is w-15 = 60px. Icon slot matches this so the
// icon never shifts position when expanding/collapsing.
const ICON_SLOT = 'w-15 shrink-0 flex items-center justify-center'

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-border bg-card h-full transition-all duration-200',
        expanded ? 'w-56' : 'w-15',
      )}
    >
      {/* Header */}
      <div className="h-16.25 flex items-center border-b border-border shrink-0">
        <span className={ICON_SLOT}>
          <span className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <TrendingUp size={15} className="text-primary-foreground" />
          </span>
        </span>
        <span
          className={cn(
            'font-semibold text-foreground text-sm tracking-wide overflow-hidden whitespace-nowrap transition-all duration-200',
            expanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0',
          )}
        >
          My Wallet
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={expanded ? undefined : item.label}
            className={({ isActive }) =>
              cn(
                'mx-2 flex items-center rounded-md text-sm transition-colors py-2',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            <span className="w-11 shrink-0 flex items-center justify-center">{item.icon}</span>
            <span
              className={cn(
                'overflow-hidden whitespace-nowrap transition-all duration-200 pr-3',
                expanded ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0',
              )}
            >
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border">
        <button
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            ICON_SLOT,
            'py-4 text-muted-foreground hover:text-foreground transition-colors',
          )}
          aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}
