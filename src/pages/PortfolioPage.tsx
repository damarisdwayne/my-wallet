import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockAssets, mockCategories } from '@/data/mock'
import { formatCurrency, formatPercent } from '@/lib/utils'

const tabs = ['Visão Geral', 'Alocação', 'Diagrama do Cerrado', 'Análise']

export const PortfolioPage = () => {
  const [activeTab, setActiveTab] = useState(0)

  const totalValue = mockAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-4">
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Ativo</th>
                  <th className="pb-2 font-medium text-right">Qtd</th>
                  <th className="pb-2 font-medium text-right">PM</th>
                  <th className="pb-2 font-medium text-right">Atual</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium text-right">Resultado</th>
                  <th className="pb-2 font-medium text-right">% Cart.</th>
                </tr>
              </thead>
              <tbody>
                {mockAssets.map((a) => {
                  const total = a.currentPrice * a.quantity
                  const cost = a.avgPrice * a.quantity
                  const ret = ((total - cost) / cost) * 100
                  const pct = (total / totalValue) * 100
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-3">
                        <div>
                          <p className="font-semibold text-foreground">{a.ticker}</p>
                          <p className="text-xs text-muted-foreground">{a.name}</p>
                        </div>
                      </td>
                      <td className="py-3 text-right text-foreground">{a.quantity}</td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatCurrency(a.avgPrice)}
                      </td>
                      <td className="py-3 text-right text-foreground">
                        {formatCurrency(a.currentPrice)}
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">
                        {formatCurrency(total)}
                      </td>
                      <td
                        className={`py-3 text-right font-medium ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                      >
                        {formatPercent(ret)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          {mockCategories.map((cat) => {
            const assets = mockAssets.filter((a) => a.categoryId === cat.id)
            const catValue = assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
            const actualPct = (catValue / totalValue) * 100
            const diff = actualPct - cat.targetPercent

            return (
              <Card key={cat.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <CardTitle className="text-foreground text-sm font-semibold">
                        {cat.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">Meta: {cat.targetPercent}%</span>
                      <span className="font-medium text-foreground">
                        Atual: {actualPct.toFixed(1)}%
                      </span>
                      <Badge variant={diff >= 0 ? 'success' : 'destructive'}>
                        {diff >= 0 ? '+' : ''}
                        {diff.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(actualPct, 100)}%`, background: cat.color }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {assets.map((a) => {
                      const v = a.currentPrice * a.quantity
                      return (
                        <div key={a.id} className="text-xs p-2 rounded bg-muted">
                          <p className="font-semibold text-foreground">{a.ticker}</p>
                          <p className="text-muted-foreground">{formatCurrency(v)}</p>
                          <p className="text-muted-foreground">Alvo: {a.targetPercent}%</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground text-sm font-semibold">
              Diagrama do Cerrado
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Pontuação de cada ativo com base em critérios definidos por você (1–10). A nota define
              o % ideal dentro da categoria.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAssets.map((a) => (
                <div key={a.id} className="flex items-center gap-4">
                  <span className="w-20 text-sm font-semibold text-foreground">{a.ticker}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${((a.score ?? 5) / 10) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-sm text-right text-foreground">{a.score ?? '–'}</span>
                  <span className="w-12 text-xs text-right text-muted-foreground">
                    {a.targetPercent}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 3 && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Análise de ativos — em breve
        </div>
      )}
    </div>
  )
}
