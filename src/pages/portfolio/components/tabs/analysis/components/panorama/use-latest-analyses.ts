import { useEffect, useState } from 'react'
import { subscribeToAllAiAnalyses } from '@/services/ai-analyses'
import type { AiAnalysis } from '@/types'

// Latest analysis per ticker, keyed by uppercase ticker.
export const useLatestAnalyses = (uid: string | null) => {
  const [byTicker, setByTicker] = useState<Record<string, AiAnalysis>>({})
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!uid) return
    return subscribeToAllAiAnalyses(uid, (analyses) => {
      const latest: Record<string, AiAnalysis> = {}
      // analyses arrive newest-first, so the first hit per ticker is the latest
      for (const a of analyses) {
        const key = a.ticker.toUpperCase()
        if (!latest[key]) latest[key] = a
      }
      setByTicker(latest)
      setLoaded(true)
    })
  }, [uid])

  return { byTicker, loaded }
}
