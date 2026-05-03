import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fmtBRL } from '../../shared'
import type { Results } from '../types'

interface ResultsSectionProps {
  results: Results
}

export const ResultsSection = ({ results }: ResultsSectionProps) => {
  const ratesRose = results.currentRate > results.buyRate
  const ratesFell = results.currentRate < results.buyRate

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Valor atual de mercado</CardTitle>
            <p className="text-2xl font-bold text-foreground">{fmtBRL(results.currentValue)}</p>
            <p className="text-xs text-muted-foreground">{results.daysElapsed} dias decorridos</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ganho bruto acumulado</CardTitle>
            <p
              className={`text-2xl font-bold ${results.grossGainSell >= 0 ? 'text-success' : 'text-destructive'}`}
            >
              {fmtBRL(results.grossGainSell)}
            </p>
            <p className="text-xs text-muted-foreground">
              {((results.grossGainSell / results.currentValue) * 100).toFixed(2)}% de valorização
            </p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Valor no vencimento</CardTitle>
            <p className="text-2xl font-bold text-foreground">{fmtBRL(results.valueAtMaturity)}</p>
            <p className="text-xs text-muted-foreground">{results.daysRemaining} dias restantes</p>
          </CardHeader>
        </Card>
      </div>

      <Card
        className={
          ratesFell
            ? 'border-success/40 bg-success/5'
            : ratesRose
              ? 'border-destructive/40 bg-destructive/5'
              : 'bg-muted/40'
        }
      >
        <CardContent className="pt-5 pb-5 space-y-1">
          {ratesFell && (
            <>
              <p className="text-sm font-semibold text-success">
                Título valorizou — taxas caíram de {results.buyRate.toFixed(2)}% para{' '}
                {results.currentRate.toFixed(2)}% a.a.
              </p>
              <p className="text-sm text-muted-foreground">
                Você pode vender agora e realizar{' '}
                <strong className="text-foreground">
                  {results.annualizedSell.toFixed(2)}% a.a. líq.
                </strong>{' '}
                no período decorrido, ou segurar até o vencimento e garantir{' '}
                <strong className="text-foreground">
                  {results.annualizedHold.toFixed(2)}% a.a. líq.
                </strong>{' '}
                total. Vender e reinvestir no mesmo título resulta no mesmo valor bruto final — a
                diferença real está no IR e no que você faz com o capital.
              </p>
            </>
          )}
          {ratesRose && (
            <>
              <p className="text-sm font-semibold text-destructive">
                Título desvalorizou — taxas subiram de {results.buyRate.toFixed(2)}% para{' '}
                {results.currentRate.toFixed(2)}% a.a.
              </p>
              <p className="text-sm text-muted-foreground">
                Vender agora realizaria apenas{' '}
                <strong className="text-foreground">
                  {results.annualizedSell.toFixed(2)}% a.a. líq.
                </strong>{' '}
                no período decorrido. Segurando até o vencimento, você garante os{' '}
                <strong className="text-foreground">
                  {results.annualizedHold.toFixed(2)}% a.a. líq.
                </strong>{' '}
                originais.
              </p>
            </>
          )}
          {!ratesFell && !ratesRose && (
            <p className="text-sm text-muted-foreground">
              Taxas estáveis — os resultados de vender agora e segurar até o vencimento são
              equivalentes.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>Vender agora</CardTitle>
            <p className="text-xs text-muted-foreground">
              IR calculado sobre {results.daysElapsed} dias
            </p>
          </CardHeader>
          <CardContent>
            {[
              { label: 'Valor bruto de venda', value: fmtBRL(results.currentValue) },
              {
                label: `IR (${(results.irRateSell * 100).toFixed(2)}% — ${results.irLabelSell})`,
                value: `- ${fmtBRL(results.irAmountSell)}`,
                color: 'text-destructive',
              },
              {
                label: 'Ganho líquido',
                value: fmtBRL(results.netGainSell),
                color: results.netGainSell >= 0 ? 'text-success' : 'text-destructive',
              },
              { label: 'Valor líquido recebido', value: fmtBRL(results.netValueSell) },
              {
                label: 'Rentabilidade líq. a.a.',
                value: `${results.annualizedSell.toFixed(2)}% a.a.`,
                color: 'text-primary',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <p className="text-sm text-foreground">{row.label}</p>
                <p className={`text-sm font-semibold ${row.color ?? 'text-foreground'}`}>
                  {row.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurar até o vencimento</CardTitle>
            <p className="text-xs text-muted-foreground">
              IR calculado sobre {results.daysTotal} dias
            </p>
          </CardHeader>
          <CardContent>
            {[
              { label: 'Valor bruto no vencimento', value: fmtBRL(results.valueAtMaturity) },
              {
                label: `IR (${(results.irRateHold * 100).toFixed(2)}% — ${results.irLabelHold})`,
                value: `- ${fmtBRL(results.irAmountHold)}`,
                color: 'text-destructive',
              },
              {
                label: 'Ganho líquido',
                value: fmtBRL(results.netGainHold),
                color: 'text-success',
              },
              { label: 'Valor líquido recebido', value: fmtBRL(results.netValueHold) },
              {
                label: 'Rentabilidade líq. a.a.',
                value: `${results.annualizedHold.toFixed(2)}% a.a.`,
                color: 'text-primary',
              },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-3 border-b border-border/50 last:border-0"
              >
                <p className="text-sm text-foreground">{row.label}</p>
                <p className={`text-sm font-semibold ${row.color ?? 'text-foreground'}`}>
                  {row.value}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
