import { useEffect, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { nanoid } from 'nanoid'
import { playAlertSound, sendAlertEmail, sendBrowserNotification } from '@/lib/alert-delivery'
import { AUTO_ALERT_TITLES, summarize } from '@/lib/auto-alert-messages'
import { detectAutoAlerts } from '@/lib/auto-alerts'
import type { AlertHit } from '@/lib/auto-alerts'
import { fetchVariationPct } from '@/lib/price-variation'
import { subscribeToAssets } from '@/services/assets'
import { saveAutoAlerts } from '@/services/auto-alerts'
import { addNotification } from '@/services/notifications'
import type { PriceMap } from '@/services/quotes'
import { freshPricesAtom } from '@/store/prices'
import type { Asset, AutoAlertKind, AutoAlertSettings } from '@/types'
import { useAutoAlertSettings } from './use-auto-alert-settings'

const WEEK_DAYS = 7

const weeklyVariations = async (assets: Asset[], prices: PriceMap) => {
  const entries = await Promise.all(
    assets.map(async (a) => {
      const p = prices[a.ticker.toUpperCase()]
      if (!p) return [a.ticker, null] as const
      const fresh = { ...a, currentPrice: p.brl, currentPriceUsd: p.usd ?? a.currentPriceUsd }
      return [a.ticker, await fetchVariationPct(fresh, WEEK_DAYS)] as const
    }),
  )
  return new Map(entries.filter((e): e is readonly [string, number] => e[1] !== null))
}

const notify = (uid: string, kind: AutoAlertKind, hits: AlertHit[], email: string | null) => {
  const title = AUTO_ALERT_TITLES[kind]
  const { lines, message } = summarize(hits)
  addNotification(uid, {
    id: nanoid(),
    type: 'auto_alert',
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    data: { kind, tickers: hits.map((h) => h.asset.ticker) },
  }).catch(() => null)
  sendBrowserNotification(title, message)
  if (email) void sendAlertEmail({ title, lines, userEmail: email })
}

export const useAutoAlerts = (uid: string | null, userEmail: string | null) => {
  const { settings } = useAutoAlertSettings(uid)
  const [assets, setAssets] = useState<Asset[]>([])
  const freshPrices = useAtomValue(freshPricesAtom)
  const latest = useRef({ settings, assets })
  const running = useRef(false)

  useEffect(() => {
    latest.current = { settings, assets }
  }, [settings, assets])

  useEffect(() => {
    if (!uid) return
    return subscribeToAssets(uid, setAssets)
  }, [uid])

  useEffect(() => {
    if (!uid || !freshPrices || running.current) return
    const { settings: current, assets: held } = latest.current
    if (held.length === 0) return

    const run = async (cfg: AutoAlertSettings) => {
      const weekly = cfg.weeklyDrop.enabled ? await weeklyVariations(held, freshPrices) : new Map()
      const today = new Date().toISOString().slice(0, 10)
      const { hits, fired } = detectAutoAlerts({
        assets: held,
        prices: freshPrices,
        weekly,
        settings: cfg,
        today,
      })
      if (JSON.stringify(fired) !== JSON.stringify(cfg.fired))
        await saveAutoAlerts(uid, { ...cfg, fired })
      if (hits.length === 0) return

      const kinds = [...new Set(hits.map((h) => h.kind))]
      kinds.forEach((kind) =>
        notify(
          uid,
          kind,
          hits.filter((h) => h.kind === kind),
          cfg.email ? userEmail : null,
        ),
      )
      playAlertSound()
    }

    running.current = true
    run(current)
      .catch(() => null)
      .finally(() => {
        running.current = false
      })
  }, [freshPrices, uid, userEmail])
}
