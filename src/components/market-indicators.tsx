import { RefreshCw } from 'lucide-react'
import { useMarketData } from '@/hooks/use-market-data'
import { cn } from '@/lib/utils'

function fmtNum(value: number, decimals = 2) {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function fmtBtc(value: number) {
  if (value >= 1_000_000) return `R$ ${fmtNum(value / 1_000_000)}M`
  if (value >= 1_000) return `R$ ${fmtNum(value / 1_000)}k`
  return `R$ ${fmtNum(value)}`
}

interface ItemProps {
  label: string
  value: string
  change?: number
  loading: boolean
}

const Item = ({ label, value, change, loading }: ItemProps) => (
  <div className="flex flex-col gap-0.5 min-w-[80px]">
    <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
      {label}
    </span>
    {loading ? (
      <div className="h-5 w-16 rounded bg-muted animate-pulse" />
    ) : (
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        {change !== undefined && (
          <span
            className={cn(
              'text-[10px] font-semibold',
              change >= 0 ? 'text-success' : 'text-destructive',
            )}
          >
            {change >= 0 ? '+' : ''}
            {fmtNum(change)}%
          </span>
        )}
      </div>
    )}
  </div>
)

export const MarketIndicators = () => {
  const { data, loading, refresh } = useMarketData()

  const updatedAt = data
    ? new Date(data.updatedAt).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <Item
        label="USD / BRL"
        value={data ? `R$ ${fmtNum(data.usdBrl)}` : '—'}
        change={data?.usdBrlChange}
        loading={loading}
      />
      <Item
        label="BTC"
        value={data ? fmtBtc(data.btcBrl) : '—'}
        change={data?.btcBrlChange}
        loading={loading}
      />
      <Item
        label="SELIC"
        value={data && data.selic > 0 ? `${fmtNum(data.selic)}% a.a.` : '—'}
        loading={loading}
      />
      <Item
        label="IPCA 12m"
        value={data && data.ipca12m !== 0 ? `${fmtNum(data.ipca12m)}%` : '—'}
        loading={loading}
      />
      <Item
        label="IGP-M 12m"
        value={data && data.igpm12m !== 0 ? `${fmtNum(data.igpm12m)}%` : '—'}
        loading={loading}
      />
      <button
        onClick={refresh}
        disabled={loading}
        title="Atualizar cotações"
        className={cn(
          'flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-auto self-end pb-0.5',
          loading && 'pointer-events-none',
        )}
      >
        <RefreshCw size={10} className={cn(loading && 'animate-spin')} />
        {updatedAt ? `atualizado às ${updatedAt}` : 'atualizar'}
      </button>
    </div>
  )
}
