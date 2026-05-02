import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'

export interface CvmSeenRecord {
  ticker: string
  lastDate: string // last deliveryDate seen, ISO-like string
}

// users/{userId}/cvmSeen/{ticker} → { ticker, lastDate }
export const subscribeToCvmSeen = (
  userId: string,
  cb: (seen: Record<string, string>) => void,
): (() => void) =>
  onSnapshot(collection(db, 'users', userId, 'cvmSeen'), (snap) => {
    const map: Record<string, string> = {}
    snap.docs.forEach((d) => {
      const data = d.data() as CvmSeenRecord
      map[data.ticker] = data.lastDate
    })
    cb(map)
  })

export const saveCvmLastSeen = (userId: string, ticker: string, lastDate: string) =>
  setDoc(doc(db, 'users', userId, 'cvmSeen', ticker), { ticker, lastDate })
