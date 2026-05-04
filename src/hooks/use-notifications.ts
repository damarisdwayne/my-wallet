import { useEffect, useState } from 'react'
import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
} from '@/services/notifications'
import type { AppNotification } from '@/types'

export const useNotifications = (uid: string | null) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    if (!uid) return
    return subscribeToNotifications(uid, setNotifications)
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
