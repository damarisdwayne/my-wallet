import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Section } from './shared'

export const ImpostoRenda = () => (
  <div className="space-y-8">
    <Section title="Visão Geral do IR em Investimentos">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Investidor Pessoa Física tem obrigações tributárias distintas para cada tipo de ativo. Ignorar as regras pode gerar multas e juros. O IR sobre investimentos é em sua maioria de responsabilidade do próprio investidor — a corretora não recolhe automaticamente tudo.
      </p>
      <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          ⚠️ O prazo para pagamento do DARF é o último dia útil do mês seguinte ao da venda. Atraso gera multa de 0,33% ao dia + juros Selic.
        </p>
      </Card>
    </Section>

    <Section title="Ações — Regras Principais">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground">Isenção de R$ 20.000/mês</span>
            <Badge variant="secondary" className="text-xs">Ações no Mercado à Vista</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Se o total de <strong className="text-foreground">vendas de ações no mercado à vista</strong> em um mês for igual ou inferior a R$ 20.000, o lucro está isento de IR — mesmo que tenha tido ganho. Essa isenção é exclusiva para ações (não vale para ETFs, BDRs, opções ou futuros).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Atenção:</strong> O limite é sobre o valor total de vendas, não sobre o lucro. Se você vendeu R$ 19.999 mas teve prejuízo, ainda está isento. Se vendeu R$ 20.001, toda a operação (não apenas o excedente) é tributável.
          </p>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              label: 'Swing Trade (posição normal)',
              aliq: '15%',
              desc: 'Compra e venda em dias diferentes. Alíquota de 15% sobre o lucro líquido nas vendas acima de R$ 20k/mês.',
              badge: 'Mercado à Vista',
            },
            {
              label: 'Day Trade',
              aliq: '20%',
              desc: 'Compra e venda no mesmo dia. Alíquota maior, sem isenção de R$ 20k, e IRRF de 1% na fonte no ato da operação.',
              badge: 'Mesmo dia',
            },
            {
              label: 'ETFs de Ações',
              aliq: '15%',
              desc: 'Fundos de índice negociados na bolsa. Sem isenção de R$ 20k — toda venda com lucro é tributada.',
              badge: 'Sem isenção',
            },
            {
              label: 'BDRs',
              aliq: '15%',
              desc: 'Brazilian Depositary Receipts — ações estrangeiras negociadas no Brasil. Sem isenção de R$ 20k. Pode haver incidência de IR no país de origem da ação.',
              badge: 'Sem isenção',
            },
          ].map((item) => (
            <Card key={item.label} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-sm text-foreground">{item.label}</span>
                <div className="flex flex-col items-end gap-1">
                  <Badge className="text-xs">{item.aliq}</Badge>
                  <Badge variant="outline" className="text-xs">{item.badge}</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </Section>

    <Section title="FIIs — Tributação">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">Rendimentos (Dividendos)</span>
            <Badge variant="secondary" className="text-xs">Isento</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Os rendimentos mensais distribuídos pelo FII são <strong className="text-foreground">isentos de IR para pessoa física</strong>, desde que: o cotista tenha menos de 10% das cotas, o fundo tenha mais de 50 cotistas e seja negociado exclusivamente na bolsa.</p>
        </Card>
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-foreground">Ganho de Capital na Venda</span>
            <Badge className="text-xs">20%</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Se você vender cotas de FII com lucro, paga 20% sobre o ganho. Não há isenção de R$ 20k como nas ações. O pagamento deve ser feito via DARF até o último dia útil do mês seguinte.</p>
        </Card>
      </div>
    </Section>

    <Section title="Dividendos de Ações">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Atualmente no Brasil, os dividendos de ações são <strong className="text-foreground">isentos de IR para pessoa física</strong>. A empresa já paga o imposto sobre o lucro antes de distribuir os dividendos (via IRPJ/CSLL). O investidor recebe o valor líquido sem tributação adicional.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Juros sobre Capital Próprio (JCP):</strong> Diferente dos dividendos, o JCP tem retenção de 15% na fonte. É um crédito tributário para a empresa, então ela opta por distribuir JCP para reduzir seu imposto. Para o investidor, o JCP já chega líquido (com o IR descontado).
        </p>
      </Card>
    </Section>

    <Section title="Como Calcular e Pagar o DARF">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm font-medium text-foreground">Passo a passo mensal:</p>
          <div className="space-y-2">
            {[
              { step: '1', text: 'Some todas as vendas de ações do mês (valor bruto).' },
              { step: '2', text: 'Verifique se ultrapassou R$ 20.000 — se não, está isento (anote o saldo).' },
              { step: '3', text: 'Calcule o custo de aquisição das ações vendidas (preço médio × quantidade).' },
              { step: '4', text: 'Lucro = Valor de venda − Custo de aquisição − Taxas (corretagem, emolumentos).' },
              { step: '5', text: 'Desconte prejuízos de meses anteriores (podem ser compensados indefinidamente).' },
              { step: '6', text: 'Aplique a alíquota: 15% para Swing Trade, 20% para Day Trade.' },
              { step: '7', text: 'Subtraia o IRRF retido pela corretora (0,005% Swing Trade, 1% Day Trade).' },
              { step: '8', text: 'Pague via DARF (código 6015 para ações) até o último dia útil do mês seguinte.' },
            ].map((item) => (
              <div key={item.step} className="flex gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 font-medium mt-0.5">
                  {item.step}
                </span>
                <p className="text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">Compensação de Prejuízos</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Prejuízos de Swing Trade compensam apenas outros lucros de Swing Trade. Day Trade compensa Day Trade. As duas categorias não se misturam. Guarde o histórico de prejuízos — não há prazo de prescrição para compensação.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Declaração Anual de IR">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Você é obrigado a declarar IR se, entre outros critérios, possuir ações, FIIs ou qualquer ativo de renda variável a qualquer momento do ano calendário — mesmo que não tenha vendido.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <p className="font-medium text-foreground">O que declarar:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Saldo de ações, FIIs, ETFs (pelo custo de aquisição)</li>
              <li>• Rendimentos isentos (dividendos, proventos de FII)</li>
              <li>• Lucros tributados (ganho de capital)</li>
              <li>• JCP recebido (tributável, informado na ficha de rendimentos)</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Documentos necessários:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Informe de rendimentos da corretora</li>
              <li>• Notas de corretagem de todas as operações</li>
              <li>• DARFs pagos durante o ano</li>
              <li>• Relatórios de proventos recebidos</li>
            </ul>
          </div>
        </div>
      </Card>
    </Section>

    <Section title="Renda Fixa — Tributação">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">O IR em CDB, Tesouro Direto e Debêntures comuns é retido na fonte pela instituição financeira no momento do resgate. Não é necessário emitir DARF.</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { prazo: 'Até 180 dias', aliq: '22,5%' },
            { prazo: '181 a 360 dias', aliq: '20%' },
            { prazo: '361 a 720 dias', aliq: '17,5%' },
            { prazo: 'Acima de 720 dias', aliq: '15%' },
          ].map((row) => (
            <div key={row.prazo} className="flex justify-between bg-muted rounded px-3 py-2">
              <span className="text-muted-foreground">{row.prazo}</span>
              <span className="font-medium text-foreground">{row.aliq}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Isentos:</strong> LCI, LCA, CRI, CRA e Debêntures Incentivadas (Lei 12.431) não pagam IR para PF.
        </p>
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">IOF:</strong> Aplicações resgatadas em menos de 30 dias pagam IOF regressivo (de 96% no dia 1 até 0% no dia 30), além do IR.
        </p>
      </Card>
    </Section>
  </div>
)
