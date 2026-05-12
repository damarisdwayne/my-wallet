import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { AssetType } from '@/types'

interface TickerOption {
  symbol: string
  name: string
  type: AssetType
}

let cachedOptions: TickerOption[] | null = null
let fetchPromise: Promise<TickerOption[]> | null = null

const fetchAllTickers = (): Promise<TickerOption[]> => {
  if (cachedOptions) return Promise.resolve(cachedOptions)
  if (fetchPromise) return fetchPromise

  fetchPromise = Promise.all([
    fetch('https://mfinance.com.br/api/v1/stocks').then((r) => r.json()),
    fetch('https://mfinance.com.br/api/v1/fiis').then((r) => r.json()),
  ]).then(([stocksData, fiisData]) => {
    const stocks: TickerOption[] = (stocksData.stocks ?? [])
      .filter((s: { symbol: string }) => s.symbol)
      .map((s: { symbol: string; name: string }) => ({
        symbol: s.symbol.toUpperCase(),
        name: s.name ?? s.symbol,
        type: 'stock' as AssetType,
      }))

    const fiis: TickerOption[] = (fiisData.fiis ?? [])
      .filter((f: { symbol: string; name: string }) => f.symbol && f.name && f.name !== '#N/A')
      .map((f: { symbol: string; name: string }) => ({
        symbol: f.symbol.toUpperCase(),
        name: f.name,
        type: 'fii' as AssetType,
      }))

    cachedOptions = [...stocks, ...fiis].sort((a, b) => a.symbol.localeCompare(b.symbol))
    return cachedOptions
  })

  return fetchPromise
}

const TYPE_LABEL: Partial<Record<AssetType, string>> = {
  stock: 'Ação',
  fii: 'FII',
}

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (ticker: string, name: string, type: AssetType) => void
}

export const AddWatchlistAssetDialog = ({ open, onClose, onAdd }: Props) => {
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<TickerOption[]>(cachedOptions ?? [])
  const [loading, setLoading] = useState(!cachedOptions)
  const [selected, setSelected] = useState<TickerOption | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || cachedOptions) return
    let cancelled = false
    fetchAllTickers().then((data) => {
      if (cancelled) return
      setOptions(data)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [open])

  const handleClose = () => {
    setQuery('')
    setSelected(null)
    setShowDropdown(false)
    onClose()
  }

  const filtered =
    query.length >= 1
      ? options
          .filter(
            (o) =>
              o.symbol.startsWith(query.toUpperCase()) ||
              o.name.toLowerCase().includes(query.toLowerCase()),
          )
          .slice(0, 12)
      : []

  const handleSelect = (opt: TickerOption) => {
    setSelected(opt)
    setQuery(opt.symbol)
    setShowDropdown(false)
  }

  const handleAdd = () => {
    if (!query.trim()) return
    const ticker = selected?.symbol ?? query.trim().toUpperCase()
    const name = selected?.name ?? ticker
    const type = selected?.type ?? 'stock'
    onAdd(ticker, name, type)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      {/* overflow-visible allows the dropdown to escape the dialog bounds */}
      <DialogContent className="overflow-visible">
        <DialogHeader>
          <DialogTitle>Adicionar Ativo</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-1">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Buscar ativo</p>
            <div ref={wrapperRef} className="relative">
              <div className="flex items-center h-10 rounded-md border border-input bg-background px-3 gap-2 focus-within:ring-2 focus-within:ring-ring">
                {loading && (
                  <Loader2 size={14} className="shrink-0 text-muted-foreground animate-spin" />
                )}
                <input
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  placeholder="MXRF11, PETR4, Petrobras..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setSelected(null)
                    setShowDropdown(true)
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (filtered.length > 0) handleSelect(filtered[0])
                      else handleAdd()
                    }
                    if (e.key === 'Escape') setShowDropdown(false)
                  }}
                />
              </div>

              {showDropdown && filtered.length > 0 && (
                <div className="absolute z-50 top-full mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-border bg-card shadow-lg">
                  {filtered.map((opt) => (
                    <button
                      key={opt.symbol}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        handleSelect(opt)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-accent transition-colors text-left"
                    >
                      <span className="font-semibold text-foreground w-16 shrink-0">
                        {opt.symbol}
                      </span>
                      <span className="text-muted-foreground truncate flex-1">{opt.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {TYPE_LABEL[opt.type]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selected && (
              <p className="mt-1 text-xs text-muted-foreground truncate">
                {selected.name} · {TYPE_LABEL[selected.type]}
              </p>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!query.trim()}
            className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            Adicionar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
