import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { PriceAlert } from '@/types'

export const subscribeToPriceAlerts = (userId: string, cb: (alerts: PriceAlert[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'price-alerts'), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PriceAlert)),
  )

export const addPriceAlert = (userId: string, alert: PriceAlert) =>
  setDoc(doc(db, 'users', userId, 'price-alerts', alert.id), alert)

export const updatePriceAlert = (userId: string, alertId: string, data: Partial<PriceAlert>) =>
  updateDoc(doc(db, 'users', userId, 'price-alerts', alertId), data)

export const deletePriceAlert = (userId: string, alertId: string) =>
  deleteDoc(doc(db, 'users', userId, 'price-alerts', alertId))
