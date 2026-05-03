import type { AssetType, CategoryTracking } from '@/types'

export const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export const emptyForm = () => ({
  name: '',
  assetTypes: ['stock'] as AssetType[],
  targetPercent: '10',
  color: '#3b82f6',
  tracking: 'both' as CategoryTracking,
  selectedDiagramId: '',
  newDiagramName: '',
})
