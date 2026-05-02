import { collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'

export interface PatrimonyPoint {
  month: string // YYYY-MM
  value: number
}

export const subscribeToPatrimonyHistory = (
  userId: string,
  cb: (history: PatrimonyPoint[]) => void,
) => {
  const q = query(collection(db, 'users', userId, 'patrimonyHistory'), orderBy('month', 'asc'))
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => d.data() as PatrimonyPoint)))
}

// Uses month as doc ID so re-saving the same month overwrites the previous value.
export const savePatrimonySnapshot = (userId: string, month: string, value: number) =>
  setDoc(doc(db, 'users', userId, 'patrimonyHistory', month), { month, value })
