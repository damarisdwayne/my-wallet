import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
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
  return onSnapshot(q, (snap) => cb(snap.docs.map((doc) => doc.data() as PatrimonyPoint)))
}
