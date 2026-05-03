import { Card, CardContent, CardHeader, CardTitle, PatrimonyChart } from '@/components'
import { CURRENT_MONTH } from '@/hooks/use-dashboard'
import type { PatrimonyPoint } from '@/services/patrimony'

type PatrimonyChartComponentProps = {
  patrimonyHistory: PatrimonyPoint[]
  totalPatrimony: number
  loading: boolean
  hidden?: boolean
}

export const PatrimonyChartComponent = ({
  patrimonyHistory,
  totalPatrimony,
  loading,
  hidden,
}: PatrimonyChartComponentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Patrimônio</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-52 rounded bg-muted animate-pulse" />
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
