import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section } from './shared'

export const RendaFixa = () => (
  <div className="space-y-8">
    <Section title="O que é Renda Fixa?">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Renda fixa são investimentos onde as regras de remuneração são definidas no momento da aplicação: você sabe de antemão como vai receber (taxa prefixada, CDI, IPCA+). O risco é menor, mas o retorno tende a ser mais previsível e limitado em relação à renda variável no longo prazo.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        A renda fixa não é apenas para "guardar dinheiro" — ela tem papel estratégico em qualquer carteira: reserva de emergência, proteção contra inflação, geração de fluxo de caixa previsível e balanceamento de risco.
      </p>
    </Section>

    <Section title="Hierarquia de Risco e Retorno">
      <div className="space-y-2">
        {[
          { rank: '1', label: 'Tesouro Direto', risk: 'Risco Soberano', desc: 'Títulos emitidos pelo governo federal — o mais seguro possível em Real. O governo pode imprimir moeda, então o risco de calote é mínimo, mas existe risco inflacionário.', color: 'bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800' },
          { rank: '2', label: 'CDB de banco grande (BB, Caixa, Itaú, Bradesco)', risk: 'Risco bancário + FGC', desc: 'Certificados de Depósito Bancário emitidos por grandes bancos. Cobertura do FGC até R$ 250k por CPF por instituição. Mais rentável que o Tesouro em geral.', color: 'bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800' },
          { rank: '3', label: 'LCI e LCA de banco grande', risk: 'Risco bancário + FGC + isenção IR', desc: 'Letras de Crédito Imobiliário e do Agronegócio. Isentos de IR para PF, o que eleva o retorno líquido. Mesma cobertura do FGC. Tem prazo mínimo de carência.', color: 'bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800' },
          { rank: '4', label: 'CDB/LCI/LCA de banco médio', risk: 'Risco maior + FGC', desc: 'Pagam mais justamente pelo maior risco do emissor. O FGC cobre R$ 250k, mas se o banco quebrar, pode demorar para receber. Atenção ao limite do FGC e diversificação.', color: 'bg-yellow-100 dark:bg-yellow-950/50 border-yellow-300 dark:border-yellow-800' },
          { rank: '5', label: 'CRI e CRA', risk: 'Risco do emissor, sem FGC', desc: 'Certificados de Recebíveis Imobiliários e do Agronegócio. Emitidos por securitizadoras (não por bancos). Isentos de IR para PF. Sem cobertura do FGC — analise o devedor do CRI/CRA, não apenas o emissor.', color: 'bg-orange-100 dark:bg-orange-950/50 border-orange-300 dark:border-orange-800' },
          { rank: '6', label: 'Debêntures', risk: 'Risco corporativo, sem FGC', desc: 'Títulos de dívida emitidos por empresas. Debêntures incentivadas (infraestrutura) são isentas de IR para PF. As demais são tributadas. Maior risco pois a empresa pode quebrar.', color: 'bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800' },
        ].map((item) => (
          <Card key={item.rank} className={`p-4 border ${item.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-muted-foreground shrink-0 w-5">{item.rank}.</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">{item.label}</span>
                  <Badge variant="outline" className="text-xs">{item.risk}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="Tipos de Rentabilidade">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">Prefixada</p>
          <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">Ex: 13,5% ao ano</p>
          <p className="text-sm text-muted-foreground">Você sabe exatamente quanto vai receber. Bom quando a Selic está alta e tende a cair — você garante a taxa atual por mais tempo. Ruim se a inflação disparar.</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">Pós-fixada</p>
          <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">Ex: 100% do CDI ou 110% do CDI</p>
          <p className="text-sm text-muted-foreground">Acompanha o CDI (que segue a Selic). Ideal para reserva de emergência e quando há incerteza sobre o futuro dos juros. Sempre rendendo próximo da taxa básica.</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">IPCA+</p>
          <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">Ex: IPCA + 6% ao ano</p>
          <p className="text-sm text-muted-foreground">Garante rentabilidade real — acima da inflação. Excelente para objetivos de longo prazo (aposentadoria, educação dos filhos). Protege o poder de compra independente da inflação.</p>
        </Card>
      </div>
    </Section>

    <Section title="Tesouro Direto — Produtos Principais">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            name: 'Tesouro Selic',
            tipo: 'Pós-fixado',
            desc: 'Rende a taxa Selic. Liquidez diária sem perdas — você pode resgatar a qualquer momento sem risco de marcação a mercado. Ideal para reserva de emergência.',
            uso: 'Reserva de emergência, curto prazo',
          },
          {
            name: 'Tesouro Prefixado',
            tipo: 'Prefixado',
            desc: 'Taxa fixa até o vencimento. Se vender antes, o preço flutua conforme a expectativa de juros — pode ganhar mais ou menos. Segurar até o vencimento garante a taxa contratada.',
            uso: 'Objetivos de curto/médio prazo com data definida',
          },
          {
            name: 'Tesouro IPCA+',
            tipo: 'IPCA + taxa real',
            desc: 'Proteção total contra inflação + rentabilidade real garantida. É o melhor título para previdência privada individual. Sensível a marcação a mercado — se vender antes do vencimento, pode ter perdas.',
            uso: 'Aposentadoria, proteção patrimonial de longo prazo',
          },
          {
            name: 'Tesouro IPCA+ com Juros Semestrais',
            tipo: 'IPCA + pagamento semestral',
            desc: 'Igual ao IPCA+ mas paga cupons a cada 6 meses. Ideal para quem precisa de renda periódica. Tem o inconveniente de pagar IR nos cupons, reduzindo o efeito dos juros compostos.',
            uso: 'Complemento de renda em fase de aposentadoria',
          },
        ].map((item) => (
          <Card key={item.name} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold text-sm text-foreground">{item.name}</span>
              <Badge variant="secondary" className="text-xs shrink-0">{item.tipo}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
            <p className="text-xs text-foreground/70">
              <span className="font-medium">Uso ideal:</span> {item.uso}
            </p>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="FGC — Fundo Garantidor de Créditos">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          O FGC garante até <strong className="text-foreground">R$ 250.000 por CPF por instituição financeira</strong>, com limite global de <strong className="text-foreground">R$ 1.000.000 por CPF</strong> em um período de 4 anos. Cobre CDB, LCI, LCA, poupança, LH, LC.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Importante:</strong> CRI, CRA e Debêntures <strong className="text-foreground">NÃO</strong> são cobertos pelo FGC. Títulos públicos também não precisam — são garantidos pelo governo.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Se você tem R$ 500k para investir em CDB de banco médio, distribua em pelo menos 2 instituições diferentes para estar completamente coberto.
        </p>
      </Card>
    </Section>

    <Section title="Imposto de Renda na Renda Fixa">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Tabela Regressiva (CDB, Tesouro Direto, Debêntures comuns)</p>
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
          <strong className="text-foreground">Isentos de IR para PF:</strong> LCI, LCA, CRI, CRA e Debêntures Incentivadas (Lei 12.431). Por isso, compare sempre o rendimento líquido, não o bruto.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Como calcular equivalência:</strong> Para saber o equivalente de um CDB a 13% bruto vs LCI isenta: 13% × (1 - 0,15) = 11,05%. Se a LCI pagar mais que 11,05%, é mais vantajosa.
        </p>
      </Card>
    </Section>

    <Section title="Estratégia: Construindo uma Carteira de Renda Fixa">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Reserva de emergência:</strong> Tesouro Selic ou CDB de liquidez diária, equivalente a 6-12 meses de gastos. Não comprometa com prazo fixo.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Curto prazo (1-3 anos):</strong> CDB prefixado, LCI/LCA com carência compatível, Tesouro Prefixado com vencimento alinhado ao objetivo.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Longo prazo (5+ anos):</strong> Tesouro IPCA+ para proteger poder de compra. CRI/CRA com IPCA+ de emissores sólidos. Debêntures incentivadas de projetos de infraestrutura.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Diversifique emissores:</strong> Nunca concentre mais de R$ 250k por banco. Distribua entre Tesouro (sem limite) e diferentes instituições.
        </p>
      </Card>
    </Section>
  </div>
)
