import { useEffect, useRef, useState } from 'react'
import { subscribeToAssets } from '@/services/assets'
import { fetchCvmDocuments } from '@/services/cvm'
import { saveCvmLastSeen, subscribeToCvmSeen } from '@/services/cvm-alerts'
import { useAuth } from '@/store/auth'
import type { CvmDocument } from '@/types'

export interface CvmAlert extends CvmDocument {
  ticker: string
  assetName: string
}

// 30 days ago fallback for first-time users
const fallbackDate = () => {
  const d = new Date()
  d.setDate(d.getDate() - 30)
  return d.toISOString().slice(0, 10)
}

export const useCvmAlerts = () => {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState<CvmAlert[]>([])
  const [checking, setChecking] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  // assets and seen dates live in refs so check() always reads fresh values
  const assetsRef = useRef<{ ticker: string; name: string; type: string }[]>([])
  const seenRef = useRef<Record<string, string>>({})
  const [seenLoaded, setSeenLoaded] = useState(false)

  useEffect(() => {
    if (!user) return
    const unsubs = [
      subscribeToAssets(user.uid, (data) => {
        assetsRef.current = data.map((a) => ({
          ticker: a.ticker,
          name: a.name,
          type: a.type,
        }))
      }),
      subscribeToCvmSeen(user.uid, (seen) => {
        seenRef.current = seen
        setSeenLoaded(true)
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const check = async () => {
    if (!user || checking) return
    const assets = assetsRef.current

    // only FIIs and stocks have CVM reports
    const relevant = assets.filter((a) =>
      ['fii', 'stock', 'etf', 'bdr'].includes(a.type),
    )
    if (relevant.length === 0) return

    setChecking(true)
    setError(null)

    try {
      const found: CvmAlert[] = []

      for (const asset of relevant) {
        try {
          const docs = await fetchCvmDocuments(asset.name)
          const threshold = seenRef.current[asset.ticker] ?? fallbackDate()
          const newDocs = docs.filter((d) => d.deliveryDate > threshold)
          found.push(
            ...newDocs.map((d) => ({
              ...d,
              ticker: asset.ticker,
              assetName: asset.name,
            })),
          )
        } catch {
          // skip individual asset failures silently
        }
      }

      // sort newest first
      found.sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate))
      setAlerts(found)
      setLastCheckedAt(new Date())
    } catch (e) {
      setError('Não foi possível verificar os relatórios. Tente novamente.')
    } finally {
      setChecking(false)
    }
  }

  const markAllSeen = async () => {
    if (!user || alerts.length === 0) return

    // for each ticker, save the newest deliveryDate
    const latest: Record<string, string> = {}
    for (const a of alerts) {
      if (!latest[a.ticker] || a.deliveryDate > latest[a.ticker]) {
        latest[a.ticker] = a.deliveryDate
      }
    }

    await Promise.all(
      Object.entries(latest).map(([ticker, date]) =>
        saveCvmLastSeen(user.uid, ticker, date),
      ),
    )

    setAlerts([])
  }

  const dismissOne = async (alert: CvmAlert) => {
    if (!user) return
    const current = seenRef.current[alert.ticker] ?? ''
    if (alert.deliveryDate > current) {
      await saveCvmLastSeen(user.uid, alert.ticker, alert.deliveryDate)
    }
    setAlerts((prev) => prev.filter((a) => a.downloadUrl !== alert.downloadUrl))
  }

  return {
    alerts,
    unseenCount: alerts.length,
    checking,
    lastCheckedAt,
    seenLoaded,
    error,
    check,
    markAllSeen,
    dismissOne,
  }
}
