import { Section } from '../../ui'

export const DarfGuide = () => (
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
)
