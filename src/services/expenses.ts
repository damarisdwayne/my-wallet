import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Expense } from '@/types'

export const subscribeToMonthlyExpenses = (
  userId: string,
  month: string, // YYYY-MM
  cb: (expenses: Expense[]) => void,
) => {
  const q = query(
    collection(db, 'users', userId, 'expenses'),
    where('date', '>=', `${month}-01`),
    where('date', '<=', `${month}-31`),
  )
  return onSnapshot(q, (snap) =>
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Expense)),
  )
}
