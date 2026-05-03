import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { useCvmAlerts } from '@/hooks/use-cvm-alerts'

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
)

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Gastos',
  '/portfolio': 'Carteira',
  '/dividends': 'Proventos',
  '/tax': 'Imposto de Renda',
  '/sales': 'Vendas',
  '/calculators': 'Calculadoras',
}

export const AppLayout = () => {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'My Wallet'

  const { alerts, unseenCount, checking, lastCheckedAt, error, check, markAllSeen, dismissOne } =
    useCvmAlerts()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={title}
          alerts={alerts}
          unseenCount={unseenCount}
          checking={checking}
          lastCheckedAt={lastCheckedAt}
          error={error}
          onCheck={check}
          onMarkAllSeen={markAllSeen}
          onDismissOne={dismissOne}
        />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
