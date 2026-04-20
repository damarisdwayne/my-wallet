import { useEffect, useState } from 'react'
import { clearMarketCache, fetchMarketData, type MarketData } from '@/services/market-data'

export const useMarketData = () => {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    fetchMarketData()
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const refresh = () => {
    clearMarketCache()
    load()
  }

  return { data, loading, refresh }
}
