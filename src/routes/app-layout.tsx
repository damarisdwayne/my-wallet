import { Suspense } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { ChatAssistant } from '@/components/chat-assistant'
import { PwaInstallPrompt } from '@/components/pwa-install-prompt'
import { useNotifications } from '@/hooks/use-notifications'
import { usePriceAlerts } from '@/hooks/use-price-alerts'
import { useAuth } from '@/store/auth'
import { PageLoader } from '@/components'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Gastos',
  '/portfolio': 'Carteira',
  '/dividends': 'Proventos',
  '/tax': 'Imposto de Renda',
  '/sales': 'Vendas',
  '/calculators': 'Calculadoras',
  '/knowledge': 'Conhecimento',
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
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav />
      <ChatAssistant />
      <PwaInstallPrompt />
    </div>
  )
}
