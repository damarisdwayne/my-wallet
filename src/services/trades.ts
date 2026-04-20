import { addDoc, collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Trade } from '@/types'

export const subscribeToTrades = (userId: string, cb: (trades: Trade[]) => void) =>
  onSnapshot(query(collection(db, 'users', userId, 'trades'), orderBy('date', 'desc')), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Trade)),
  )

export const addTrade = (userId: string, trade: Omit<Trade, 'id'>) =>
  addDoc(collection(db, 'users', userId, 'trades'), trade)

export const addTrades = (userId: string, trades: Omit<Trade, 'id'>[]) =>
  Promise.all(trades.map((t) => addTrade(userId, t)))
