import { useState } from 'react'
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react'
import { fetchRecentCommunications } from '@/services/gemini'
import type { CommunicationItem } from '@/services/gemini'

const TYPE_COLORS: Record<string, string> = {
  'Relatório Gerencial': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Fato Relevante': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Release de Resultados': 'bg-green-500/10 text-green-400 border-green-500/20',
  DFP: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  ITR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}

const typeBadge = (type: string) =>
  TYPE_COLORS[type] ?? 'bg-muted text-muted-foreground border-border'

const SOURCE_LINKS = (ticker: string, type: 'fii' | 'stock') => {
  const t = ticker.toLowerCase()
  if (type === 'fii') {
    return [
      { label: 'Funds Explorer', url: `https://www.fundsexplorer.com.br/funds/${t}` },
      { label: 'Status Invest', url: `https://statusinvest.com.br/fundos-imobiliarios/${t}` },
      { label: 'CVM', url: `https://www.rad.cvm.gov.br/ENET/frmConsultaExternaCVM.aspx` },
    ]
  }
  return [
    { label: 'Status Invest', url: `https://statusinvest.com.br/acoes/${t}` },
    { label: 'Investidor10', url: `https://investidor10.com.br/acoes/${t}` },
    { label: 'CVM', url: `https://www.rad.cvm.gov.br/ENET/frmConsultaExternaCVM.aspx` },
  ]
}

export const RecentCommunications = ({
  ticker,
  type,
}: {
  ticker: string
  type: 'fii' | 'stock'
}) => {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<CommunicationItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const doFetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchRecentCommunications(ticker, type)
      setItems(result.items)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(
        msg.includes('429')
          ? 'Cota da API excedida. Tente novamente em alguns segundos.'
          : `Erro: ${msg}`,
      )
    } finally {
      setLoading(false)
    }
  }

  const sources = SOURCE_LINKS(ticker, type)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper size={14} className="text-primary/70" />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Comunicados recentes
          </p>
        </div>
        <button
          onClick={doFetch}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Buscando...' : items ? 'Atualizar' : 'Buscar novidades'}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {['sk-0', 'sk-1', 'sk-2'].map((key) => (
            <div key={key} className="rounded-lg border border-border p-3 space-y-2 animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-4 w-24 rounded-full bg-muted" />
                <div className="h-3 w-16 rounded bg-muted ml-auto" />
              </div>
              <div className="h-3 w-[85%] rounded bg-muted" />
              <div className="h-3 w-[65%] rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {items && !loading && items.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          Nenhum documento relevante encontrado.
        </p>
      )}

      {items && !loading && items.length > 0 && (
        <>
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={`${item.type}-${item.date}`}
                className="rounded-lg border border-border p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${typeBadge(item.type)}`}
                  >
                    {item.type}
                  </span>
                  {item.date && (
                    <span className="text-[10px] text-muted-foreground/60 shrink-0">
                      {item.date}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>

          <div className="pt-1 space-y-1.5">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              Buscar documentos em
            </p>
            <div className="flex flex-wrap gap-2">
              {sources.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary transition-colors border border-border rounded-md px-2 py-1"
                >
                  <ExternalLink size={10} />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
