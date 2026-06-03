import { useState } from 'react'
import { RefreshCw, Zap } from 'lucide-react'
import { fetchMarketIntelligence } from '@/services/gemini'
import type { MarketIntelligenceResult } from '@/services/gemini'

const SECTION_ICONS: Record<string, string> = {
  Destaque: '⚡',
  Resultados: '📊',
  Perspectivas: '🔭',
  'Visão do Mercado': '🎯',
  Riscos: '⚠️',
}

export const MarketIntelligence = ({ ticker, type }: { ticker: string; type: 'fii' | 'stock' }) => {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<MarketIntelligenceResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const doFetch = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchMarketIntelligence(ticker, type)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar a IA. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Zap size={13} className="text-primary/70" />
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Resumo IA
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/60 pl-5">
            Últimos resultados, guidance, planos da empresa e visão dos analistas
          </p>
        </div>
        <button
          onClick={doFetch}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Buscando...' : data ? 'Atualizar' : 'Buscar'}
        </button>
      </div>

      {loading && (
        <div className="space-y-2">
          {['sk-0', 'sk-1', 'sk-2', 'sk-3'].map((k) => (
            <div key={k} className="space-y-1.5 animate-pulse">
              <div className="h-3 w-20 rounded bg-muted" />
              <div className="h-2.5 w-[90%] rounded bg-muted" />
              <div className="h-2.5 w-[70%] rounded bg-muted" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-4">
          {data.sections.map((section) => (
            <div
              key={section.title}
              className={
                section.highlight
                  ? 'rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5'
                  : ''
              }
            >
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                {SECTION_ICONS[section.title]} {section.title}
              </p>
              <p
                className={`text-xs leading-relaxed ${section.highlight ? 'text-foreground font-medium' : 'text-foreground/80'}`}
              >
                {section.content}
              </p>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground/40 text-right">
            Atualizado {data.fetchedAt} · Powered by Gemini
          </p>
        </div>
      )}
    </div>
  )
}
