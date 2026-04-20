import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { PortfolioCategory } from '@/types'

export const subscribeToCategories = (userId: string, cb: (cats: PortfolioCategory[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'categories'), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PortfolioCategory)),
  )

export const saveCategory = (userId: string, cat: PortfolioCategory) =>
  setDoc(doc(db, 'users', userId, 'categories', cat.id), cat)

export const deleteCategory = (userId: string, catId: string) =>
  deleteDoc(doc(db, 'users', userId, 'categories', catId))
