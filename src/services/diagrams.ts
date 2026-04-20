import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Diagram } from '@/types'

export const subscribeToDiagrams = (userId: string, cb: (diagrams: Diagram[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'diagrams'), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Diagram)),
  )

export const saveDiagram = (userId: string, diagram: Diagram) =>
  setDoc(doc(db, 'users', userId, 'diagrams', diagram.id), diagram)
