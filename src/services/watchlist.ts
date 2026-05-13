import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { WatchlistAsset, WatchlistGroup } from '@/types'

const stripUndefined = <T extends object>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T

export const subscribeToWatchlistGroups = (
  userId: string,
  cb: (groups: WatchlistGroup[]) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'watchlistGroups'), (snap) => {
    const groups = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as WatchlistGroup)
      .sort((a, b) => a.order - b.order)
    cb(groups)
  })

export const subscribeToWatchlistAssets = (
  userId: string,
  cb: (assets: WatchlistAsset[]) => void,
) =>
  onSnapshot(collection(db, 'users', userId, 'watchlistAssets'), (snap) => {
    const assets = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }) as WatchlistAsset)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    cb(assets)
  })

export const addWatchlistGroup = (userId: string, group: WatchlistGroup) =>
  setDoc(doc(db, 'users', userId, 'watchlistGroups', group.id), stripUndefined(group))

export const updateWatchlistGroup = (
  userId: string,
  groupId: string,
  data: Partial<WatchlistGroup>,
) => updateDoc(doc(db, 'users', userId, 'watchlistGroups', groupId), stripUndefined(data))

export const deleteWatchlistGroup = async (userId: string, groupId: string, assetIds: string[]) => {
  const batch = writeBatch(db)
  batch.delete(doc(db, 'users', userId, 'watchlistGroups', groupId))
  assetIds.forEach((id) => batch.delete(doc(db, 'users', userId, 'watchlistAssets', id)))
  return batch.commit()
}

export const addWatchlistAsset = (userId: string, asset: WatchlistAsset) =>
  setDoc(doc(db, 'users', userId, 'watchlistAssets', asset.id), stripUndefined(asset))

export const updateWatchlistAsset = (
  userId: string,
  assetId: string,
  data: Partial<WatchlistAsset>,
) => updateDoc(doc(db, 'users', userId, 'watchlistAssets', assetId), data)

export const deleteWatchlistAsset = (userId: string, assetId: string) =>
  deleteDoc(doc(db, 'users', userId, 'watchlistAssets', assetId))
