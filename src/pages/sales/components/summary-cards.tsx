import { Card, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

interface SummaryCardsProps {
  receita: number
  custo: number
  lucro: number
  margem: string | null
}

export const SummaryCards = ({ receita, custo, lucro, margem }: SummaryCardsProps) => {
  const { hideValues } = usePrivacy()
  const fmt = (v: number) => (hideValues ? MASK : formatCurrency(v))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Receita</CardTitle>
          <CardValue>{fmt(receita)}</CardValue>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Custo</CardTitle>
          <CardValue>{fmt(custo)}</CardValue>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Lucro</CardTitle>
          <CardValue className={lucro >= 0 ? 'text-success' : 'text-destructive'}>
            {fmt(lucro)}
          </CardValue>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Margem</CardTitle>
          <CardValue>{margem === null ? '—' : `${margem}%`}</CardValue>
        </CardHeader>
      </Card>
    </div>
  )
}
