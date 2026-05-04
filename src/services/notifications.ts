import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { AppNotification } from '@/types'

export const subscribeToNotifications = (
  userId: string,
  cb: (notifications: AppNotification[]) => void,
) =>
  onSnapshot(
    query(collection(db, 'users', userId, 'notifications'), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification)),
  )

export const addNotification = (userId: string, notification: AppNotification) =>
  setDoc(doc(db, 'users', userId, 'notifications', notification.id), notification)

export const markNotificationRead = (userId: string, notificationId: string) =>
  updateDoc(doc(db, 'users', userId, 'notifications', notificationId), { read: true })

export const markAllNotificationsRead = async (userId: string, ids: string[]) => {
  if (ids.length === 0) return
  const batch = writeBatch(db)
  ids.forEach((id) => {
    batch.update(doc(db, 'users', userId, 'notifications', id), { read: true })
  })
  await batch.commit()
}

export const deleteNotification = (userId: string, notificationId: string) =>
  deleteDoc(doc(db, 'users', userId, 'notifications', notificationId))
