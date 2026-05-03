import { calcRendimentosTributaveis } from '@/lib/ir-calc'
import { formatCurrency } from '@/lib/utils'
import type { Dividend } from '@/types'
import { AmountBadge, EmptyRow, Section, Td, Th } from './ui'

type Props = {
  year: number
  dividends: Dividend[]
}

export const WithholdingSection = ({ year, dividends }: Props) => {
  const items = calcRendimentosTributaveis(dividends, year)
  const totalGross = items.reduce((s, i) => s + i.gross, 0)
  const totalIr = items.reduce((s, i) => s + i.ir, 0)

  return (
    <Section
      title="Rendimentos Sujeitos à Tributação Exclusiva/Definitiva"
      subtitle="JCP e outros — alíquota 15%"
      badge={
        <div className="flex gap-2">
          <AmountBadge label="IR retido" value={totalIr} variant="destructive" />
          <AmountBadge label="Bruto" value={totalGross} />
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              <Th>Cód.</Th>
              <Th>Tipo</Th>
              <Th>Ticker / Fonte</Th>
              <Th right>Bruto</Th>
              <Th right>IR Retido (15%)</Th>
              <Th right>Líquido</Th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <EmptyRow
                cols={6}
                message="Nenhum rendimento com tributação exclusiva no ano selecionado."
              />
            ) : (
              items.map((item, i) => (
                <tr key={i} className="border-t border-border/50 hover:bg-muted/20">
                  <Td>
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-mono font-semibold">
                      {item.code}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{item.type}</Td>
                  <Td className="font-semibold text-foreground">{item.ticker}</Td>
                  <Td right>{formatCurrency(item.gross)}</Td>
                  <Td right className="text-destructive">
                    {formatCurrency(item.ir)}
                  </Td>
                  <Td right className="font-medium">
                    {formatCurrency(item.net)}
                  </Td>
                </tr>
              ))
            )}
            {items.length > 0 && (
              <tr className="border-t-2 border-border bg-muted/30">
                <Td colSpan={3} className="font-semibold">
                  Total
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross)}
                </Td>
                <Td right className="font-semibold text-destructive">
                  {formatCurrency(totalIr)}
                </Td>
                <Td right className="font-semibold">
                  {formatCurrency(totalGross - totalIr)}
                </Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Section>
  )
}
