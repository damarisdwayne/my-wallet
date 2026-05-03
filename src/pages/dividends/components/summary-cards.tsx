import { Card, CardHeader, CardTitle, CardValue } from '@/components'
import { formatCurrency } from '@/lib/utils'

type Props = {
  total12: number
  avg12: number
  totalCurrentMonth: number
}

export const SummaryCards = ({ total12, avg12, totalCurrentMonth }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card>
      <CardHeader>
        <CardTitle>Últimos 12 meses</CardTitle>
        <CardValue>{formatCurrency(total12)}</CardValue>
      </CardHeader>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Média mensal</CardTitle>
        <CardValue>{formatCurrency(avg12)}</CardValue>
      </CardHeader>
    </Card>
    <Card>
      <CardHeader>
        <CardTitle>Mês atual</CardTitle>
        <CardValue>{formatCurrency(totalCurrentMonth)}</CardValue>
      </CardHeader>
    </Card>
  </div>
)
