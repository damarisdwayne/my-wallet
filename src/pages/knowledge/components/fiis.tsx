import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section, Indicator } from './shared'

export const Fiis = () => (
  <div className="space-y-8">
    <Section title="O que é um FII?">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Fundos de Investimento Imobiliário (FIIs) são fundos que investem no mercado imobiliário —
        seja comprando imóveis físicos, papéis de crédito imobiliário ou cotas de outros fundos. Ao
        comprar cotas na bolsa, você se torna cotista e recebe a distribuição dos rendimentos,
        geralmente mensalmente.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Por que FIIs pagam todo mês:</strong> por lei, FIIs são
        obrigados a distribuir no mínimo{' '}
        <strong className="text-foreground">95% do lucro caixa semestral</strong> — na prática, a
        maioria paga mensalmente. Isso os torna máquinas de renda passiva: ao contrário de ações
        (que podem reter lucro para crescer), o FII não tem escolha a não ser repassar quase tudo ao
        cotista.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">Vantagem tributária:</strong> Para pessoa física com
        menos de 10% das cotas e com o fundo tendo mais de 50 cotistas e listado em bolsa, os
        rendimentos são <strong className="text-foreground">isentos de Imposto de Renda</strong>. O
        ganho de capital na venda das cotas é tributado a 20%.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        <strong className="text-foreground">IFIX</strong> é o índice de referência dos FIIs na B3 —
        equivalente ao Ibovespa para fundos imobiliários. Reúne os principais FIIs ponderados por
        liquidez. Use-o como benchmark: se sua carteira de FIIs rende consistentemente menos que o
        IFIX, vale revisar a seleção de fundos.
      </p>
    </Section>

    <Section title="Tipos de FII">
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            type: 'Tijolo',
            badge: 'Imóvel Físico',
            desc: 'Possuem imóveis reais: shoppings, lajes corporativas, galpões logísticos, hospitais, hotéis, escolas. A renda vem do aluguel dos imóveis. Mais volátil pois depende da vacância e renovação de contratos.',
            ex: 'XPML11 (shopping), HGLG11 (logística), KNRI11 (lajes)',
          },
          {
            type: 'Papel',
            badge: 'CRI / LCI',
            desc: 'Investem em recebíveis imobiliários: CRI, LCI, LH. A renda vem dos juros desses títulos — geralmente atrelada ao CDI ou IPCA + spread. Menos volátil, mais previsível, mas sem valorização de imóveis.',
            ex: 'KNCR11, MXRF11, KCRE11',
          },
          {
            type: 'Fundo de Fundos (FOF)',
            badge: 'Cotas de FIIs',
            desc: 'Compram cotas de outros FIIs. Oferecem diversificação automática, mas cobram uma taxa extra de administração. Úteis para quem não quer analisar cada fundo individualmente.',
            ex: 'BCFF11, RBRF11, KFOF11',
          },
          {
            type: 'Desenvolvimento',
            badge: 'Alta Risco/Retorno',
            desc: 'Financiam construções e recebem o lucro da venda dos imóveis. Não geram renda recorrente. Maior risco pois dependem do sucesso do projeto. Indicado para investidores experientes.',
            ex: 'OUJP11, RBR Desenvolvimento',
          },
          {
            type: 'Híbrido',
            badge: 'Misto',
            desc: 'Combinam estratégias: parte em imóveis físicos, parte em papéis. Permitem ao gestor alocar onde há mais oportunidade em cada momento do ciclo imobiliário.',
            ex: 'ITRI11, CPTS11, HABT11',
          },
        ].map((item) => (
          <Card key={item.type} className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{item.type}</span>
              <Badge variant="outline" className="text-xs">
                {item.badge}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground">Ex:</span> {item.ex}
            </p>
          </Card>
        ))}
      </div>
    </Section>

    <Section title="Indicadores Fundamentalistas">
      <div className="grid gap-3 sm:grid-cols-2">
        <Indicator
          name="Dividend Yield (DY)"
          formula="DY = Rendimento anual por cota ÷ Preço da cota × 100"
          ideal="> 8% ao ano (acima do IPCA + prêmio)"
          description="Principal indicador de FIIs. Mede o retorno em renda em relação ao preço atual. Para ser atrativo, precisa superar o CDI ou Tesouro IPCA com uma margem de segurança que compense o risco de vacância e iliquidez."
          alert="Compare o DY com a taxa Selic. Se o Tesouro Direto paga mais sem risco, o FII precisa oferecer prêmio significativo para justificar o investimento."
        />
        <Indicator
          name="P/VPA — Preço sobre Valor Patrimonial"
          formula="P/VPA = Preço da cota ÷ Valor Patrimonial por cota"
          ideal="< 1.0 (comprando abaixo do patrimônio)"
          description="Compara o preço de mercado com o valor contábil dos ativos do fundo. P/VPA < 1 significa que você está comprando R$1 de patrimônio imobiliário por menos de R$1. Fundos premium de qualidade frequentemente negociam acima de 1."
          alert="Um P/VPA < 1 pode indicar oportunidade ou um problema real (vacância alta, gestão ruim, imóveis depreciados). Investigue o porquê antes de comprar."
        />
        <Indicator
          name="Vacância Física"
          ideal="< 10% (idealmente < 5%)"
          description="Percentual da área total do fundo que está desocupada. Diretamente impacta o rendimento: mais vacância = menos aluguel = menos dividendo. Para FIIs de tijolo, é o indicador mais crítico a monitorar."
          alert="Vacância acima de 20% é sinal de alerta. Verifique se é pontual (saída de inquilino) ou estrutural (imóvel mal localizado ou em setor em crise)."
        />
        <Indicator
          name="Vacância Financeira"
          ideal="< 10%"
          description="Percentual da receita potencial que não está sendo gerada. Difere da física pois considera o valor do aluguel — uma área pequena de alto valor pode ter mais impacto financeiro que uma área grande de baixo valor."
        />
        <Indicator
          name="Cap Rate"
          formula="Cap Rate = Receita de aluguel anual ÷ Valor de mercado dos imóveis × 100"
          ideal="> 7-8% para escritórios, > 9% para logística"
          description="Retorno operacional dos imóveis independente da alavancagem. Compara o rendimento do imóvel com o custo do dinheiro. Cap rate acima da Selic indica que o imóvel está gerando retorno real."
        />
        <Indicator
          name="Liquidez Diária"
          ideal="> R$ 1 milhão/dia"
          description="Volume médio diário de negociação na bolsa. FIIs com baixa liquidez têm spreads maiores, dificultam entrada/saída e são mais manipuláveis. Para o investidor individual, liquidez mínima de R$ 500k/dia é aceitável."
          alert="Cuidado com FIIs muito ilíquidos — em momentos de crise, você pode não conseguir vender a um preço justo."
        />
        <Indicator
          name="Qualidade dos Contratos"
          ideal="Contratos atípicos, prazos longos, reajuste IPCA"
          description="Contratos atípicos (built-to-suit, sale-leaseback) são mais difíceis de rescindir e geralmente têm prazo de 10-15 anos. Contratos típicos seguem a Lei do Inquilinato e podem ser rompidos com 30 dias de aviso. Mais contratos atípicos = mais segurança de renda."
        />
        <Indicator
          name="Gestora e Taxa de Administração"
          ideal="< 1% ao ano sobre PL"
          description="A qualidade da gestora impacta diretamente as decisões de compra e venda de imóveis, renegociação de contratos e captação. Gestoras renomadas (XP, Kinea, BTG, RBR) tendem a ter histórico mais consistente."
          alert="Taxas de performance acima de 20% sobre o benchmark são sinal de alerta — podem alinhar o gestor mais com o próprio ganho do que com o cotista."
        />
        <Indicator
          name="Yield on Cost (YOC)"
          formula="YOC = Rendimento anual por cota ÷ Preço médio pago × 100"
          ideal="Quanto maior, melhor — reflete seu retorno real"
          description="Diferente do DY de mercado, o YOC mostra o rendimento em relação ao preço que você pagou — não ao preço atual. Se comprou HGLG11 a R$ 130 e ele rende R$ 1/mês, seu YOC é 9,2% ao ano, mesmo que o DY atual de mercado (com cota a R$ 160) seja apenas 7,5%. Para investidor de longo prazo, o YOC tende a crescer com o tempo."
          alert="Nunca venda um FII de qualidade apenas porque o DY de mercado caiu — seu YOC pessoal pode estar ótimo. Calcule com base no seu preço médio real."
        />
      </div>
    </Section>

    <Section title="Ciclo Imobiliário e Taxa de Juros">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          FIIs têm relação inversa com a taxa de juros. Quando a Selic sobe, o preço dos FIIs tende
          a cair — o rendimento fixo fica mais atrativo e os FIIs precisam oferecer DY maior para
          competir, o que só acontece com queda de preço.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">Selic em queda</p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              Boa fase para FIIs. Preços tendem a subir pois o DY se torna mais atrativo em relação
              à renda fixa. Momento de acumular posição.
            </p>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded p-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Selic em alta</p>
            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
              FIIs tendem a desvalorizar. Mas se o rendimento ainda superar o CDI com margem, pode
              ser oportunidade de comprar bons fundos com desconto.
            </p>
          </div>
        </div>
      </Card>
    </Section>

    <Section title="Reajuste de Contratos — IGPM vs IPCA">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Contratos de aluguel em FIIs de tijolo são reajustados anualmente por um índice. A escolha
          do índice afeta diretamente o rendimento e a sustentabilidade do fundo — e já causou
          crises reais.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              IPCA (preferível)
            </p>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• Reflete a inflação do consumidor</li>
              <li>• Historicamente mais estável (3-10% ao ano)</li>
              <li>• Reajuste previsível — menos risco de rescisão</li>
              <li>• Padrão atual em novos contratos</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">IGP-M (risco)</p>
            <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
              <li>• Reflete custos de produção e atacado</li>
              <li>• Pode explodir: em 2020-21, o IGP-M chegou a +35%</li>
              <li>• Inquilinos não conseguem pagar — renegociam ou saem</li>
              <li>• Causa vacância e queda de DY</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">O que verificar:</strong> no relatório mensal, confira
          o índice de reajuste dos contratos do fundo. Fundos com muitos contratos IGP-M têm risco
          latente se esse índice disparar novamente. Prefira fundos que migraram para IPCA.
        </p>
      </Card>
    </Section>

    <Section title="Rendimento vs Amortização de Cota">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nem toda distribuição mensal de um FII é igual. É fundamental distinguir o que você está
          recebendo:
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Rendimento (isento de IR)
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
              Vem dos aluguéis, juros dos CRIs ou dividendos dos ativos do fundo. É geração de caixa
              operacional — o patrimônio do fundo não diminui. Isento de IR para PF nas condições
              normais.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Amortização de cota (não isenta de IR)
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              O fundo devolve parte do capital investido — como se "desfizesse" parte do fundo. O
              valor patrimonial por cota cai. Tributado como ganho de capital (20%). Não é renda — é
              devolução do seu próprio dinheiro.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Atenção ao DY inflado por amortização:</strong> se um
          FII distribui R$ 2/cota de rendimento + R$ 1/cota de amortização, o DY "real" é menor.
          Verifique sempre o relatório mensal para identificar a origem da distribuição.
        </p>
      </Card>
    </Section>

    <Section title="Emissão de Cotas — Follow-On">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Quando um FII quer comprar novos imóveis ou ampliar seu portfólio, ele precisa captar
          dinheiro — e faz isso emitindo novas cotas. Esse processo é chamado de{' '}
          <strong className="text-foreground">follow-on</strong> (ou oferta subsequente). Como
          cotista existente, você recebe direito de preferência para comprar as novas cotas antes do
          mercado geral.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-green-50 dark:bg-green-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Se participar do follow-on
            </p>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• Compra novas cotas geralmente com desconto sobre o mercado</li>
              <li>• Mantém sua participação proporcional no fundo</li>
              <li>• Só vale a pena se os novos ativos são de qualidade</li>
            </ul>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded p-3 space-y-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              Se não participar
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>• Sua participação relativa no fundo diminui (diluição)</li>
              <li>• Dependendo do preço de emissão, pode ser negativo para o P/VPA</li>
              <li>• Fique atento ao anúncio (fato relevante) — tem prazo curto para decidir</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Como avaliar:</strong> analise para que o fundo vai
          usar o capital captado. Aquisição de imóvel prime com cap rate atrativo = positivo.
          Captação sem destino definido ou para quitar dívidas = sinal de alerta. O histórico de
          emissões anteriores diz muito sobre a qualidade da gestão.
        </p>
      </Card>
    </Section>

    <Section title="Como Montar uma Carteira de FIIs">
      <Card className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Diversificação por segmento:</strong> Tenha FIIs de
          diferentes tipos — logística, lajes, shoppings, papel — para não depender de um único
          setor. A crise do varejo afeta shoppings diferente da crise de escritórios.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Mínimo de 5-8 FIIs:</strong> Com menos que isso, uma
          crise setorial pode destruir grande parte da carteira. Com mais de 15, fica difícil
          acompanhar.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Reinvestir os dividendos:</strong> O poder dos FIIs
          vem do reinvestimento mensal. Com R$ 1.000 de aporte e R$ 500 de dividendos, no próximo
          mês você compra R$ 1.500 de cotas — acelerando o crescimento patrimonial.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Atenção ao relatório mensal:</strong> Todo FII publica
          relatório mensal. O que analisar: (1) vacância física e financeira — subiu ou caiu? (2)
          origem da distribuição — rendimento operacional ou amortização? (3) contratos a vencer —
          há risco de queda de receita? (4) pipeline de aquisições — o gestor está alocando bem? (5)
          comentários de gestão — tom otimista ou cauteloso?
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Sites para pesquisa:</strong> Funds Explorer
          (fundsexplorer.com.br), Status Invest (statusinvest.com.br) e FIIs.com.br oferecem
          histórico de DY, P/VPA, vacância e relatórios consolidados. Use-os para triagem inicial
          antes de ler o relatório do fundo.
        </p>
      </Card>
    </Section>

    <Section title="Quando NÃO comprar um FII">
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          {
            label: 'Vacância muito alta e crescente',
            desc: 'Sinal de problema estrutural no imóvel ou setor.',
          },
          {
            label: 'DY muito acima dos pares',
            desc: 'Pode ser um dividend trap — preço caiu por algum problema real.',
          },
          {
            label: 'P/VPA muito acima de 1.5',
            desc: 'Você está pagando caro demais pelo patrimônio.',
          },
          {
            label: 'Gestora com histórico ruim',
            desc: 'Destruição de valor, desinvestimentos ruins, má comunicação.',
          },
          {
            label: 'Fundo muito pequeno ou ilíquido',
            desc: 'Patrimônio < R$ 100M e liquidez < R$ 200k/dia.',
          },
          {
            label: 'Concentração excessiva',
            desc: 'Um único inquilino representando > 70% da receita é risco de concentração.',
          },
        ].map((item) => (
          <Card key={item.label} className="p-3 border-destructive/30">
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
          </Card>
        ))}
      </div>
    </Section>
  </div>
)
