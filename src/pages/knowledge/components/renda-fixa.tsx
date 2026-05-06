import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section } from './shared'

export const RendaFixa = () => (
  <div className="space-y-8">
    <Section title="O que é Renda Fixa?">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Renda fixa são investimentos onde as regras de remuneração são definidas no momento da
        aplicação: você sabe de antemão como vai receber (taxa prefixada, CDI, IPCA+). O risco é
        menor, mas o retorno tende a ser mais previsível e limitado em relação à renda variável no
        longo prazo.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        A renda fixa não é apenas para "guardar dinheiro" — ela tem papel estratégico em qualquer
        carteira: reserva de emergência, proteção contra inflação, geração de fluxo de caixa
        previsível e balanceamento de risco.
      </p>
    </Section>

    <Section title="Hierarquia de Risco e Retorno">
      <div className="space-y-2">
        {[
          {
            rank: '1',
            label: 'Tesouro Direto',
            risk: 'Risco Soberano',
            desc: 'Títulos emitidos pelo governo federal — o mais seguro possível em Real. O governo pode imprimir moeda, então o risco de calote é mínimo, mas existe risco inflacionário.',
            color: 'bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800',
          },
          {
            rank: '2',
            label: 'CDB de banco grande (BB, Caixa, Itaú, Bradesco)',
            risk: 'Risco bancário + FGC',
            desc: 'Certificados de Depósito Bancário emitidos por grandes bancos. Cobertura do FGC até R$ 250k por CPF por instituição. Mais rentável que o Tesouro em geral.',
            color: 'bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800',
          },
          {
            rank: '3',
            label: 'LCI e LCA de banco grande',
            risk: 'Risco bancário + FGC + isenção IR',
            desc: 'Letras de Crédito Imobiliário e do Agronegócio. Isentos de IR para PF, o que eleva o retorno líquido. Mesma cobertura do FGC. Tem prazo mínimo de carência.',
            color: 'bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800',
          },
          {
            rank: '4',
            label: 'CDB / LC / RDB de banco médio ou financeira',
            risk: 'Risco maior + FGC',
            desc: 'CDB (bancos), LC — Letra de Câmbio (emitida por financeiras, não é câmbio de moeda) e RDB — Recibo de Depósito Bancário. Todos cobertos pelo FGC até R$ 250k. Pagam mais pelo maior risco do emissor. Distribua entre diferentes instituições.',
            color: 'bg-yellow-100 dark:bg-yellow-950/50 border-yellow-300 dark:border-yellow-800',
          },
          {
            rank: '5',
            label: 'CRI e CRA',
            risk: 'Risco do emissor, sem FGC',
            desc: 'Certificados de Recebíveis Imobiliários e do Agronegócio. Emitidos por securitizadoras (não por bancos). Isentos de IR para PF. Sem cobertura do FGC — analise o devedor do CRI/CRA, não apenas o emissor.',
            color: 'bg-orange-100 dark:bg-orange-950/50 border-orange-300 dark:border-orange-800',
          },
          {
            rank: '6',
            label: 'Debêntures',
            risk: 'Risco corporativo, sem FGC',
            desc: 'Títulos de dívida emitidos por empresas. Debêntures incentivadas (infraestrutura) são isentas de IR para PF. As demais são tributadas. Maior risco pois a empresa pode quebrar.',
            color: 'bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800',
          },
        ].map((item) => (
          <Card key={item.rank} className={`p-4 border ${item.color}`}>
            <div className="flex items-start gap-3">
              <span className="text-lg font-bold text-muted-foreground shrink-0 w-5">
                {item.rank}.
              </span>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">{item.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.risk}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="FGC — Fundo Garantidor de Créditos">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          O FGC garante até{' '}
          <strong className="text-foreground">R$ 250.000 por CPF por instituição financeira</strong>
          , com limite global de <strong className="text-foreground">R$ 1.000.000 por CPF</strong>{' '}
          em um período de 4 anos. Cobre CDB, LCI, LCA, poupança, LH, LC.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Importante:</strong> CRI, CRA e Debêntures{' '}
          <strong className="text-foreground">NÃO</strong> são cobertos pelo FGC. Títulos públicos
          também não precisam — são garantidos pelo governo.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Se você tem R$ 500k para investir em CDB de banco médio, distribua em pelo menos 2
          instituições diferentes para estar completamente coberto.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Índice de Basileia:</strong> indicador de saúde
          financeira dos bancos — quanto maior, mais capital próprio o banco tem para absorver
          perdas. Acima de 11% é o mínimo exigido pelo BC. Bancos sólidos ficam acima de 14-16%.
          Antes de investir em CDB de banco médio, consulte o Índice de Basileia da instituição no
          site do Banco Central (bcb.gov.br).
        </p>
      </Card>
    </Section>

    <Section title="CDI, SELIC, IPCA e Poupança — Os Índices que Regem Tudo">
      <div className="grid gap-3 sm:grid-cols-2 sm:grid-rows-2">
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">SELIC</p>
          <p className="text-sm text-muted-foreground">
            Taxa básica de juros da economia brasileira, definida pelo COPOM (Banco Central) a cada
            45 dias. É a referência de custo de dinheiro no Brasil. Todos os outros indexadores
            giram em torno dela.
          </p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">CDI</p>
          <p className="text-sm text-muted-foreground">
            Certificado de Depósito Interbancário — taxa que bancos cobram entre si para empréstimos
            de curtíssimo prazo. Fica ~0,1% abaixo da SELIC. É o índice de referência dos
            investimentos de renda fixa. "100% do CDI" ≈ SELIC − 0,1%.
          </p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">IPCA</p>
          <p className="text-sm text-muted-foreground">
            Índice Nacional de Preços ao Consumidor Amplo — mede a inflação oficial do Brasil.
            Calculado pelo IBGE mensalmente com base numa cesta de produtos e serviços consumidos
            pelas famílias. Quando um título rende "IPCA + 6%", isso significa inflação do período
            mais 6% de ganho real. É o índice de referência para proteção do poder de compra.
          </p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">Poupança — evite</p>
          <p className="text-sm text-muted-foreground">
            Quando SELIC {'>'} 8,5% ao ano: rende 0,5% ao mês + TR (quase zero). Quando SELIC ≤
            8,5%: rende 70% da SELIC. Isenta de IR, mas mesmo assim perde para CDB e até para o
            Tesouro Selic em termos líquidos. Não use como investimento.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Taxa Nominal vs Taxa Real">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Taxa nominal</strong> é o número que aparece no
          contrato — ex: 12% ao ano. <strong className="text-foreground">Taxa real</strong> é o que
          você efetivamente ganha acima da inflação. São coisas muito diferentes.
        </p>
        <p className="text-sm font-mono bg-muted px-3 py-2 rounded text-center text-foreground">
          Taxa real = (1 + taxa nominal) ÷ (1 + inflação) − 1
        </p>
        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          {[
            {
              cenario: 'Investimento rende 12%, inflação 10%',
              real: '1.8% real',
              cor: 'text-yellow-600 dark:text-yellow-400',
            },
            {
              cenario: 'Investimento rende 12%, inflação 4%',
              real: '7,7% real',
              cor: 'text-green-600 dark:text-green-400',
            },
            {
              cenario: 'Investimento rende 6%, inflação 7%',
              real: '−0,9% real',
              cor: 'text-destructive',
            },
          ].map((c) => (
            <div key={c.cenario} className="bg-muted rounded p-2 space-y-1">
              <p className="text-muted-foreground">{c.cenario}</p>
              <p className={`font-bold ${c.cor}`}>{c.real}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Por que importa:</strong> em 2021-22 o Brasil teve
          inflação de ~10%. Quem tinha dinheiro na poupança (~4% ao ano) estava perdendo poder de
          compra mesmo "ganhando". Só há enriquecimento real quando a taxa nominal supera
          consistentemente a inflação.
        </p>
      </Card>
    </Section>

    <Section title="Tipos de Rentabilidade">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">Prefixada</p>
          <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            Ex: 13,5% ao ano
          </p>
          <p className="text-sm text-muted-foreground">
            Você sabe exatamente quanto vai receber. Bom quando a Selic está alta e tende a cair —
            você garante a taxa atual por mais tempo. Ruim se a inflação disparar acima do
            contratado.
          </p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">Pós-fixada</p>
          <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            Ex: 100% do CDI ou 110% do CDI
          </p>
          <p className="text-sm text-muted-foreground">
            Acompanha o CDI (que segue a Selic). Ideal para reserva de emergência e quando há
            incerteza sobre o futuro dos juros. Sempre rendendo próximo da taxa básica.
          </p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">IPCA+ (taxa real garantida)</p>
          <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            Ex: IPCA + 6% ao ano
          </p>
          <p className="text-sm text-muted-foreground">
            Garante 6% de taxa <em>real</em> acima da inflação — independente de quanto o IPCA suba.
            Se a inflação for 5%, você recebe 11%. Se for 10%, recebe 16%. Ideal para preservar
            poder de compra no longo prazo.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Marcação a Mercado">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Títulos prefixados e IPCA+ têm preço que varia diariamente no mercado secundário — isso se
          chama <strong className="text-foreground">marcação a mercado</strong>. O preço sobe quando
          as taxas de juros caem, e cai quando as taxas sobem. Se você segurar o título até o
          vencimento, recebe exatamente a taxa contratada. Se vender antes, recebe o preço de
          mercado do dia — podendo ganhar mais ou levar prejuízo.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Marcação a favor (oportunidade)
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              Se você comprou IPCA+ 7% e o mercado cai para IPCA+ 5%, seu título vale mais. Vender
              antes do vencimento gera ganho extra além dos juros.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded p-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Marcação contra (armadilha)
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              Se as taxas subiram, seu título desvalorizou. Vender antes do vencimento garante
              prejuízo. A solução é simples: não venda antes do vencimento.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Tesouro Selic não sofre marcação a mercado</strong>{' '}
          significativa — seu preço sobe linearmente todo dia. Por isso é o ideal para reserva de
          emergência.
        </p>
      </Card>
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
              <Badge variant="secondary" className="text-xs shrink-0">
                {item.tipo}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
            <p className="text-xs text-foreground/70">
              <span className="font-medium">Uso ideal:</span> {item.uso}
            </p>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="IOF — O Imposto Esquecido">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Além do IR, existe o{' '}
          <strong className="text-foreground">IOF (Imposto sobre Operações Financeiras)</strong> que
          incide sobre resgates realizados em menos de 30 dias. É tabelado e regressivo: começa em
          96% do rendimento no 1º dia e chega a 0% no 30º dia.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {[
            { dia: 'Dia 1', aliq: '96%' },
            { dia: 'Dia 7', aliq: '76%' },
            { dia: 'Dia 15', aliq: '50%' },
            { dia: 'Dia 29', aliq: '3%' },
          ].map((row) => (
            <div
              key={row.dia}
              className="flex flex-col items-center bg-muted rounded px-3 py-2 gap-1"
            >
              <span className="text-muted-foreground">{row.dia}</span>
              <span className="font-bold text-destructive">{row.aliq} do rendimento</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Na prática:</strong> nunca resgate um investimento de
          renda fixa antes de 30 dias a menos que seja emergência. O IOF é cobrado sobre o
          rendimento, não sobre o principal — mas pode zerar completamente o ganho nos primeiros
          dias.
        </p>
      </Card>
    </Section>

    <Section title="Imposto de Renda na Renda Fixa">
      <Card className="p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">
          Tabela Regressiva (CDB, Tesouro Direto, Debêntures comuns)
        </p>
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
          <strong className="text-foreground">Isentos de IR para PF:</strong> LCI, LCA, CRI, CRA e
          Debêntures Incentivadas (Lei 12.431). Por isso, compare sempre o rendimento líquido, não o
          bruto.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Como calcular equivalência:</strong> Para saber o
          equivalente de um CDB a 13% bruto vs LCI isenta: 13% × (1 - 0,15) = 11,05%. Se a LCI pagar
          mais que 11,05%, é mais vantajosa.
        </p>
      </Card>
    </Section>

    <Section title="Fundos de Renda Fixa e Come-Cotas">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Fundos de RF investem nos mesmos ativos (CDB, Tesouro, Debêntures) que você compraria
          diretamente, mas cobram taxa de administração e sofrem um mecanismo chamado{' '}
          <strong className="text-foreground">Come-Cotas</strong>: o IR é cobrado antecipadamente em
          maio e novembro de cada ano, sobre o rendimento acumulado, com alíquota de 15% (fundo
          longo prazo) ou 20% (curto prazo).
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O problema: o IR cobrado antecipadamente não fica rendendo para você — é como se o governo
          "comesse" parte das suas cotas antes do tempo. Isso reduz o efeito dos juros compostos ao
          longo dos anos.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-red-50 dark:bg-red-950/30 rounded p-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              Fundo de RF (Come-Cotas)
            </p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              IR cobrado em maio e novembro. Capital tributado antecipadamente perde poder de
              composição. Taxa de administração reduz o retorno bruto.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              CDB direto (sem Come-Cotas)
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              IR só no resgate, com alíquota decrescente até 15% após 2 anos. Todo o capital fica
              compondo até o vencimento. Mais eficiente no longo prazo.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Conclusão prática:</strong> Na maioria dos casos,
          comprar CDB, LCI ou Tesouro Direto diretamente é mais eficiente que investir por fundos de
          RF. A exceção pode ser acesso a ativos que não estão disponíveis individualmente para o
          investidor pessoa física.
        </p>
      </Card>
    </Section>

    <Section title="Estratégia: Construindo uma Carteira de Renda Fixa">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Reserva de emergência:</strong> Tesouro Selic ou CDB
          de liquidez diária, equivalente a 6-12 meses de gastos. Não comprometa com prazo fixo. É
          para imprevistos — não misture com investimento.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Reserva de oportunidade:</strong> diferente da
          emergência, é dinheiro separado intencionalmente para aproveitar quedas na bolsa. Fica no
          Tesouro Selic ou CDB líquido aguardando. Quando o mercado cai, você tem munição para
          comprar ativos bons com desconto.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Curto prazo (1-3 anos):</strong> CDB prefixado,
          LCI/LCA com carência compatível, Tesouro Prefixado com vencimento alinhado ao objetivo.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Longo prazo (5+ anos):</strong> Tesouro IPCA+ para
          proteger poder de compra. CRI/CRA com IPCA+ de emissores sólidos. Debêntures incentivadas
          de projetos de infraestrutura.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Diversifique emissores:</strong> Nunca concentre mais
          de R$ 250k por banco. Distribua entre Tesouro (sem limite) e diferentes instituições.
        </p>
      </Card>
    </Section>
  </div>
)
