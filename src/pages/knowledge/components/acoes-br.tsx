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
      </div>
    </Section>

    <Section title="Fórmula de Graham — Preço Justo">
      <Card className="p-4 space-y-3">
        <p className="text-base text-muted-foreground font-mono bg-muted px-3 py-2 rounded text-center">
          VI = √(22,5 × LPA × VPA)
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">LPA</strong> = Lucro por Ação | <strong className="text-foreground">VPA</strong> = Valor Patrimonial por Ação
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          O número 22,5 vem de P/L máximo de 15 × P/VP máximo de 1,5 = 22,5. Se o preço atual estiver abaixo do valor intrínseco calculado, a ação pode estar subavaliada. É uma fórmula conservadora, criada para o mercado americano dos anos 70.
        </p>
        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
          ⚠️ Não use para bancos, seguradoras, empresas com LPA negativo ou crescimento muito acelerado. É um ponto de partida, não uma verdade absoluta.
        </p>
      </Card>
    </Section>

    <Section title="Análise Qualitativa — As 15 Perguntas de Philip Fisher">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Números sozinhos não bastam. Fisher propôs uma análise do negócio em si, que complementa os indicadores quantitativos:
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
            <span className="text-muted-foreground shrink-0 font-mono text-xs mt-0.5">{i + 1}.</span>
            <p className="text-muted-foreground">{q}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section title="Quando NÃO comprar uma ação">
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          { label: 'Lucro decrescente há 3+ anos', desc: 'Tendência de piora estrutural, não apenas cíclica.' },
          { label: 'Dívida fora de controle', desc: 'Dívida Líquida/EBITDA > 3-4x sem perspectiva de melhora.' },
          { label: 'Gestão com histórico ruim', desc: 'Destruição de valor, promessas não cumpridas, escândalos.' },
          { label: 'Setor em declínio estrutural', desc: 'Negócio sendo substituído por tecnologia ou mudança de comportamento.' },
          { label: 'Governança fraca', desc: 'Empresa fora do Novo Mercado, sem tag along ou com controle familiar abusivo.' },
          { label: 'Preço muito acima do justo', desc: 'Margem de segurança negativa — todo crescimento já está no preço.' },
        ].map((item) => (
          <Card key={item.label} className="p-3 border-destructive/30">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="Estratégia Geral">
      <Card className="p-4 space-y-3">
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
