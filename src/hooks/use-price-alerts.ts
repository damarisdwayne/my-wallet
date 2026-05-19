import { useEffect, useRef, useState } from 'react'
import { useAtomValue } from 'jotai'
import { nanoid } from 'nanoid'
import { addNotification } from '@/services/notifications'
import {
  addPriceAlert,
  deletePriceAlert,
  subscribeToPriceAlerts,
  updatePriceAlert,
} from '@/services/price-alerts'
import { fetchLivePrices } from '@/services/quotes'
import { freshPricesAtom } from '@/store/prices'
import type { AppNotification, AssetType, PriceAlert } from '@/types'

const playAlertSound = () => {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15)
    gain.gain.setValueAtTime(0.25, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    // AudioContext not available
  }
}

const requestBrowserPermission = async () => {
  if (!('Notification' in globalThis)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

const sendBrowserNotification = (title: string, message: string) => {
  if (Notification.permission !== 'granted') return
  new Notification(title, { body: message, icon: '/favicon.ico', requireInteraction: true })
}

const sendEmailNotification = async (
  ticker: string,
  targetPrice: number,
  currentPrice: number,
  condition: 'above' | 'below',
  userEmail: string,
) => {
  try {
    await fetch('/api/send-alert-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker, targetPrice, currentPrice, condition, userEmail }),
    })
  } catch {
    // silent — notification still shown in-app
  }
}

const isTriggered = (alert: PriceAlert, price: number): boolean =>
  (alert.condition === 'above' && price >= alert.targetPrice) ||
  (alert.condition === 'below' && price <= alert.targetPrice)

const buildMessage = (alert: PriceAlert, price: number): string => {
  const label = alert.condition === 'above' ? 'subiu para' : 'caiu para'
  return `${alert.ticker} ${label} R$ ${price.toFixed(2)} (alvo: R$ ${alert.targetPrice.toFixed(2)})`
}

const fireAlert = (uid: string, alert: PriceAlert, price: number, userEmail: string | null) => {
  const title = `Alerta: ${alert.ticker}`
  const message = buildMessage(alert, price)

  const notification: AppNotification = {
    id: nanoid(),
    type: 'price_alert',
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    data: { ticker: alert.ticker, targetPrice: alert.targetPrice, currentPrice: price },
  }

  addNotification(uid, notification).catch(() => null)

  if (alert.channels.includes('browser')) {
    sendBrowserNotification(title, message)
    playAlertSound()
  }

  if (alert.channels.includes('email') && userEmail) {
    sendEmailNotification(alert.ticker, alert.targetPrice, price, alert.condition, userEmail).catch(
      () => null,
    )
  }

  updatePriceAlert(uid, alert.id, { active: false }).catch(() => null)
}

export const usePriceAlerts = (uid: string | null, userEmail: string | null) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [alertPrices, setAlertPrices] = useState<Record<string, number>>({})
  const alertsRef = useRef(alerts)
  const freshPrices = useAtomValue(freshPricesAtom)

  useEffect(() => {
    alertsRef.current = alerts
  }, [alerts])

  useEffect(() => {
    if (!uid) return
    return subscribeToPriceAlerts(uid, setAlerts)
  }, [uid])

  useEffect(() => {
    if (!uid || !freshPrices) return

    const activeAlerts = alertsRef.current.filter((a) => a.active)
    if (activeAlerts.length === 0) return

    const runCheck = async () => {
      const missingTickers = activeAlerts
        .map((a) => a.ticker.toUpperCase())
        .filter((t) => freshPrices[t] === undefined)

      let allPrices = { ...freshPrices }

      if (missingTickers.length > 0) {
        try {
          const external = await fetchLivePrices(
            missingTickers.map((t) => ({ ticker: t, type: 'stock' as AssetType })),
          )
          allPrices = { ...allPrices, ...external }
        } catch {
          // continue with portfolio prices only
        }
      }

      setAlertPrices(allPrices)

      for (const alert of activeAlerts) {
        const price = allPrices[alert.ticker.toUpperCase()]
        if (price !== undefined && isTriggered(alert, price)) {
          fireAlert(uid, alert, price, userEmail)
        }
      }
    }

    runCheck().catch(() => null)
  }, [freshPrices, uid, userEmail])

  const createAlert = async (
    data: Omit<PriceAlert, 'id' | 'createdAt' | 'active'>,
  ): Promise<void> => {
    if (!uid) return
    if (data.channels.includes('browser')) await requestBrowserPermission()
    const alert: PriceAlert = {
      ...data,
      id: nanoid(),
      active: true,
      createdAt: new Date().toISOString(),
    }
    await addPriceAlert(uid, alert)
  }

  const toggleAlert = async (alertId: string, active: boolean) => {
    if (!uid) return
    await updatePriceAlert(uid, alertId, { active })
  }

  const removeAlert = async (alertId: string) => {
    if (!uid) return
    await deletePriceAlert(uid, alertId)
  }

  return { alerts, alertPrices, createAlert, toggleAlert, removeAlert }
}
