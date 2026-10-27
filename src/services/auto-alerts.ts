import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { AutoAlertSettings } from '@/types'

export const DEFAULT_AUTO_ALERTS: AutoAlertSettings = {
  dailyDrop: { enabled: true, pct: 5 },
  weeklyDrop: { enabled: true, pct: 10 },
  belowAvg: { enabled: true },
  email: false,
  fired: {},
}

const settingsDoc = (userId: string) => doc(db, 'users', userId, 'settings', 'auto-alerts')

export const subscribeToAutoAlerts = (userId: string, cb: (settings: AutoAlertSettings) => void) =>
  onSnapshot(settingsDoc(userId), (snap) =>
    cb({ ...DEFAULT_AUTO_ALERTS, ...(snap.data() as Partial<AutoAlertSettings> | undefined) }),
  )

export const saveAutoAlerts = (userId: string, settings: AutoAlertSettings) =>
  setDoc(settingsDoc(userId), settings)
