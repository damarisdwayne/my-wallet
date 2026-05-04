import { CheckCheck, X } from 'lucide-react'
import type { AppNotification } from '@/types'

const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const NotificationItem = ({
  notification,
  onMarkRead,
  onRemove,
}: {
  notification: AppNotification
  onMarkRead: () => void
  onRemove: () => void
}) => (
  <div
    className={`flex gap-3 p-3 rounded-lg border transition-colors ${
      notification.read ? 'border-border bg-card' : 'border-primary/20 bg-primary/5'
    }`}
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5 mb-0.5">
        {!notification.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
        <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>
      <p className="text-[11px] text-muted-foreground/60 mt-1">{fmtDate(notification.createdAt)}</p>
    </div>
    <div className="flex flex-col gap-1 shrink-0">
      {!notification.read && (
        <button
          onClick={onMarkRead}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          title="Marcar como lida"
        >
          <CheckCheck size={13} />
        </button>
      )}
      <button
        onClick={onRemove}
        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        title="Remover"
      >
        <X size={13} />
      </button>
    </div>
  </div>
)
