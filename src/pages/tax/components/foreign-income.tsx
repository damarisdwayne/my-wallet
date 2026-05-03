import { AlertCircle } from 'lucide-react'
import { calcRendimentosExterior } from '@/lib/ir-calc'
import { formatCurrency } from '@/lib/utils'
import type { Dividend } from '@/types'
import { AmountBadge, EmptyRow, Section, Td, Th } from './ui'

type Props = {
  year: number
  dividends: Dividend[]
  usdRate: number
}

export const ForeignIncomeSection = ({ year, dividends, usdRate }: Props) => {
  const items = calcRendimentosExterior(dividends, year, usdRate)
  const totalGross = items.reduce((s, i) => s + i.gross, 0)
  const totalIr = items.reduce((s, i) => s + i.ir, 0)

  return (
    <Section
      title="Rendimentos do Exterior"
      subtitle="Dividendos de ETFs e ações estrangeiras — tributação pela tabela progressiva"
      badge={
        <div className="flex gap-2">
          <AmountBadge label="IR retido (fonte)" value={totalIr} variant="destructive" />
          <AmountBadge label="Total bruto" value={totalGross} />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Ticker</Th>
              <Th>Tipo</Th>
              <Th right>Bruto (BRL)</Th>
              <Th right>IR Retido</Th>
              <Th right>Líquido</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow cols={5} message="Nenhum dividendo do exterior no ano selecionado." />
            ) : (
              items.map((item) => (
                <tr key={item.ticker} className="border-t border-border/50 hover:bg-muted/20">
                  <Td className="font-semibold text-foreground">{item.ticker}</Td>
                  <Td className="text-muted-foreground">{item.type}</Td>
                  <Td right>{formatCurrency(item.gross)}</Td>
                  <Td right className="text-destructive">
                    {item.ir > 0 ? formatCurrency(item.ir) : '—'}
                  </Td>
                  <Td right className="font-medium">
                    {formatCurrency(item.net)}
                  </Td>
                </tr>
              ))
            )}
            {items.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td colSpan={2} className="font-semibold">
                  Total
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross)}
                </Td>
                <Td right className="font-semibold text-destructive">
                  {totalIr > 0 ? formatCurrency(totalIr) : '—'}
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross - totalIr)}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground flex items-start gap-1.5">
        <AlertCircle size={13} className="mt-0.5 shrink-0" />
        Valores convertidos para BRL na data do recebimento. O IR retido no exterior pode ser
        compensado na declaração — verifique com seu contador.
      </p>
    </Section>
  )
}
