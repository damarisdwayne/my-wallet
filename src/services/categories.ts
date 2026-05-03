import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { AssetType, PortfolioCategory } from '@/types'

type RawCategory = Omit<PortfolioCategory, 'assetTypes'> & {
  assetTypes?: AssetType[]
  type?: AssetType // legacy field
}

const migrateCategory = (raw: RawCategory): PortfolioCategory => {
  if (raw.assetTypes && raw.assetTypes.length > 0) {
    const { type: _type, ...rest } = raw as RawCategory & { type?: AssetType }
    return rest as PortfolioCategory
  }
  // Migrate old single-type field
  const assetTypes: AssetType[] = raw.type ? [raw.type] : ['other']
  const { type: _type, ...rest } = raw as RawCategory & { type?: AssetType }
  return { ...rest, assetTypes } as PortfolioCategory
}

export const subscribeToCategories = (userId: string, cb: (cats: PortfolioCategory[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'categories'), (snap) => {
    const cats = snap.docs.map((d) => {
      const raw = { id: d.id, ...d.data() } as RawCategory
      const migrated = migrateCategory(raw)
      // Persist migration back to Firestore if the old format was detected
      if (!raw.assetTypes) {
        void setDoc(doc(db, 'users', userId, 'categories', migrated.id), migrated)
      }
      return migrated
    })
    cb(cats)
  })

export const saveCategory = (userId: string, cat: PortfolioCategory) =>
  setDoc(doc(db, 'users', userId, 'categories', cat.id), cat)

export const deleteCategory = (userId: string, catId: string) =>
  deleteDoc(doc(db, 'users', userId, 'categories', catId))
