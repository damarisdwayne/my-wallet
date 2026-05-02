import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Dividend } from '@/types'

// dividendo_ext maps to the same slot as dividendo so re-importing ext overwrites existing record
const dividendId = (d: Omit<Dividend, 'id'>) =>
  `${d.ticker}-${d.paymentDate}-${d.type === 'dividendo_ext' ? 'dividendo' : d.type}`

export const addDividends = (userId: string, dividends: Omit<Dividend, 'id'>[]) => {
  // B3 can report the same dividend in multiple rows (e.g. repeated payments for the same lot).
  // Merge by key and sum amounts so the stored value reflects the real total received.
  const merged = new Map<string, Omit<Dividend, 'id'>>()
  for (const d of dividends) {
    const id = dividendId(d)
    const existing = merged.get(id)
    if (existing) {
      existing.amount += d.amount
      if (d.ir) existing.ir = (existing.ir ?? 0) + d.ir
    } else {
      merged.set(id, { ...d })
    }
  }
  return Promise.all(
    Array.from(merged.entries()).map(([id, d]) => {
      const data = Object.fromEntries(
        Object.entries({ ...d, id }).filter(([, v]) => v !== undefined),
      )
      return setDoc(doc(db, 'users', userId, 'dividends', id), data)
    }),
  )
}

export const subscribeToMonthlyDividends = (
  userId: string,
  month: string,
  cb: (dividends: Dividend[]) => void,
) => {
  const q = query(
    collection(db, 'users', userId, 'dividends'),
    where('paymentDate', '>=', `${month}-01`),
    where('paymentDate', '<=', `${month}-31`),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Dividend)))
}

export const deleteDividend = (userId: string, dividendId: string) =>
  deleteDoc(doc(db, 'users', userId, 'dividends', dividendId))

export const subscribeToAllDividends = (userId: string, cb: (dividends: Dividend[]) => void) =>
  onSnapshot(
    query(collection(db, 'users', userId, 'dividends'), orderBy('paymentDate', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Dividend)),
  )
