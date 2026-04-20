import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Asset } from '@/types'

export const subscribeToAssets = (userId: string, cb: (assets: Asset[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'assets'), (snap) =>
    cb(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Asset)),
  )
