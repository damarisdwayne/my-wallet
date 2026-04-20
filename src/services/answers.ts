import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { AssetAnswers } from '@/types'

export const subscribeToAnswers = (
  userId: string,
  cb: (answers: Record<string, AssetAnswers>) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'answers'), (snap) => {
    const record: Record<string, AssetAnswers> = {}
    snap.docs.forEach((d) => {
      record[d.id] = d.data() as AssetAnswers
    })
    cb(record)
  })

export const saveAnswers = (userId: string, assetId: string, answers: AssetAnswers) =>
  setDoc(doc(db, 'users', userId, 'answers', assetId), answers)
