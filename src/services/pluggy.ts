import { collection, deleteDoc, doc, getDocs, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type {
  PluggyAccount,
  PluggyConnectedItem,
  PluggyInvestmentsPage,
  PluggyTransactionsPage,
} from '@/types/pluggy'

// ─── Connect token (for Pluggy widget) ───────────────────────────

export const getConnectToken = async (itemId?: string): Promise<string> => {
  const res = await fetch('/api/pluggy/connect-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(itemId ? { itemId } : {}),
  })
  if (!res.ok) throw new Error('Failed to get connect token')
  const { accessToken } = await res.json()
  return accessToken
}

// ─── Connected items (Firestore) ──────────────────────────────────

const itemsRef = (userId: string) => collection(db, 'users', userId, 'pluggy_items')

export const subscribeToConnectedItems = (
  userId: string,
  cb: (items: PluggyConnectedItem[]) => void,
) =>
  onSnapshot(itemsRef(userId), (snap) =>
    cb(snap.docs.map((d) => ({ ...d.data(), itemId: d.id }) as PluggyConnectedItem)),
  )

export const saveConnectedItem = (userId: string, item: PluggyConnectedItem) =>
  setDoc(doc(db, 'users', userId, 'pluggy_items', item.itemId), item)

export const deleteConnectedItem = async (userId: string, itemId: string) => {
  await deleteDoc(doc(db, 'users', userId, 'pluggy_items', itemId))
}

export const getConnectedItems = async (userId: string): Promise<PluggyConnectedItem[]> => {
  const snap = await getDocs(itemsRef(userId))
  return snap.docs.map((d) => ({ ...d.data(), itemId: d.id }) as PluggyConnectedItem)
}

// ─── Accounts ─────────────────────────────────────────────────────

export const fetchAccounts = async (itemId: string): Promise<PluggyAccount[]> => {
  const res = await fetch(`/api/pluggy/accounts?itemId=${itemId}`)
  if (!res.ok) throw new Error('Failed to fetch accounts')
  const data = await res.json()
  return data.results ?? []
}

// ─── Transactions ─────────────────────────────────────────────────

export const fetchTransactions = async (
  accountId: string,
  from?: string,
  to?: string,
  page = 1,
): Promise<PluggyTransactionsPage> => {
  const params = new URLSearchParams({ accountId, page: String(page) })
  if (from) params.set('from', from)
  if (to) params.set('to', to)

  const res = await fetch(`/api/pluggy/transactions?${params}`)
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

// ─── Investments ──────────────────────────────────────────────────

export const fetchInvestments = async (itemId: string): Promise<PluggyInvestmentsPage> => {
  const res = await fetch(`/api/pluggy/investments?itemId=${itemId}`)
  if (!res.ok) throw new Error('Failed to fetch investments')
  return res.json()
}
