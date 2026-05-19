import { Bell, BellOff, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import type { PriceAlert } from '@/types'

export const AlertItem = ({
  alert,
  currentPrice,
  onToggle,
  onRemove,
}: {
  alert: PriceAlert
  currentPrice?: number
  onToggle: (active: boolean) => void
  onRemove: () => void
}) => {
  const isBelow = alert.condition === 'below'
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        alert.active ? 'border-border bg-card' : 'border-border/50 bg-muted/30 opacity-60'
      }`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBelow ? 'bg-red-500/10' : 'bg-emerald-500/10'
        }`}
      >
        {isBelow ? (
          <TrendingDown size={15} className="text-red-500" />
        ) : (
          <TrendingUp size={15} className="text-emerald-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold text-foreground">{alert.ticker}</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-xs text-muted-foreground">
            {isBelow ? 'cair até' : 'subir até'}{' '}
            <span className="font-medium text-foreground">R$ {alert.targetPrice.toFixed(2)}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[11px] text-muted-foreground/60">
            {alert.active ? 'Monitorando' : 'Pausado'}
          </p>
          {currentPrice !== undefined && (
            <>
              <span className="text-[11px] text-muted-foreground/40">·</span>
              <p className="text-[11px] text-muted-foreground/60">
                Atual:{' '}
                <span className="font-medium text-muted-foreground">
                  R$ {currentPrice.toFixed(2)}
                </span>
              </p>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => onToggle(!alert.active)}
          className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title={alert.active ? 'Pausar' : 'Ativar'}
        >
          {alert.active ? <BellOff size={14} /> : <Bell size={14} />}
        </button>
        <button
          onClick={onRemove}
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Remover"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
