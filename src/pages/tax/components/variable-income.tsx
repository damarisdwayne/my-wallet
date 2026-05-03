import { useMemo, useState } from 'react'
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { calcMonthlyRV, calcRealizedGains } from '@/lib/ir-calc'
import { formatCurrency } from '@/lib/utils'
import type { TickerSets } from '@/services/quotes'
import type { Asset, Trade } from '@/types'
import { assetTypeLabel } from '../constants'
import { darfDeadline, monthLabel } from '../utils'
import { EmptyRow, Section, Td, Th, TypeFilterChips } from './ui'

type Props = {
  year: number
  trades: Trade[]
  assets: Asset[]
  sets?: TickerSets
}

export const VariableIncomeSection = ({ year, trades, assets, sets }: Props) => {
  const [showDetails, setShowDetails] = useState(false)
  const [filterType, setFilterType] = useState<string | null>(null)

  const gains = useMemo(
    () => calcRealizedGains(trades, year, assets, sets),
    [trades, year, assets, sets],
  )
  const monthly = useMemo(() => calcMonthlyRV(gains, year), [gains, year])
  const availableGainTypes = useMemo(
    () => [...new Set(gains.map((g) => g.assetType))].sort(),
    [gains],
  )
  const filteredGains = useMemo(
    () => (filterType ? gains.filter((g) => g.assetType === filterType) : gains),
    [gains, filterType],
  )

  const totalDarf = monthly.reduce((s, m) => s + m.irDue, 0)
  const totalGain = monthly.reduce((s, m) => s + m.gain, 0)
  const activeMonths = monthly.filter((m) => m.sales > 0)

  const currentMonth = new Date().toISOString().slice(0, 7)
  const isCurrentYear = year === new Date().getFullYear()
  const currentData = monthly.find((m) => m.month === currentMonth)
  const pendingDarf = isCurrentYear
    ? monthly.filter((m) => m.month <= currentMonth && m.irDue > 0).reduce((s, m) => s + m.irDue, 0)
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Ganho líquido</p>
          <p
            className={`text-xl font-bold mt-1 ${totalGain >= 0 ? 'text-success' : 'text-destructive'}`}
          >
            {formatCurrency(totalGain)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeMonths.length} mês(es) com operações
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total DARF no ano</p>
          <p
            className={`text-xl font-bold mt-1 ${totalDarf > 0 ? 'text-destructive' : 'text-foreground'}`}
          >
            {formatCurrency(totalDarf)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Cód. 6015</p>
        </div>
        {isCurrentYear && (
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">DARF pendente</p>
            <p
              className={`text-xl font-bold mt-1 ${pendingDarf > 0 ? 'text-destructive' : 'text-foreground'}`}
            >
              {formatCurrency(pendingDarf)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {pendingDarf > 0 ? 'Verifique os meses abaixo' : 'Nada em aberto'}
            </p>
          </div>
        )}
        {isCurrentYear && currentData && currentData.sales > 0 && (
          <div
            className={`rounded-lg border p-4 ${
              currentData.irDue > 0
                ? 'border-yellow-500/40 bg-yellow-500/5'
                : 'border-border bg-card'
            }`}
          >
            <p className="text-xs text-muted-foreground">Mês atual — {monthLabel(currentMonth)}</p>
            <p
              className={`text-xl font-bold mt-1 ${
                currentData.irDue > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-success'
              }`}
            >
              {currentData.irDue > 0 ? formatCurrency(currentData.irDue) : 'Isento'}
            </p>
            {currentData.irDue > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                Vence {darfDeadline(currentMonth)}
              </p>
            )}
          </div>
        )}
      </div>

      <Section
        title="Detalhamento mensal"
        subtitle="Ações (15%, isento ≤ R$20k) · FII (20%, sem isenção)"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <Th>Mês</Th>
                <Th right>Vendas ações</Th>
                <Th right>Vendas FII</Th>
                <Th right>Resultado</Th>
                <Th right>Prej. acumulado</Th>
                <Th right>DARF ações</Th>
                <Th right>DARF FII</Th>
                <Th right>Total DARF</Th>
                <Th>Status</Th>
                <Th>Vencimento</Th>
              </tr>
            </thead>
            <tbody>
              {monthly.map((m) => {
                const hasOps = m.sales > 0
                return (
                  <tr
                    key={m.month}
                    className={`border-t border-border/50 ${hasOps ? 'hover:bg-muted/20' : 'opacity-40'}`}
                  >
                    <Td className="font-medium">{monthLabel(m.month)}</Td>
                    <Td right>{m.stockSales > 0 ? formatCurrency(m.stockSales) : '—'}</Td>
                    <Td right>{m.fiiSales > 0 ? formatCurrency(m.fiiSales) : '—'}</Td>
                    <Td right>
                      {hasOps ? (
                        <span className={m.gain >= 0 ? 'text-success' : 'text-destructive'}>
                          {formatCurrency(m.gain)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td right className="text-muted-foreground">
                      {m.lossCarryoverIn > 0 ? formatCurrency(-m.lossCarryoverIn) : '—'}
                    </Td>
                    <Td right>
                      {m.irDueStock > 0 ? (
                        <span className="text-destructive font-medium">
                          {formatCurrency(m.irDueStock)}
                        </span>
                      ) : m.stockSales > 0 && m.stockIsExempt ? (
                        <span className="text-success text-xs">Isento</span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td right>
                      {m.irDueFii > 0 ? (
                        <span className="text-destructive font-medium">
                          {formatCurrency(m.irDueFii)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td right>
                      {m.irDue > 0 ? (
                        <span className="text-destructive font-bold">
                          {formatCurrency(m.irDue)}
                        </span>
                      ) : (
                        '—'
                      )}
                    </Td>
                    <Td>
                      {!hasOps ? null : m.irDue > 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          DARF
                        </span>
                      ) : m.stockIsExempt && m.fiiSales === 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                          Isento
                        </span>
                      ) : m.gain < 0 ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                          Prejuízo
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                          Zerado
                        </span>
                      )}
                    </Td>
                    <Td>
                      {m.irDue > 0 ? (
                        <span className="text-xs text-muted-foreground">
                          {darfDeadline(m.month)}
                        </span>
                      ) : null}
                    </Td>
                  </tr>
                )
              })}
              {totalDarf > 0 && (
                <tr className="border-t-2 border-border bg-muted/30">
                  <Td className="font-semibold" colSpan={7}>
                    Total DARF no ano
                  </Td>
                  <Td right className="font-semibold text-destructive">
                    {formatCurrency(totalDarf)}
                  </Td>
                  <Td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {activeMonths.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? 'Ocultar' : 'Ver'} detalhamento por operação ({gains.length} vendas)
            </button>
            {showDetails && (
              <div className="mt-3">
                {availableGainTypes.length > 1 && (
                  <TypeFilterChips
                    types={availableGainTypes}
                    active={filterType}
                    onChange={setFilterType}
                  />
                )}
                <div className="overflow-x-auto border border-border rounded-md">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <Th>Data</Th>
                        <Th>Ticker</Th>
                        <Th>Tipo</Th>
                        <Th right>Qtd.</Th>
                        <Th right>PM Custo</Th>
                        <Th right>Preço Venda</Th>
                        <Th right>Custo Total</Th>
                        <Th right>Receita</Th>
                        <Th right>Resultado</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGains.length === 0 ? (
                        <EmptyRow cols={9} message="Nenhuma operação encontrada." />
                      ) : (
                        filteredGains.map((g, i) => (
                          <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                            <Td className="text-muted-foreground">{g.date}</Td>
                            <Td className="font-semibold text-foreground">{g.ticker}</Td>
                            <Td>
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {assetTypeLabel[g.assetType] ?? g.assetType}
                              </span>
                            </Td>
                            <Td right>{g.quantity}</Td>
                            <Td right className="text-muted-foreground">
                              {formatCurrency(g.avgCost)}
                            </Td>
                            <Td right>{formatCurrency(g.sellPrice)}</Td>
                            <Td right className="text-muted-foreground">
                              {formatCurrency(g.costTotal)}
                            </Td>
                            <Td right>{formatCurrency(g.sellTotal)}</Td>
                            <Td right>
                              <span
                                className={
                                  g.gain >= 0
                                    ? 'text-success font-medium'
                                    : 'text-destructive font-medium'
                                }
                              >
                                {formatCurrency(g.gain)}
                              </span>
                            </Td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          Cálculo pelo preço médio ponderado (PME). Day-trade e FII não possuem isenção. Prejuízo de
          anos anteriores não é considerado automaticamente.
        </p>
      </Section>

      <Section title="Como pagar o DARF">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {(
              [
                {
                  n: '1',
                  title: 'Acesse o Sicalc Web',
                  body: (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Site da Receita Federal para emissão de DARF.{' '}
                      <a
                        href="https://sicalc.receita.fazenda.gov.br/sicalc/rapido/contribuinte"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline underline-offset-2 hover:opacity-80"
                      >
                        Abrir Sicalc
                      </a>
                    </p>
                  ),
                },
                {
                  n: '2',
                  title: 'Informe o código',
                  body: (
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-muted px-2 py-1 rounded font-mono font-bold">
                        6015
                      </span>
                      <span className="text-xs text-muted-foreground self-center">
                        Ganhos líquidos em bolsa (ações, FII, ETF)
                      </span>
                    </div>
                  ),
                },
                {
                  n: '3',
                  title: 'Período de apuração',
                  body: (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Mês em que ocorreu a venda (ex: 01/04/2026 para vendas de abril).
                    </p>
                  ),
                },
                {
                  n: '4',
                  title: 'Vencimento',
                  body: (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Último dia útil do mês seguinte à venda. Atraso gera juros Selic + multa de
                      0,33%/dia.
                    </p>
                  ),
                },
              ] as const
            ).map(({ n, title, body }) => (
              <div key={n} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {n}
                </span>
                <div>
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {body}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="rounded-md bg-muted/50 p-4 space-y-2">
              <p className="text-xs font-semibold text-foreground">Regras resumidas</p>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Ações BR: </span>
                  15% sobre o lucro. Isento se vendas totais ≤ R$20.000 no mês.
                </p>
                <p>
                  <span className="font-medium text-foreground">FII: </span>
                  20% sobre o lucro. Sem isenção, independente do valor vendido.
                </p>
                <p>
                  <span className="font-medium text-foreground">ETF BR: </span>
                  15% sobre o lucro. Sem isenção de R$20k.
                </p>
                <p>
                  <span className="font-medium text-foreground">Prejuízo: </span>
                  Pode ser compensado nos meses seguintes do mesmo ano.
                </p>
                <p>
                  <span className="font-medium text-foreground">Day trade: </span>
                  20% e sem isenção — não calculado aqui.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  )
}
