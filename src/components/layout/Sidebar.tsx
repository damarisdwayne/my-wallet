import { useState } from 'react'
import {
  BarChart3,
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
]

export const Sidebar = () => {
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col shrink-0 border-r border-border bg-card min-h-screen transition-all duration-200',
        expanded ? 'w-56' : 'w-15',
      )}
    >
      {/* Header — fixed height matches main header */}
      <div className="h-16.25 flex items-center justify-center border-b border-border px-3 shrink-0">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shrink-0">
          <TrendingUp size={15} className="text-primary-foreground" />
        </div>
        {expanded && (
          <span className="font-semibold text-foreground text-sm tracking-wide flex-1 ml-2">
            My Wallet
          </span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={expanded ? undefined : item.label}
            className={({ isActive }) =>
              cn(
                'w-full flex items-center rounded-md text-sm transition-colors py-2.5',
                expanded ? 'gap-3 px-3' : 'justify-center px-2',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )
            }
          >
            {item.icon}
            {expanded && item.label}
          </NavLink>
        ))}
      </nav>

      <div className={cn('p-3 border-t border-border', expanded ? '' : 'flex justify-center')}>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
        >
          {expanded ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}
