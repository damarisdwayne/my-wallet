import { BookOpen, Calculator, Home, LayoutDashboard, Receipt, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Início', icon: LayoutDashboard },
  { to: '/expenses', label: 'Gastos', icon: Receipt },
  { to: '/portfolio', label: 'Carteira', icon: TrendingUp },
  { to: '/tax', label: 'IR', icon: Home },
  { to: '/calculators', label: 'Calc', icon: Calculator },
  { to: '/knowledge', label: 'Info', icon: BookOpen },
]

export const MobileNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center border-t border-border bg-card md:hidden">
    {navItems.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          cn(
            'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
            isActive ? 'text-primary' : 'text-muted-foreground',
          )
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
            <span className="leading-none">{label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
)
