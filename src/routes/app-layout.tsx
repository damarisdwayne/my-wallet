import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Gastos',
  '/portfolio': 'Carteira',
  '/dividends': 'Proventos',
  '/tax': 'Imposto de Renda',
  '/sales': 'Vendas',
}

export const AppLayout = () => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'My Wallet'

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
