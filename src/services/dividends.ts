import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Dividend } from '@/types'

export const subscribeToMonthlyDividends = (
  userId: string,
  month: string, // YYYY-MM
  cb: (dividends: Dividend[]) => void,
) => {
  const q = query(
    collection(db, 'users', userId, 'dividends'),
    where('paymentDate', '>=', `${month}-01`),
    where('paymentDate', '<=', `${month}-31`),
  )
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Dividend)),
  )
}
