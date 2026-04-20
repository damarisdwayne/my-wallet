import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import { subscribeToAllDividends } from '@/services/dividends'
import { useAuth } from '@/store/auth'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Dividend } from '@/types'

const currentYear = new Date().getFullYear().toString()
const currentMonth = new Date().toISOString().slice(0, 7)
const currentMonthLabel = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

export const DividendsPage = () => {
  const { user } = useAuth()
  const [dividends, setDividends] = useState<Dividend[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeToAllDividends(user.uid, setDividends)
  }, [user])

  const ytd = dividends.filter((d) => d.paymentDate.startsWith(currentYear))
  const totalYTD = ytd.reduce((s, d) => s + d.amount, 0)
  const totalCurrentMonth = dividends
    .filter((d) => d.paymentDate.startsWith(currentMonth))
    .reduce((s, d) => s + d.amount, 0)

  const byMonth = ytd.reduce(
    (acc, d) => {
      const m = d.paymentDate.slice(0, 7)
      acc[m] = (acc[m] ?? 0) + d.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const monthCount = Object.keys(byMonth).length
  const avgMonthly = monthCount > 0 ? totalYTD / monthCount : 0
  const maxMonth = Math.max(...Object.values(byMonth), 1)

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total YTD {currentYear}</CardTitle>
            <CardValue>{formatCurrency(totalYTD)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {currentMonthLabel.charAt(0).toUpperCase() + currentMonthLabel.slice(1)}
            </CardTitle>
            <CardValue>{formatCurrency(totalCurrentMonth)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Média Mensal</CardTitle>
            <CardValue>{formatCurrency(avgMonthly)}</CardValue>
          </CardHeader>
        </Card>
      </div>

      {monthCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Por mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-32">
              {Object.entries(byMonth).map(([m, v]) => (
                <div key={m} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-success/70 hover:bg-success transition-colors"
                    style={{ height: `${(v / maxMonth) * 100}%` }}
                    title={formatCurrency(v)}
                  />
                  <span className="text-[10px] text-muted-foreground">{m.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico de proventos</CardTitle>
        </CardHeader>
        <CardContent>
          {dividends.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhum provento registrado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {dividends.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-foreground w-20">{d.ticker}</span>
                    <Badge
                      variant={
                        d.type === 'rendimento'
                          ? 'default'
                          : d.type === 'jcp'
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {d.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(d.paymentDate)}
                    </span>
                    {d.ir ? (
                      <span className="text-xs text-muted-foreground">
                        IR: {formatCurrency(d.ir)}
                      </span>
                    ) : null}
                    <span className="text-sm font-semibold text-success">
                      + {formatCurrency(d.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
