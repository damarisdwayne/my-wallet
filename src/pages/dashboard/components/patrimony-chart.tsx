import { useMemo, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PatrimonyChart,
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components'
import { CURRENT_MONTH, TODAY } from '@/hooks/use-dashboard'
import type { DailyPatrimonyPoint, PatrimonyPoint } from '@/services/patrimony'
import { DailyChart } from './daily-chart'
import { mergeToday } from './daily-chart/utils'

type View = 'monthly' | 'daily'

const VIEWS: { value: View; label: string }[] = [
  { value: 'daily', label: 'Diário' },
  { value: 'monthly', label: 'Mensal' },
]

type PatrimonyChartComponentProps = {
  patrimonyHistory: PatrimonyPoint[]
  dailyHistory: DailyPatrimonyPoint[]
  totalPatrimony: number
  totalCost: number
  loading: boolean
  hidden?: boolean
}

export const PatrimonyChartComponent = ({
  patrimonyHistory,
  dailyHistory,
  totalPatrimony,
  totalCost,
  loading,
  hidden,
}: PatrimonyChartComponentProps) => {
  const [view, setView] = useState<View>('daily')
  const dailyPoints = useMemo(
    () => mergeToday(dailyHistory, { date: TODAY, value: totalPatrimony, cost: totalCost }),
    [dailyHistory, totalPatrimony, totalCost],
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle>
          {view === 'daily' ? 'Rentabilidade diária' : 'Evolução do Patrimônio'}
        </CardTitle>
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <TabsList>
            {VIEWS.map(({ value, label }) => (
              <TabsTrigger key={value} value={value}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-52 rounded bg-muted animate-pulse" />
        ) : view === 'daily' ? (
          <DailyChart points={dailyPoints} hidden={hidden} />
        ) : (
          <PatrimonyChart
            history={patrimonyHistory}
            currentValue={totalPatrimony}
            currentMonth={CURRENT_MONTH}
            hidden={hidden}
          />
        )}
      </CardContent>
    </Card>
  )
}
