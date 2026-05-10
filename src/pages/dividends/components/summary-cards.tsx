import { Card, CardHeader, CardTitle, CardValue } from '@/components'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

type Props = {
  total12: number
  avg12: number
  paidCurrentMonth: number
  provisionedCurrentMonth: number
}

export const SummaryCards = ({
  total12,
  avg12,
  paidCurrentMonth,
  provisionedCurrentMonth,
}: Props) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
      <Card>
        <CardHeader>
          <CardTitle>Mês atual — pago</CardTitle>
          <CardValue>{fmt(paidCurrentMonth)}</CardValue>
          {provisionedCurrentMonth > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              + {fmt(provisionedCurrentMonth)} provisionado
            </p>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}
