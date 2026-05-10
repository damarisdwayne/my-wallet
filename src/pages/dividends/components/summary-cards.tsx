import { Card, CardHeader, CardTitle, CardValue } from '@/components'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import { MonthDonutCard } from './upcoming-dividends'

type Props = {
  total12: number
  avg12: number
  paidCurrentMonth: number
  provisionedCurrentMonth: number
  prevMonthTotal: number
}

export const SummaryCards = ({
  total12,
  avg12,
  paidCurrentMonth,
  provisionedCurrentMonth,
  prevMonthTotal,
}: Props) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Últimos 12 meses</CardTitle>
          <CardValue>{fmt(total12)}</CardValue>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Média mensal</CardTitle>
          <CardValue>{fmt(avg12)}</CardValue>
        </CardHeader>
      </Card>
      <MonthDonutCard
        paid={paidCurrentMonth}
        provisioned={provisionedCurrentMonth}
        prevMonth={prevMonthTotal}
      />
    </div>
  )
}
