import { useEffect, useState } from 'react'
import { DEFAULT_AUTO_ALERTS, saveAutoAlerts, subscribeToAutoAlerts } from '@/services/auto-alerts'
import type { AutoAlertSettings } from '@/types'

export const useAutoAlertSettings = (uid: string | null) => {
  const [settings, setSettings] = useState<AutoAlertSettings>(DEFAULT_AUTO_ALERTS)

  useEffect(() => {
    if (!uid) return
    return subscribeToAutoAlerts(uid, setSettings)
  }, [uid])

  const save = async (next: AutoAlertSettings) => {
    if (!uid) return
    setSettings(next)
    await saveAutoAlerts(uid, next)
  }

  return { settings, save }
}
