import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section, Indicator } from './shared'

export const AcoesBr = () => (
  <div className="space-y-8">
    <Section title="O que é uma ação?">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Uma ação representa uma fração do capital social de uma empresa. Ao comprar ações, você se torna sócio do negócio — com direito a participar dos lucros (dividendos) e da valorização patrimonial. O objetivo é escolher empresas que gerem valor real ao longo do tempo, não especular no curto prazo.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Existem dois tipos principais: <strong className="text-foreground">ON (Ordinária)</strong> — dá direito a voto nas assembleias; e <strong className="text-foreground">PN (Preferencial)</strong> — prioridade no recebimento de dividendos, sem voto. No Brasil, ações terminadas em 3 são ON; em 4, 11 são PN ou units.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Ibovespa</strong> é o índice de referência das ações brasileiras — equivalente ao IFIX para FIIs. Reúne as ações mais negociadas da B3 ponderadas por volume. Use-o como benchmark: se sua carteira de ações perder consistentemente para o Ibovespa no longo prazo, vale revisar a estratégia (ou considerar ETFs que replicam o índice).
      </p>
    </Section>

    <Section title="ETFs — Alternativa ao Stock Picking">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Se você não quer (ou não tem tempo) para analisar empresas individualmente, ETFs de ações são uma alternativa legítima. Um ETF replica automaticamente um índice — ao comprar uma cota, você compra uma fatia de todas as empresas do índice de uma vez.
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { ticker: 'BOVA11', desc: 'Replica o Ibovespa (~80 maiores empresas da B3). A forma mais simples de ter exposição à bolsa brasileira.', badge: 'Principal referência' },
            { ticker: 'IVVB11', desc: 'Replica o S&P 500 americano em reais. Exposição às 500 maiores empresas dos EUA + proteção cambial (dólar).', badge: 'EUA em BRL' },
            { ticker: 'SMAL11', desc: 'Replica um índice de small caps brasileiras. Maior potencial de crescimento, mais risco e volatilidade.', badge: 'Small caps BR' },
          ].map((etf) => (
            <Card key={etf.ticker} className="p-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-sm text-foreground">{etf.ticker}</span>
                <Badge variant="outline" className="text-xs">{etf.badge}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{etf.desc}</p>
            </Card>
          ))}
        </div>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3">
            <p className="font-medium text-green-800 dark:text-green-300 text-sm">Vantagens do ETF</p>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-0.5 mt-1">
              <li>• Diversificação instantânea (dezenas de empresas)</li>
              <li>• Sem necessidade de analisar cada ação</li>
              <li>• Custo baixo (taxa de administração ~0,1-0,5%)</li>
              <li>• Bate a maioria dos gestores ativos no longo prazo</li>
            </ul>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded p-3">
            <p className="font-medium text-yellow-800 dark:text-yellow-300 text-sm">Limitações</p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-0.5 mt-1">
              <li>• Você carrega também as empresas ruins do índice</li>
              <li>• Ganho de capital tributado a 15% (sem isenção de R$ 20k)</li>
              <li>• Dividendos reinvestidos internamente (sem renda mensal)</li>
              <li>• Impossível superar o índice — você É o índice</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Para iniciantes:</strong> começar por BOVA11 ou IVVB11 enquanto aprende análise fundamentalista é uma estratégia sensata. Ao ganhar confiança, migrar gradualmente para stock picking em empresas que você realmente entende.
        </p>
      </Card>
    </Section>

    <Section title="Escolas de Investimento">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4 space-y-2 border-blue-300 dark:border-blue-800">
          <p className="font-semibold text-sm text-foreground">Value Investing</p>
          <p className="text-sm text-muted-foreground">Busca empresas boas vendidas abaixo do valor intrínseco — comprar "R$1 por R$0,60". Fundado por Benjamin Graham e popularizado por Warren Buffett. Foco em margem de segurança: quanto maior o desconto em relação ao valor justo, menor o risco de perda. Filosofia base do curso.</p>
        </Card>
        <Card className="p-4 space-y-2 border-green-300 dark:border-green-800">
          <p className="font-semibold text-sm text-foreground">Buy and Hold</p>
          <p className="text-sm text-muted-foreground">Comprar empresas de qualidade e manter por anos ou décadas, independentemente das oscilações de curto prazo. A convicção é que negócios excelentes crescem e remuneram o sócio ao longo do tempo. Reduz custos de transação, IR e o erro emocional de comprar caro e vender barato.</p>
        </Card>
        <Card className="p-4 space-y-2 border-purple-300 dark:border-purple-800">
          <p className="font-semibold text-sm text-foreground">Análise Fundamentalista</p>
          <p className="text-sm text-muted-foreground">Avalia o valor real do negócio por trás da ação — balanços, lucro, dívida, gestão, setor. Em contraste com a análise técnica (gráficos e preços). O curso é integralmente baseado em fundamentos: o preço oscila no curto prazo, mas o valor do negócio é o que determina o resultado no longo prazo.</p>
        </Card>
      </div>
    </Section>

    <Section title="Indicadores Fundamentalistas">
      <div className="grid gap-3 sm:grid-cols-2">
        <Indicator
          name="P/L — Preço sobre Lucro"
          formula="P/L = Preço da ação ÷ Lucro por ação (LPA)"
          ideal="< 15 (quanto menor, mais barata)"
          description="Indica quantos anos de lucro seriam necessários para pagar o preço atual da ação. P/L de 10 significa que, ao ritmo atual, em 10 anos você recupera o investimento. Útil para comparar empresas do mesmo setor."
          alert="Empresas em crescimento acelerado podem ter P/L alto justificado. Compare sempre com o histórico da própria empresa e com os pares do setor."
        />
        <Indicator
          name="P/VP — Preço sobre Valor Patrimonial"
          formula="P/VP = Preço da ação ÷ Valor Patrimonial por ação"
          ideal="< 1.5 (idealmente < 1)"
          description="Compara o preço de mercado com o valor contábil da empresa. P/VP < 1 significa que você está comprando a empresa por menos do que vale no papel — pode indicar oportunidade ou problema estrutural."
          alert="Bancos e seguradoras naturalmente operam com P/VP mais alto. Setores de varejo e indústria pesada tendem a P/VP baixo."
        />
        <Indicator
          name="ROE — Retorno sobre Patrimônio"
          formula="ROE = Lucro Líquido ÷ Patrimônio Líquido × 100"
          ideal="> 15% ao ano"
          description="Mede a eficiência com que a empresa usa o dinheiro dos acionistas para gerar lucro. Um ROE de 20% significa que para cada R$100 de patrimônio, a empresa gera R$20 de lucro. É um dos indicadores mais importantes de qualidade."
          alert="ROE muito alto pode ser artificial se a empresa tiver muita dívida (alavancagem). Analise junto com o endividamento."
        />
        <Indicator
          name="ROIC — Retorno sobre Capital Investido"
          formula="ROIC = NOPAT ÷ Capital Investido × 100"
          ideal="> custo de capital da empresa (WACC)"
          description="Mais preciso que o ROE pois inclui dívidas. Mede quanto a empresa gera com todo o capital que usa, próprio e de terceiros. Empresas com ROIC consistentemente alto criam valor real para o acionista."
        />
        <Indicator
          name="Margem EBIT"
          formula="Margem EBIT = EBIT ÷ Receita Líquida × 100"
          ideal="> 10% (varia por setor)"
          description="Lucro operacional antes de juros e impostos dividido pela receita. Mostra o quanto do faturamento se converte em resultado operacional. Empresas com margem EBIT consistente são mais previsíveis."
          alert="Setores como varejo têm margens naturalmente baixas (2-5%). Tecnologia e saúde tendem a margens mais altas. Compare dentro do setor."
        />
        <Indicator
          name="Dívida Líquida / EBITDA"
          formula="Dívida Líquida ÷ EBITDA"
          ideal="< 2x (idealmente < 1x)"
          description="Indica quantos anos de geração de caixa operacional seriam necessários para quitar toda a dívida líquida. Empresas muito endividadas correm risco em crises e têm menos flexibilidade para crescer."
          alert="Empresas de utilities (energia, saneamento) naturalmente operam com mais alavancagem (até 3-4x) pois têm receita previsível e contratos de longo prazo."
        />
        <Indicator
          name="Dividend Yield (DY)"
          formula="DY = Dividendos por ação ÷ Preço da ação × 100"
          ideal="> 5% ao ano"
          description="Retorno em dividendos em relação ao preço atual. Empresas maduras e estáveis costumam pagar mais dividendos. Importante verificar se o dividendo é sustentável (não está comprometendo o caixa)."
          alert="DY muito alto pode indicar queda no preço da ação (preço caiu, o yield sobe). Sempre analise o payout e a geração de caixa."
        />
        <Indicator
          name="EV/EBITDA"
          formula="EV ÷ EBITDA (EV = Market Cap + Dívida Líquida)"
          ideal="< 8x para empresas maduras"
          description="Quanto o mercado paga por cada unidade de geração de caixa operacional da empresa, considerando também a dívida. Muito usado em aquisições e para comparações internacionais, pois remove distorções de estrutura de capital e impostos."
        />
        <Indicator
          name="Margem Líquida"
          formula="Margem Líquida = Lucro Líquido ÷ Receita Líquida × 100"
          ideal="> 10% (varia muito por setor)"
          description="Quanto sobra de lucro para cada R$1 de receita após todos os custos, despesas, juros e impostos. É o indicador mais direto de lucratividade real. Empresas com margem líquida consistente e crescente demonstram eficiência operacional e pricing power."
          alert="Varejo pode ter margem de 2-4%; tecnologia e saúde, 20-40%. Compare sempre dentro do setor. O importante é a tendência — margem estável ou crescendo é melhor que margem alta mas caindo."
        />
        <Indicator
          name="Payout"
          formula="Payout = Dividendos totais ÷ Lucro Líquido × 100"
          ideal="40-80% para empresas maduras"
          description="Percentual do lucro distribuído como proventos (dividendos + JCP). Payout alto = empresa madura que distribui muito, mas cresce pouco. Payout baixo = empresa reinveste no crescimento. Nenhum é melhor per se — depende do estágio do negócio."
          alert="Payout > 100% (empresa distribui mais do que lucrou) é insustentável no longo prazo — consome caixa ou aumenta dívida. Verifique se o dividendo é gerado por lucro operacional, não por venda de ativos."
        />
        <Indicator
          name="Fluxo de Caixa Livre (FCF)"
          formula="FCF = Fluxo de Caixa Operacional − Capex"
          ideal="Positivo e crescente"
          description="A geração real de caixa da empresa após pagar todos os investimentos necessários para manter/crescer o negócio. Uma empresa pode ter lucro contábil mas FCF negativo (investe mais do que gera). FCF positivo é o que paga dividendos, reduz dívida e financia aquisições de verdade."
          alert="Empresas com lucro alto mas FCF negativo podem estar reconhecendo receitas que ainda não receberam. Sempre compare lucro líquido com FCF — divergências persistentes são sinal de alerta."
        />
        <Indicator
          name="Free Float"
          formula="Free Float = Ações em circulação ÷ Total de ações × 100"
          ideal="> 25% (quanto maior, melhor)"
          description="Percentual das ações que está efetivamente disponível para negociação no mercado — excluindo o bloco de controle e ações em tesouraria. Free float baixo significa que poucas ações mudam de mão, o que aumenta volatilidade e facilita manipulação de preço."
          alert="Ações com free float < 15% são mais voláteis e difíceis de negociar em grande volume. Fundos de investimento geralmente exigem free float mínimo para incluir uma ação na carteira."
        />
      </div>
    </Section>

    <Section title="Fórmula de Graham — Preço Justo">
      <Card className="p-4 space-y-3">
        <p className="text-base text-muted-foreground font-mono bg-muted px-3 py-2 rounded text-center">
          VI = √(22,5 × LPA × VPA)
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">LPA</strong> = Lucro por Ação |{' '}
          <strong className="text-foreground">VPA</strong> = Valor Patrimonial por Ação
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O número 22,5 vem de P/L máximo de 15 × P/VP máximo de 1,5 = 22,5. Se o preço atual
          estiver abaixo do valor intrínseco calculado, a ação pode estar subavaliada. É uma fórmula
          conservadora, criada para o mercado americano dos anos 70.
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
          ⚠️ Não use para bancos, seguradoras, empresas com LPA negativo ou crescimento muito acelerado. É um ponto de partida, não uma verdade absoluta.
        </p>
      </Card>
      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">Margem de Segurança</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Conceito central do Value Investing: <strong className="text-foreground">nunca pague o preço justo — compre com desconto</strong>. Se você calcula que uma ação vale R$ 40, só compre se estiver abaixo de R$ 28-30 (margem de 25-30%). Esse desconto protege contra erros na análise, surpresas negativas e deterioração temporária do negócio.
        </p>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Graham dizia:</strong> "A margem de segurança é o segredo do investimento bem-sucedido." Quanto maior a incerteza sobre o negócio, maior deve ser a margem exigida — 30-40% para empresas menores, 15-20% para blue chips consolidadas.
        </p>
      </Card>
    </Section>

    <Section title="Análise Qualitativa — As 15 Perguntas de Philip Fisher">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Números sozinhos não bastam. Fisher propôs uma análise do negócio em si, que complementa os
        indicadores quantitativos:
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          'A empresa tem produtos ou serviços com mercado suficiente para crescer por muitos anos?',
          'A gestão está comprometida em desenvolver novos produtos mesmo quando o negócio atual vai bem?',
          'O P&D (pesquisa e desenvolvimento) é eficiente em relação ao tamanho da empresa?',
          'A empresa tem uma força de vendas acima da média do setor?',
          'A empresa tem margem de lucro satisfatória e com tendência de melhora?',
          'O que a empresa faz para manter ou melhorar suas margens?',
          'A empresa tem relações trabalhistas e ambiente interno saudáveis?',
          'A alta gestão tem relações de qualidade com executivos de segundo nível?',
          'A gestão tem profundidade? Há sucessão planejada?',
          'A empresa analisa seus custos e controles contábeis com rigor?',
          'Há aspectos específicos do negócio que diferenciam a empresa dos concorrentes?',
          'A empresa pensa apenas no curto prazo ou tem visão de longo prazo?',
          'No futuro, o crescimento exigirá muito capital externo, diluindo os acionistas atuais?',
          'A gestão comunica os problemas aos acionistas, ou só fala dos sucessos?',
          'A gestão age com integridade inquestionável?',
        ].map((q, i) => (
          <div key={q} className="flex gap-2 text-sm">
            <span className="text-muted-foreground shrink-0 font-mono text-xs mt-0.5">
              {i + 1}.
            </span>
            <p className="text-muted-foreground">{q}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Governança Corporativa e Tag Along">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            A B3 possui segmentos de listagem com exigências crescentes de transparência e proteção ao acionista minoritário. Quanto mais alto o nível, mais garantias você tem como sócio.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              {
                nivel: 'Novo Mercado',
                cor: 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800',
                regras: ['Apenas ações ON (todos têm direito a voto)', 'Tag along de 100%', 'Free float mínimo de 25%', 'Conselho com mínimo 5 membros independentes', 'Demonstrações em IFRS'],
              },
              {
                nivel: 'Nível 2 (N2)',
                cor: 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800',
                regras: ['Pode ter ações PN com tag along de 100%', 'Direito de voto em matérias relevantes para PN', 'Free float mínimo de 25%', 'Arbitra conflitos na Câmara de Arbitragem'],
              },
              {
                nivel: 'Nível 1 (N1)',
                cor: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-300 dark:border-yellow-800',
                regras: ['Tag along de 80% para ON', 'Free float mínimo de 25%', 'Menor exigência de transparência', 'PN sem direito a voto'],
              },
              {
                nivel: 'Mercado Tradicional',
                cor: 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800',
                regras: ['Tag along mínimo legal: 80% para ON, 0% para PN', 'Sem exigências especiais de free float', 'Menor proteção ao minoritário', 'Evite salvo tiver análise profunda'],
              },
            ].map((item) => (
              <Card key={item.nivel} className={`p-3 border ${item.cor} space-y-2`}>
                <p className="text-sm font-semibold text-foreground">{item.nivel}</p>
                <ul className="space-y-0.5">
                  {item.regras.map((r) => (
                    <li key={r} className="text-xs text-muted-foreground">• {r}</li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Tag Along — Sua Proteção na Venda da Empresa</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tag along é o direito do acionista minoritário de vender suas ações pelo mesmo preço (ou percentual do preço) que o controlador recebeu em caso de troca de controle da empresa. Sem tag along, o controlador pode vender sua fatia com prêmio e você fica preso com ações de uma empresa sob novo controle desconhecido.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Exemplo:</strong> Empresa com tag along 100% — controlador vende a R$ 50/ação. Você tem o direito de vender também a R$ 50. Com tag along 80% — você tem direito a R$ 40. Sem tag along — você não tem direito nenhum e fica à mercê do novo dono.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Quando NÃO comprar uma ação">
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          {
            label: 'Lucro decrescente há 3+ anos',
            desc: 'Tendência de piora estrutural, não apenas cíclica.',
          },
          {
            label: 'Dívida fora de controle',
            desc: 'Dívida Líquida/EBITDA > 3-4x sem perspectiva de melhora.',
          },
          {
            label: 'Gestão com histórico ruim',
            desc: 'Destruição de valor, promessas não cumpridas, escândalos.',
          },
          {
            label: 'Setor em declínio estrutural',
            desc: 'Negócio sendo substituído por tecnologia ou mudança de comportamento.',
          },
          {
            label: 'Governança fraca',
            desc: 'Empresa fora do Novo Mercado, sem tag along ou com controle familiar abusivo.',
          },
          {
            label: 'Preço muito acima do justo',
            desc: 'Margem de segurança negativa — todo crescimento já está no preço.',
          },
        ].map((item) => (
          <Card key={item.label} className="p-3 border-destructive/30">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="Diagrama do Cerrado">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          O Diagrama do Cerrado é um método de triagem de ações que avalia cada empresa em múltiplos critérios objetivos, classificando cada um como verde (atende), amarelo (aceitável) ou vermelho (não atende). Quanto mais critérios verdes, mais a ação merece entrar na carteira.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { criterio: 'P/L', verde: '< 15', amarelo: '15–20', vermelho: '> 20' },
            { criterio: 'P/VP', verde: '< 1,5', amarelo: '1,5–2', vermelho: '> 2' },
            { criterio: 'ROE', verde: '> 15%', amarelo: '10–15%', vermelho: '< 10%' },
            { criterio: 'Dívida/EBITDA', verde: '< 2x', amarelo: '2–3x', vermelho: '> 3x' },
            { criterio: 'Dividend Yield', verde: '> 5%', amarelo: '3–5%', vermelho: '< 3%' },
            { criterio: 'Crescimento de lucro', verde: 'Crescente há 5+ anos', amarelo: 'Estável', vermelho: 'Decrescente' },
            { criterio: 'Margem líquida', verde: 'Estável ou crescendo', amarelo: 'Levemente caindo', vermelho: 'Em queda consistente' },
            { criterio: 'Governança', verde: 'Novo Mercado / N2', amarelo: 'N1 / Bovespa Mais', vermelho: 'Mercado Tradicional' },
          ].map((item) => (
            <div key={item.criterio} className="rounded border overflow-hidden text-xs">
              <div className="bg-muted px-3 py-1.5 font-medium text-foreground">{item.criterio}</div>
              <div className="grid grid-cols-3 divide-x">
                <div className="px-2 py-1.5 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400">{item.verde}</div>
                <div className="px-2 py-1.5 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400">{item.amarelo}</div>
                <div className="px-2 py-1.5 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400">{item.vermelho}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Regra prática:</strong> maioria verde = candidata à compra. Qualquer critério vermelho que não tenha justificativa clara = descarte ou adiamento. Os limiares são referências, não dogmas — ajuste conforme o setor.
        </p>
      </Card>
    </Section>

    <Section title="Carteira Triangular">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          A carteira triangular organiza as ações em três camadas com objetivos e perfis de risco distintos. A base sustenta a carteira, o meio equilibra e o topo arrisca com potencial maior.
        </p>
        <div className="space-y-2">
          {[
            {
              nivel: 'Base (maior alocação)',
              desc: 'Ações defensivas, empresas maduras, boas pagadoras de dividendos. Setor de utilities, bancos sólidos, empresas com receita previsível. Objetivo: renda e estabilidade.',
              cor: 'bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-800',
              badge: 'Ex: TAEE11, BBAS3, ITUB4',
            },
            {
              nivel: 'Meio (alocação moderada)',
              desc: 'Empresas de crescimento moderado, com histórico sólido mas ainda em expansão. Boa combinação entre dividendos e valorização patrimonial.',
              cor: 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800',
              badge: 'Ex: WEGE3, RENT3, RADL3',
            },
            {
              nivel: 'Topo (menor alocação)',
              desc: 'Ações de alto potencial e maior risco. Empresas em setores novos, menor histórico, mais voláteis. Podem multiplicar — ou perder muito valor. Posição pequena para não destruir a carteira em caso de erro.',
              cor: 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-800',
              badge: 'Ex: small caps, turnaround, setor tech',
            },
          ].map((item) => (
            <Card key={item.nivel} className={`p-3 border ${item.cor} space-y-1`}>
              <p className="text-sm font-semibold text-foreground">{item.nivel}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
              <p className="text-xs text-muted-foreground italic">{item.badge}</p>
            </Card>
          ))}
        </div>
      </Card>
    </Section>

    <Section title="Proventos — Como as Empresas Remuneram o Acionista">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            tipo: 'Dividendos',
            badge: 'Isento de IR para PF',
            desc: 'Parte do lucro distribuída diretamente em dinheiro. O valor é descontado do preço da ação na data ex (data de corte). Isento de IR para pessoa física — o melhor tipo de provento do ponto de vista tributário.',
            cor: 'border-green-300 dark:border-green-800',
          },
          {
            tipo: 'JCP — Juros sobre Capital Próprio',
            badge: '15% retido na fonte',
            desc: 'Alternativa aos dividendos que reduz o imposto da empresa. Para o acionista, 15% são retidos na fonte. Se você está em carteira de buy and hold, já recebe líquido. Não é preciso declarar separadamente — já vem com IRRF.',
            cor: 'border-yellow-300 dark:border-yellow-800',
          },
          {
            tipo: 'Bonificação',
            badge: 'Ações, não dinheiro',
            desc: 'A empresa emite novas ações e distribui aos acionistas. Você não recebe dinheiro — recebe mais ações. O preço por ação cai proporcionalmente. Seu patrimônio total não muda no momento da bonificação, mas você tem mais ações para compor.',
            cor: 'border-blue-300 dark:border-blue-800',
          },
          {
            tipo: 'Direitos de Subscrição',
            badge: 'Opção de compra',
            desc: 'Quando a empresa emite novas ações (capitalização), dá aos acionistas o direito de comprar a um preço inferior ao mercado. Você pode exercer (comprar mais barato), vender o direito na bolsa, ou deixar expirar. Não exercer pode diluir sua participação.',
            cor: 'border-purple-300 dark:border-purple-800',
          },
        ].map((item) => (
          <Card key={item.tipo} className={`p-4 space-y-2 border ${item.cor}`}>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <span className="font-semibold text-sm text-foreground">{item.tipo}</span>
              <Badge variant="outline" className="text-xs shrink-0">{item.badge}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="Aluguel de Ações (BTC — Banco de Títulos)">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Investidores de longo prazo podem emprestar suas ações para outros participantes do mercado (geralmente vendedores a descoberto) e receber uma taxa de aluguel. O processo é intermediado pela B3 através do BTC — Banco de Títulos CBLC.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Para quem empresta (doador)</p>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• Renda extra sem vender as ações</li>
              <li>• Continua recebendo dividendos e JCP</li>
              <li>• Pode resgatar as ações quando quiser (D+1)</li>
              <li>• Taxa anual varia de 0,5% a 10%+ dependendo da demanda</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Como funciona na prática</p>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Habilite o aluguel na sua corretora (geralmente gratuito)</li>
              <li>• A B3 garante o contrato — risco de crédito é mínimo</li>
              <li>• IR: 15% sobre a receita de aluguel (tabela regressiva)</li>
              <li>• Ações mais procuradas para short têm taxas mais altas</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Dica:</strong> ideal para quem já tem carteira consolidada e não pretende vender no curto prazo. É renda extra sobre ativos que já fazem parte da estratégia de longo prazo.
        </p>
      </Card>
    </Section>

    <Section title="Operações na Bolsa — Conceitos Essenciais">
      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">Desdobramento (Split)</p>
          <p className="text-sm text-muted-foreground">A empresa aumenta o número de ações, reduzindo proporcionalmente o preço. Ex: split 1:10 — quem tinha 1 ação de R$ 100 passa a ter 10 ações de R$ 10. O patrimônio não muda. Objetivo: aumentar liquidez e tornar a ação mais acessível.</p>
        </Card>
        <Card className="p-4 space-y-2">
          <p className="font-semibold text-sm text-foreground">Agrupamento (Inplit)</p>
          <p className="text-sm text-muted-foreground">O oposto do split: reduz o número de ações aumentando o preço proporcionalmente. Ex: inplit 10:1 — quem tinha 10 ações de R$ 1 passa a ter 1 ação de R$ 10. Geralmente sinaliza que o preço caiu demais — não altera o valor total.</p>
        </Card>
        <Card className="p-4 space-y-2 sm:col-span-2">
          <p className="font-semibold text-sm text-foreground">Preço Médio</p>
          <p className="text-sm text-muted-foreground">
            Quando você compra a mesma ação em momentos diferentes, o custo médio é calculado por: <span className="font-mono bg-muted px-1 rounded text-xs">(Qtd anterior × PM anterior + Qtd nova × Preço novo) ÷ Qtd total</span>. O preço médio é o que determina se você teve lucro ou prejuízo na venda — e é a base de cálculo do IR.
          </p>
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Exemplo:</strong> comprou 100 ações a R$ 20 (PM = R$ 20). Comprou mais 100 a R$ 16. Novo PM = (100×20 + 100×16) ÷ 200 = R$ 18. Se vender acima de R$ 18, há lucro tributável.
          </p>
        </Card>
      </div>
    </Section>

    <Section title="Setores — Defensivos vs Cíclicos">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Empresas se comportam diferente conforme o momento econômico. Entender o setor é fundamental para saber quando comprar e qual parte da carteira triangular cada ação ocupa.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-green-700 dark:text-green-400">Setores Defensivos</p>
            <p className="text-sm text-muted-foreground">Receita previsível independente da economia. As pessoas continuam usando energia, saneamento, remédios e alimentos mesmo em crise.</p>
            {[
              { setor: 'Energia Elétrica / Saneamento', ex: 'TAEE11, SAPR11, EGIE3' },
              { setor: 'Saúde / Farmácia', ex: 'RADL3, FLRY3, HAPV3' },
              { setor: 'Alimentos', ex: 'BEEF3, MRFG3' },
              { setor: 'Telecomunicações', ex: 'VIVT3, TIMS3' },
            ].map((s) => (
              <div key={s.setor} className="bg-green-50 dark:bg-green-950/30 rounded px-3 py-2 text-xs">
                <span className="font-medium text-foreground">{s.setor}</span>
                <span className="text-muted-foreground ml-2">{s.ex}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">Setores Cíclicos</p>
            <p className="text-sm text-muted-foreground">Receita varia com a economia. Quando o PIB cresce, lucram mais. Em recessão, sofrem. Exigem análise do ciclo econômico para o momento de compra.</p>
            {[
              { setor: 'Bancos / Financeiro', ex: 'ITUB4, BBAS3, BBDC4' },
              { setor: 'Varejo', ex: 'MGLU3, LREN3, AMER3' },
              { setor: 'Construção Civil', ex: 'CYRE3, MRVE3, EZTC3' },
              { setor: 'Commodities (minério, petróleo)', ex: 'VALE3, PETR4, PRIO3' },
            ].map((s) => (
              <div key={s.setor} className="bg-orange-50 dark:bg-orange-950/30 rounded px-3 py-2 text-xs">
                <span className="font-medium text-foreground">{s.setor}</span>
                <span className="text-muted-foreground ml-2">{s.ex}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Regra prática:</strong> a base da carteira triangular deve ser majoritariamente defensiva. Setores cíclicos podem ir no meio e no topo — mas exigem atenção ao momento do ciclo e maior margem de segurança.
        </p>
      </Card>
    </Section>

    <Section title="Estratégia Geral">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Método Burro (DCA):</strong> aporte um valor fixo todos os meses, independente do preço. Quando o mercado cai, você compra mais ações com o mesmo dinheiro. Quando sobe, compra menos. Com o tempo, o preço médio tende a ser melhor do que tentar acertar o momento certo — e elimina a paralisia emocional de "esperar o fundo".
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Preço de entrada importa.</strong> A melhor empresa comprada no preço errado pode dar prejuízo por anos. Sempre calcule uma margem de segurança — compre com desconto em relação ao seu valor estimado.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Diversifique com critério.</strong> 10 a 15 ações bem analisadas são suficientes. Carteiras com 30+ ativos frequentemente têm desempenho medíocre — você não consegue acompanhar tudo.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Pense como dono.</strong> Antes de comprar, pergunte: "Eu compraria esse negócio inteiro se pudesse?" Se a resposta for não, não compre nem uma ação.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Revisão periódica.</strong> A cada trimestre, releia os balanços das empresas que você tem. Os fundamentos mudaram? O motivo pelo qual você comprou ainda existe?
        </p>
      </Card>
    </Section>
  </div>
)
