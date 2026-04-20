import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { subscribeToAllDividends } from '@/services/dividends'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import type { Dividend } from '@/types'

export const TaxPage = () => {
  const { user } = useAuth()
  const [dividends, setDividends] = useState<Dividend[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeToAllDividends(user.uid, setDividends)
  }, [user])

  const jcp = dividends.filter((d) => d.type === 'jcp')
  const totalIR = jcp.reduce((s, d) => s + (d.ir ?? 0), 0)
  const totalJCP = jcp.reduce((s, d) => s + d.amount, 0)
  const totalIsento = dividends.filter((d) => !d.ir).reduce((s, d) => s + d.amount, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>IR Retido (JCP)</CardTitle>
            <CardValue className="text-destructive">{formatCurrency(totalIR)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total JCP recebido</CardTitle>
            <CardValue>{formatCurrency(totalJCP)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Isentos (FII / Dividendos)</CardTitle>
            <CardValue className="text-success">{formatCurrency(totalIsento)}</CardValue>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento para DIRPF</CardTitle>
        </CardHeader>
        <CardContent>
          {jcp.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum JCP registrado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {jcp.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0 text-sm"
                >
                  <span className="font-semibold text-foreground">{d.ticker}</span>
                  <div className="flex gap-6">
                    <span className="text-muted-foreground">Bruto: {formatCurrency(d.amount)}</span>
                    <span className="text-destructive">IR: {formatCurrency(d.ir ?? 0)}</span>
                    <span className="text-success">
                      Líquido: {formatCurrency(d.amount - (d.ir ?? 0))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <p className="text-sm text-muted-foreground">
            Integração completa com declaração e cálculo de ganho de capital em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
