import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import type { AssetType, CategoryTracking, PortfolioCategory } from '@/types'

type RawCategory = Omit<PortfolioCategory, 'assetTypes' | 'tracking'> & {
  assetTypes?: AssetType[]
  type?: AssetType // legacy single-type field
  tracking?: CategoryTracking
}

const inferTracking = (): CategoryTracking => 'goal'

const normalizeTracking = (t: string | undefined): CategoryTracking => {
  if (t === 'diagram' || t === 'none') return t
  return 'goal' // covers 'both', 'goal', undefined, and any legacy value
}

const migrateCategory = (raw: RawCategory): PortfolioCategory => {
  const { type: _type, ...rest } = raw as RawCategory & { type?: AssetType }
  const assetTypes: AssetType[] =
    raw.assetTypes && raw.assetTypes.length > 0 ? raw.assetTypes : raw.type ? [raw.type] : ['other']
  const tracking: CategoryTracking = normalizeTracking(raw.tracking ?? inferTracking())
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
