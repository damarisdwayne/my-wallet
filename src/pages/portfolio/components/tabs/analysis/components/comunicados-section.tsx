import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components'
import { fetchInvestidor10Comunicados, type Investidor10Comunicado } from '@/services/investidor10'

const VISIBLE_PAGES = 5

const getPageRange = (current: number, total: number): (number | '...')[] => {
  if (total <= VISIBLE_PAGES + 2) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  const start = Math.max(2, current - 2)
  const end = Math.min(total - 1, current + 2)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')
  pages.push(total)
  return pages
}

export const ComunicadosSection = ({
  ticker,
  type,
}: {
  ticker: string
  type: 'stock' | 'fii'
}) => {
  const [items, setItems] = useState<Investidor10Comunicado[]>([])
  const [fetching, setFetching] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetching(true)
    fetchInvestidor10Comunicados(ticker, type, page)
      .then(({ items: data, totalPages: total }) => {
        setItems(data)
        setTotalPages(total)
      })
      .catch(() => null)
      .finally(() => setFetching(false))
  }, [ticker, type, page])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
  }, [ticker, type])

  if (!fetching && items.length === 0) return null

  const goTo = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return
    setPage(p)
  }

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Comunicados
      </p>

      <div className="rounded-lg border border-border overflow-hidden">
        {fetching ? (
          <div className="divide-y divide-border">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 gap-4">
                <Skeleton className="h-3.5 w-2/3" />
                <div className="flex items-center gap-4 shrink-0">
                  <Skeleton className="h-3 w-20 hidden sm:block" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="divide-y divide-border">
              {items.map((c) => (
                <div
                  key={c.url}
                  className="flex items-center justify-between px-4 py-3 gap-4 hover:bg-muted/40 transition-colors"
                >
                  <p className="text-sm text-foreground leading-snug">{c.title}</p>
                  <div className="flex items-center gap-4 shrink-0">
                    {c.date && (
                      <span className="text-xs text-muted-foreground hidden sm:block">{c.date}</span>
                    )}
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                      Abrir
                      <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-border">
                <button
                  onClick={() => goTo(page - 1)}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ChevronLeft size={14} />
                  Anterior
                </button>

                <div className="flex items-center gap-1 mx-1">
                  {getPageRange(page, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`ellipsis-${String(i)}`} className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goTo(p)}
                        className={`min-w-7 h-7 rounded-md text-xs transition-colors ${
                          p === page
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <button
                  onClick={() => goTo(page + 1)}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:pointer-events-none"
                >
                  Próxima
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
