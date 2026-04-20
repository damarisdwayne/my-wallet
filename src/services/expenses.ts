import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Expense } from '@/types'

export const subscribeToMonthlyExpenses = (
  userId: string,
  month: string,
  cb: (expenses: Expense[]) => void,
) => {
  const q = query(
    collection(db, 'users', userId, 'expenses'),
    where('date', '>=', `${month}-01`),
    where('date', '<=', `${month}-31`),
  )
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Expense)))
}

export const subscribeToAllExpenses = (userId: string, cb: (expenses: Expense[]) => void) =>
  onSnapshot(query(collection(db, 'users', userId, 'expenses'), orderBy('date', 'desc')), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Expense)),
  )

export const addExpense = (userId: string, expense: Omit<Expense, 'id'>) =>
  addDoc(collection(db, 'users', userId, 'expenses'), expense)

export const subscribeSalary = (userId: string, cb: (salary: Record<string, number>) => void) =>
  onSnapshot(collection(db, 'users', userId, 'salary'), (snap) => {
    const record: Record<string, number> = {}
    snap.docs.forEach((d) => {
      record[d.id] = (d.data() as { amount: number }).amount
    })
    cb(record)
  })

export const setSalary = (userId: string, month: string, amount: number) =>
  setDoc(doc(db, 'users', userId, 'salary', month), { amount })
