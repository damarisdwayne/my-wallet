import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { AssetType, CategoryTracking, PortfolioCategory } from '@/types'

type RawCategory = Omit<PortfolioCategory, 'assetTypes' | 'tracking'> & {
  assetTypes?: AssetType[]
  type?: AssetType // legacy single-type field
  tracking?: CategoryTracking
}

const inferTracking = (assetTypes: AssetType[]): CategoryTracking => {
  const passiveOnly = assetTypes.every(
    (t) => t === 'fixed_income' || t === 'tesouro' || t === 'crypto' || t === 'other',
  )
  return passiveOnly ? 'goal_only' : 'both'
}

const migrateCategory = (raw: RawCategory): PortfolioCategory => {
  const { type: _type, ...rest } = raw as RawCategory & { type?: AssetType }
  const assetTypes: AssetType[] =
    raw.assetTypes && raw.assetTypes.length > 0 ? raw.assetTypes : raw.type ? [raw.type] : ['other']
  const tracking: CategoryTracking = raw.tracking ?? inferTracking(assetTypes)
  return { ...rest, assetTypes, tracking } as PortfolioCategory
}

export const subscribeToCategories = (userId: string, cb: (cats: PortfolioCategory[]) => void) =>
  onSnapshot(collection(db, 'users', userId, 'categories'), (snap) => {
    const cats = snap.docs.map((d) => {
      const raw = { id: d.id, ...d.data() } as RawCategory
      const migrated = migrateCategory(raw)
      const needsMigration = !raw.assetTypes || raw.tracking === undefined
      if (needsMigration) {
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
