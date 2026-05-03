import { Card, CardContent, CardHeader, CardTitle } from '@/components'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

import type { ExpenseCategory } from '@/types'
import { CATEGORY_SVG_COLORS, categoryLabel } from '../utils'

type Props = {
  salary: number
  grand: number
  spentPct: number
  totals: Record<string, number>
}

export const SalaryBar = ({ salary, grand, spentPct, totals }: Props) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

  if (salary <= 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprometimento do salário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-5 rounded-full overflow-hidden flex bg-muted">
          {Object.entries(totals).map(([cat, val]) => (
            <div
              key={cat}
              style={{
                width: `${(val / salary) * 100}%`,
                background: CATEGORY_SVG_COLORS[cat as ExpenseCategory],
              }}
              title={`${categoryLabel[cat as ExpenseCategory]}: ${fmt(val)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
          <span>
            <span
              className={
                spentPct >= 90
                  ? 'text-destructive'
                  : spentPct >= 70
                    ? 'text-warning'
                    : 'text-foreground'
              }
            >
              {spentPct.toFixed(1)}%
            </span>{' '}
            comprometido — {fmt(grand)}
          </span>
          <span>{fmt(salary)}</span>
        </div>
        {Object.keys(totals).length > 0 && (
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-border">
            {Object.entries(totals)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, val]) => (
                <div key={cat} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: CATEGORY_SVG_COLORS[cat as ExpenseCategory] }}
                  />
                  <span className="text-muted-foreground">
                    {categoryLabel[cat as ExpenseCategory]}
                  </span>
                  <span className="font-medium text-foreground">{fmt(val)}</span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
