import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { useNotifications } from '@/hooks/use-notifications'
import { usePriceAlerts } from '@/hooks/use-price-alerts'
import { useAuth } from '@/store/auth'

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
  const { user } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications(
    user?.uid ?? null,
  )
  const { alerts, createAlert, toggleAlert, removeAlert } = usePriceAlerts(
    user?.uid ?? null,
    user?.email ?? null,
  )

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          title={title}
          notifications={notifications}
          unreadCount={unreadCount}
          alerts={alerts}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onRemoveNotification={remove}
          onCreateAlert={createAlert}
          onToggleAlert={toggleAlert}
          onRemoveAlert={removeAlert}
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
