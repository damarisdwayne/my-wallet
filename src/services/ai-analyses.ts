import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { AiAnalysis } from '@/types'

export const extractReportDate = (text: string): string | null => {
  const match = /\*\*Data do Relatório:\*\*\s*([^\n]+)/.exec(text)
  return match ? match[1].trim() : null
}

export const extractDocumentType = (text: string): string | null => {
  const match = /\*\*Tipo de Documento:\*\*\s*([^\n]+)/.exec(text)
  return match ? match[1].trim() : null
}

export const saveAiAnalysis = async (
  userId: string,
  ticker: string,
  type: 'fii' | 'stock',
  text: string,
  reportDate: string | null,
  documentType: string | null,
): Promise<void> => {
  await addDoc(collection(db, 'users', userId, 'ai-analyses'), {
    ticker: ticker.toUpperCase(),
    type,
    text,
    reportDate,
    documentType,
    analyzedAt: new Date().toISOString(),
  })
}

export const deleteAiAnalysis = (userId: string, analysisId: string): Promise<void> =>
  deleteDoc(doc(db, 'users', userId, 'ai-analyses', analysisId))

export const subscribeToAiAnalyses = (
  userId: string,
  ticker: string,
  callback: (analyses: AiAnalysis[]) => void,
): (() => void) => {
  const q = query(
    collection(db, 'users', userId, 'ai-analyses'),
    where('ticker', '==', ticker.toUpperCase()),
  )
  return onSnapshot(q, (snap) => {
    const sorted = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<AiAnalysis, 'id'>) }))
      .sort((a, b) => b.analyzedAt.localeCompare(a.analyzedAt))
    callback(sorted)
  })
}
