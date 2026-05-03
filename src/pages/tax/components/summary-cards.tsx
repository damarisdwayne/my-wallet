import { formatCurrency } from '@/lib/utils'

type Props = {
  totalIsento: number
  totalExterior: number
  totalIrJcp: number
  totalDARF: number
}

export const SummaryCards = ({ totalIsento, totalExterior, totalIrJcp, totalDARF }: Props) => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">Rendimentos Isentos</p>
      <p className="text-xl font-bold text-success mt-1">{formatCurrency(totalIsento)}</p>
      <p className="text-xs text-muted-foreground mt-0.5">Dividendos + FII</p>
    </div>
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">Rendimentos do Exterior</p>
      <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalExterior)}</p>
      <p className="text-xs text-muted-foreground mt-0.5">ETFs e ações estrangeiras</p>
    </div>
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">IR Retido na Fonte (JCP)</p>
      <p className="text-xl font-bold text-destructive mt-1">{formatCurrency(totalIrJcp)}</p>
      <p className="text-xs text-muted-foreground mt-0.5">Já recolhido pela empresa</p>
    </div>
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">DARF Renda Variável</p>
      <p
        className={`text-xl font-bold mt-1 ${totalDARF > 0 ? 'text-destructive' : 'text-foreground'}`}
      >
        {formatCurrency(totalDARF)}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5">15% sobre ganhos tributáveis</p>
    </div>
  </div>
)
