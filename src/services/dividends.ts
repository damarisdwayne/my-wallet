import { collection, doc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Dividend } from '@/types'

// Deterministic ID ensures reimporting the same file never creates duplicates
const dividendId = (d: Omit<Dividend, 'id'>) => `${d.ticker}-${d.paymentDate}-${d.type}`

export const addDividends = (userId: string, dividends: Omit<Dividend, 'id'>[]) =>
  Promise.all(
    dividends.map((d) => {
      const id = dividendId(d)
      const data = Object.fromEntries(
        Object.entries({ ...d, id }).filter(([, v]) => v !== undefined),
      )
      return setDoc(doc(db, 'users', userId, 'dividends', id), data)
    }),
  )

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
