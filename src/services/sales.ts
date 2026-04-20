import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { SaleItem } from '@/types'

export const subscribeToAllSales = (userId: string, cb: (items: SaleItem[]) => void) =>
  onSnapshot(
    query(collection(db, 'users', userId, 'sales'), orderBy('boughtAt', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as SaleItem)),
  )

export const addSale = (userId: string, item: Omit<SaleItem, 'id'>) =>
  addDoc(collection(db, 'users', userId, 'sales'), item)

export const updateSale = (userId: string, id: string, data: Partial<Omit<SaleItem, 'id'>>) =>
  updateDoc(doc(db, 'users', userId, 'sales', id), data)

export const deleteSale = (userId: string, id: string) =>
  deleteDoc(doc(db, 'users', userId, 'sales', id))
