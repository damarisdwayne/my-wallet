import { Card, CardContent } from '@/components/ui/card'

export const GuidanceCard = () => (
  <Card className="bg-muted/30">
    <CardContent className="pt-4 pb-4">
      <p className="text-sm font-semibold text-foreground mb-2">Quando vale a pena vender?</p>
      <p className="text-sm text-muted-foreground mb-3">
        O preço sobe quando a taxa cai. Quanto mais tempo resta até o vencimento, maior o impacto de
        cada ponto percentual (pp) de queda.
      </p>
      <div className="space-y-2">
        {[
          {
            range: 'Taxa subiu',
            action: 'Não vende — você realizaria prejuízo',
            color: 'text-destructive',
          },
          {
            range: 'Caiu < 0,5 pp',
            action: 'Não vale — IR come o ganho',
            color: 'text-destructive',
          },
          {
            range: 'Caiu 0,5–1 pp',
            action: 'Talvez — compare as rentabilidades acima',
            color: 'text-warning',
          },
          {
            range: 'Caiu > 1 pp',
            action: 'Provavelmente sim, principalmente com vencimento longo',
            color: 'text-success',
          },
        ].map((row) => (
          <div key={row.range} className="flex items-start gap-3 text-sm">
            <span className="text-muted-foreground w-28 shrink-0">{row.range}</span>
            <span className={row.color}>{row.action}</span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)
