import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { ImportRecord } from '@/types'

export const subscribeToImports = (userId: string, cb: (records: ImportRecord[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'imports'), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ImportRecord)),
  )

export const saveImportRecord = (userId: string, record: ImportRecord) =>
  setDoc(doc(db, 'users', userId, 'imports', record.id), record)

export const deleteImportRecord = (userId: string, recordId: string) =>
  deleteDoc(doc(db, 'users', userId, 'imports', recordId))
