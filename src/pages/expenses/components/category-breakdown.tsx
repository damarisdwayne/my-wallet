import { Card, CardHeader, CardTitle } from '@/components'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import type { ExpenseCategory } from '@/types'
import { categoryLabel } from '../utils'

type Props = {
  totals: Record<string, number>
  grand: number
}

export const CategoryBreakdown = ({ totals, grand }: Props) => {
  const { hideValues } = usePrivacy()

  if (Object.keys(totals).length === 0) return null

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {Object.entries(totals).map(([cat, val]) => (
        <Card key={cat} className="text-center">
          <CardHeader className="p-4">
            <CardTitle>{categoryLabel[cat as ExpenseCategory]}</CardTitle>
            <p className="text-lg font-bold text-foreground">
              {hideValues ? MASK : formatCurrency(val)}
            </p>
            <p className="text-xs text-muted-foreground">{((val / grand) * 100).toFixed(1)}%</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
