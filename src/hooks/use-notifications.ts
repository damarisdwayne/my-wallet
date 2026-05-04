import { useEffect, useState } from 'react'
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from '@/services/notifications'
import type { AppNotification } from '@/types'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const isOld = (n: AppNotification) => Date.now() - new Date(n.createdAt).getTime() > THIRTY_DAYS_MS

const purgeAndSet = (uid: string, data: AppNotification[], set: (v: AppNotification[]) => void) => {
  data.filter(isOld).forEach((n) => deleteNotification(uid, n.id).catch(() => null))
  set(data.filter((n) => !isOld(n)))
}

export const useNotifications = (uid: string | null) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!uid) return
    return subscribeToNotifications(uid, (data) => purgeAndSet(uid, data, setNotifications))
  }, [uid])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = async (notificationId: string) => {
    if (!uid) return
    await markNotificationRead(uid, notificationId)
  }

  const markAllRead = async () => {
    if (!uid) return
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    await markAllNotificationsRead(uid, unreadIds)
  }

  const remove = async (notificationId: string) => {
    if (!uid) return
    await deleteNotification(uid, notificationId)
  }

  return { notifications, unreadCount, markRead, markAllRead, remove }
}
