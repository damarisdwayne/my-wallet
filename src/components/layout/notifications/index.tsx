import { useState } from 'react'
import { Bell, BellOff, CheckCheck } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { AlertItem } from './alert-item'
import { CreateAlertForm } from './create-alert-form'
import { NotificationItem } from './notification-item'
import type { AppNotification, PriceAlert } from '@/types'

type NotificationsSheetProps = {
  notifications: AppNotification[]
  unreadCount: number
  alerts: PriceAlert[]
  alertPrices: Record<string, number>
  onMarkRead: (id: string) => void
  onMarkAllRead: () => void
  onRemoveNotification: (id: string) => void
  onCreateAlert: (data: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>) => Promise<void>
  onToggleAlert: (id: string, active: boolean) => void
  onRemoveAlert: (id: string) => void
}

type Tab = 'notifications' | 'alerts'

const TABS: { key: Tab; label: string }[] = [
  { key: 'notifications', label: 'Notificações' },
  { key: 'alerts', label: 'Alertas de preço' },
]

export const NotificationsSheet = ({
  notifications,
  unreadCount,
  alerts,
  alertPrices,
  onMarkRead,
  onMarkAllRead,
  onRemoveNotification,
  onCreateAlert,
  onToggleAlert,
  onRemoveAlert,
}: NotificationsSheetProps) => {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('notifications')

  const tabCount = (key: Tab) =>
    key === 'notifications' ? unreadCount : alerts.filter((a) => a.active).length

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="relative p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Notificações"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-white font-bold flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 border-l-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
          <SheetTitle className="text-base">Central de notificações</SheetTitle>
        </SheetHeader>

        <div className="flex border-b border-border shrink-0">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border-b-2 text-sm font-medium transition-colors ${
                tab === key
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
              {tabCount(key) > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold leading-none">
                  {tabCount(key)}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {tab === 'notifications' && (
            <>
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="w-full flex items-center justify-center gap-1.5 h-8 rounded-md border border-border text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                >
                  <CheckCheck size={13} />
                  Marcar todas como lidas
                </button>
              )}
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell size={32} className="text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={() => onMarkRead(n.id)}
                    onRemove={() => onRemoveNotification(n.id)}
                  />
                ))
              )}
            </>
          )}

          {tab === 'alerts' && (
            <>
              <CreateAlertForm onSubmit={onCreateAlert} />
              {alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <BellOff size={28} className="text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum alerta criado</p>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Ativos ({alerts.length})
                  </p>
                  {alerts.map((a) => (
                    <AlertItem
                      key={a.id}
                      alert={a}
                      currentPrice={alertPrices[a.ticker.toUpperCase()]}
                      onToggle={(active) => onToggleAlert(a.id, active)}
                      onRemove={() => onRemoveAlert(a.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
