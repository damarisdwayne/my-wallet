import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { Asset } from '@/types'

export const subscribeToAssets = (userId: string, cb: (assets: Asset[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'assets'), (snap) =>
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Asset)),
  )

export const addAsset = (userId: string, asset: Asset) =>
  setDoc(doc(db, 'users', userId, 'assets', asset.id), asset)

export const updateAssetPrice = (userId: string, assetId: string, price: number) =>
  updateDoc(doc(db, 'users', userId, 'assets', assetId), { currentPrice: price })

export const updateAsset = (userId: string, assetId: string, data: Partial<Asset>) =>
  updateDoc(doc(db, 'users', userId, 'assets', assetId), data)
