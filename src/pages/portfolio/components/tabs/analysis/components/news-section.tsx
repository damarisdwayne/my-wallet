import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components'
import { fetchInvestidor10News, type Investidor10NewsItem } from '@/services/investidor10'

export const NewsSection = ({ ticker, type }: { ticker: string; type: 'stock' | 'fii' }) => {
  const [news, setNews] = useState<Investidor10NewsItem[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetching(true)
    fetchInvestidor10News(ticker, type)
      .then(setNews)
      .catch(() => null)
      .finally(() => setFetching(false))
  }, [ticker, type])

  if (!fetching && news.length === 0) return null

  const moreUrl = `https://investidor10.com.br/noticias/ativo/${ticker.toLowerCase()}/`

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
        Notícias
      </p>

      {fetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg border border-border overflow-hidden">
              <Skeleton className="h-36 w-full rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-2.5 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {news.map((item) => (
              <a
                key={item.url}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-border overflow-hidden hover:border-primary/50 transition-colors group flex flex-col"
              >
                {item.image && (
                  <div className="h-36 overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-3 flex flex-col gap-1 flex-1">
                  {item.category && (
                    <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
                      {item.category}
                    </span>
                  )}
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-3 flex-1">
                    {item.title}
                  </p>
                  {item.date && (
                    <p className="text-[10px] text-muted-foreground/70 mt-1">{item.date}</p>
                  )}
                </div>
              </a>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <a
              href={moreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              Ver mais notícias
              <ExternalLink size={13} />
            </a>
          </div>
        </>
      )}
    </div>
  )
}
