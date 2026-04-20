import {
  addDoc,
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
import type { Expense, FixedExpense, InstallmentExpense } from '@/types'

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

export const subscribeToFixedExpenses = (userId: string, cb: (items: FixedExpense[]) => void) =>
  onSnapshot(
    query(collection(db, 'users', userId, 'fixedExpenses'), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FixedExpense)),
  )

export const addFixedExpense = (userId: string, item: Omit<FixedExpense, 'id'>) =>
  addDoc(collection(db, 'users', userId, 'fixedExpenses'), item)

export const deleteFixedExpense = (userId: string, id: string) =>
  deleteDoc(doc(db, 'users', userId, 'fixedExpenses', id))

export const subscribeToInstallmentExpenses = (
  userId: string,
  cb: (items: InstallmentExpense[]) => void,
) =>
  onSnapshot(
    query(collection(db, 'users', userId, 'installmentExpenses'), orderBy('createdAt', 'desc')),
    (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InstallmentExpense)),
  )

export const addInstallmentExpense = (userId: string, item: Omit<InstallmentExpense, 'id'>) =>
  addDoc(collection(db, 'users', userId, 'installmentExpenses'), item)

export const deleteInstallmentExpense = (userId: string, id: string) =>
  deleteDoc(doc(db, 'users', userId, 'installmentExpenses', id))
