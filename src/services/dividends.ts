import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Dividend } from '@/types'

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

export const subscribeToAllDividends = (userId: string, cb: (dividends: Dividend[]) => void) =>
  onSnapshot(
    query(collection(db, 'users', userId, 'dividends'), orderBy('paymentDate', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Dividend)),
  )
