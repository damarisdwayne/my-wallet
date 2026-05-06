import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Section } from './shared'

export const Exterior = () => (
  <div className="space-y-8">
    <Section title="Por que investir no exterior?">
      <p className="text-sm text-muted-foreground leading-relaxed">
        Manter todos os recursos apenas no Brasil é arriscado — você está exposto à legislação,
        instabilidade política, desvalorização do Real e ao risco-Brasil. Diversificar no exterior
        reduz essa concentração e abre acesso a economias mais estáveis, moedas fortes e mercados
        muito maiores.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            title: 'Proteção cambial',
            desc: 'Ativos em dólar tendem a subir quando o Real cai. A correlação negativa entre Ibovespa e dólar serve como hedge natural para a carteira.',
          },
          {
            title: 'Universo muito maior',
            desc: 'EUA tem 5.000+ empresas listadas vs. ~300 no Brasil. São mais de 4.000 ETFs e ADRs que permitem exposição a qualquer mercado do mundo.',
          },
          {
            title: 'Segurança jurídica',
            desc: 'Mercados desenvolvidos têm histórico de proteção ao investidor, menor risco de confisco e reguladores como SEC e FINRA que fiscalizam ativamente.',
          },
          {
            title: 'Setores ausentes no Brasil',
            desc: 'Tecnologia de ponta, saúde inovadora, semicondutores, inteligência artificial — praticamente inexistentes na B3. No exterior, são os setores mais rentáveis da história recente.',
          },
        ].map((item) => (
          <Card key={item.title} className="p-4 space-y-1">
            <p className="font-semibold text-sm text-foreground">{item.title}</p>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>
      <Card className="p-3 bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          ⚠️ BDRs e ETFs brasileiros de índices estrangeiros (IVVB11, SPXI11) ainda expõem ao
          risco-Brasil. Para proteção real, o ideal é investir diretamente em corretoras no
          exterior.
        </p>
      </Card>
    </Section>

    <Section title="Como funciona o mercado americano">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Principais diferenças em relação ao Brasil
          </p>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            {[
              {
                br: 'Mercado fracionário existe',
                us: 'Não há mercado fracionário — lotes inteiros',
              },
              {
                br: 'Dividendos isentos de IR para PF',
                us: 'Dividendos tributados em 30% na fonte',
              },
              {
                br: 'Tickers: 4 letras + 1 ou 2 números',
                us: 'Tickers sem padrão fixo (AAPL, MSFT, KO)',
              },
              {
                br: 'ON = voto, PN = preferência',
                us: 'Common Stock = voto; Preferred Stock = dividendo garantido (em desuso)',
              },
              { br: 'Ibovespa como índice principal', us: 'S&P 500, Nasdaq Composite, Dow Jones' },
              { br: '~300 empresas listadas', us: '5.000+ ações + 4.000+ ETFs + ADRs globais' },
            ].map((row) => (
              <div key={row.br} className="bg-muted rounded p-2 space-y-1">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">BR:</span> {row.br}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">EUA:</span> {row.us}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Principais índices americanos</p>
          <div className="space-y-2 text-sm">
            {[
              {
                name: 'S&P 500 (.INX)',
                desc: 'As 500 maiores empresas americanas. O benchmark mais usado para comparação de performance de carteiras.',
              },
              {
                name: 'Nasdaq Composite (.IXIC)',
                desc: 'Inclui ações, REITs e ADRs. Forte concentração em tecnologia. Mais volátil que o S&P.',
              },
              {
                name: 'Dow Jones (.DJI)',
                desc: 'As 30 maiores e mais tradicionais empresas dos EUA. Mais antigo e menos representativo que o S&P.',
              },
              {
                name: 'Dividend Aristocrats',
                desc: 'Empresas que pagam e aumentam dividendos há pelo menos 25 anos consecutivos. Raras, pois dividendos são tributados em 30% nos EUA.',
              },
            ].map((item) => (
              <div key={item.name} className="flex gap-2">
                <span className="font-mono text-xs text-primary shrink-0 pt-0.5">{item.name}</span>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Órgãos reguladores e proteção</p>
          <div className="grid gap-2 sm:grid-cols-2 text-sm">
            {[
              {
                name: 'SEC',
                desc: 'Securities and Exchange Commission — equivalente à CVM brasileira. Regula o mercado de capitais.',
              },
              {
                name: 'FINRA',
                desc: 'Instituição privada criada por corretores para combater crimes financeiros e garantir transparência.',
              },
              {
                name: 'SIPC',
                desc: 'Mantida pelas corretoras. Garante até US$500k por investidor (US$250k em dinheiro) em caso de falência da corretora.',
              },
              {
                name: 'FDIC',
                desc: 'Equivalente ao FGC brasileiro. Garante até US$250k em bancos americanos. NÃO cobre corretoras de valores.',
              },
            ].map((item) => (
              <Card key={item.name} className="p-3 space-y-1">
                <p className="font-medium text-sm text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </Section>

    <Section title="Como abrir conta e enviar dinheiro">
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Avenue</span>
              <Badge variant="secondary" className="text-xs">
                Recomendada
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Primeira corretora americana focada em brasileiros. Interface em português, plataforma
              completa (web + app). Cobra taxas por ordem: ~US$1 para ordens até US$1.000, até
              US$8,60 acima de US$2.000. Certificada FINRA e SEC.
            </p>
          </Card>
          <Card className="p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Passfolio</span>
              <Badge variant="outline" className="text-xs">
                Sem taxa de ordem
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Sem taxa por ordem, sem mínimo de investimento, sem taxa de custódia. Opera apenas
              pelo celular. Aceita TED, criptomoedas e Remessa Online. Boa para quem quer começar
              com valores pequenos.
            </p>
          </Card>
        </div>

        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">Custos do envio de dinheiro</p>
          <div className="grid gap-2 sm:grid-cols-3 text-sm">
            <div className="bg-muted rounded p-3">
              <p className="font-medium text-foreground">IOF</p>
              <p className="text-muted-foreground mt-1">
                1% se você enviar para si mesmo. 0,38% para terceiros/corretoras. Sempre envie para
                a corretora para pagar 0,38%.
              </p>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="font-medium text-foreground">Spread cambial</p>
              <p className="text-muted-foreground mt-1">
                Taxa cobrada na conversão de Real para dólar. Varia por corretora e método. Remessa
                Online cobra ~1,3% sobre a taxa de câmbio.
              </p>
            </div>
            <div className="bg-muted rounded p-3">
              <p className="font-medium text-foreground">Imposto de herança EUA</p>
              <p className="text-muted-foreground mt-1">
                40% sobre ativos nos EUA em caso de falecimento. Considere abrir conta conjunta para
                evitar burocracia.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Section>

    <Section title="ETFs — A forma mais eficiente de investir no exterior">
      <p className="text-sm text-muted-foreground leading-relaxed">
        ETFs americanos pagam dividendos (diferente dos brasileiros), têm taxas de administração
        muito mais baixas e oferecem isenção tributária para vendas até R$35.000/mês. São a forma
        mais eficiente de se diversificar internacionalmente sem precisar analisar empresa por
        empresa.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            ticker: 'QQQ',
            name: 'Invesco QQQ Trust',
            desc: 'As 100 maiores empresas do Nasdaq: Apple, Microsoft, Google, Amazon, Netflix, Adobe. Forte concentração em tecnologia. Melhor para exposição ao crescimento tech americano.',
            badge: 'Tecnologia',
          },
          {
            ticker: 'SPY / IVV',
            name: 'S&P 500',
            desc: 'Replica as 500 maiores empresas dos EUA. A mais diversificada e segura. IVV (BlackRock) tem taxa mais baixa que o SPY. No Brasil, o IVVB11 replica o IVV mas com risco-BR.',
            badge: 'Amplo Mercado',
          },
          {
            ticker: 'VNQ',
            name: 'Vanguard Real Estate ETF',
            desc: 'Composto exclusivamente por REITs americanos. Equivalente a ter uma carteira diversificada de fundos imobiliários dos EUA por um único ativo.',
            badge: 'Imobiliário',
          },
          {
            ticker: 'EWZ',
            name: 'iShares MSCI Brazil ETF',
            desc: 'Curiosidade: as principais empresas brasileiras estão listadas neste ETF americano. Petrobras, Vale, Itaú. Permite que estrangeiros invistam no Brasil.',
            badge: 'Brasil',
          },
          {
            ticker: 'CQQQ',
            name: 'Invesco China Technology ETF',
            desc: 'Empresas de tecnologia chinesas: Alibaba, Tencent, Baidu. Exposição à China sem abrir conta no mercado asiático.',
            badge: 'China',
          },
          {
            ticker: 'EWJ',
            name: 'iShares MSCI Japan ETF',
            desc: 'Replica o índice Nikkei com as principais empresas japonesas. Japão tem transparência econômica consolidada e economia de primeiro mundo.',
            badge: 'Japão',
          },
          {
            ticker: 'IAU / GLD / GOLD11',
            name: 'ETFs de Ouro',
            desc: 'IAU (iShares) e GLD (SPDR) replicam o preço do ouro em dólar. No Brasil, GOLD11 faz o mesmo em reais. Exposição ao ouro sem custódia física.',
            badge: 'Ouro',
          },
          {
            ticker: 'XLK',
            name: 'Technology Select Sector',
            desc: 'Apenas empresas de tecnologia do S&P 500: cartões de crédito digitais, plataformas, softwares. Mais concentrado e puro que o QQQ em termos de tech.',
            badge: 'Tecnologia',
          },
        ].map((item) => (
          <Card key={item.ticker} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-sm text-primary">{item.ticker}</span>
                <p className="text-xs text-muted-foreground">{item.name}</p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {item.badge}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">O que analisar em um ETF</p>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { k: 'Net Assets', v: 'Patrimônio total do fundo. Maior = mais seguro e líquido.' },
            {
              k: 'Expense Ratio',
              v: 'Taxa de administração anual. ETFs americanos costumam cobrar 0,03%-0,20%. Bem abaixo dos fundos brasileiros.',
            },
            {
              k: 'PE Ratio (TTM)',
              v: 'Preço sobre lucro dos últimos 12 meses. Avalia se o ETF está caro ou barato.',
            },
            {
              k: 'YTD Return',
              v: 'Retorno no ano corrente. Compare com o índice de referência (benchmark).',
            },
            {
              k: 'Beta',
              v: 'Mede a volatilidade em relação ao mercado. Beta > 1 = mais volátil que o mercado.',
            },
            {
              k: 'Holdings',
              v: 'As empresas dentro do ETF. Verifique concentração — um ETF com 50% em 2 empresas tem menos diversificação.',
            },
          ].map((row) => (
            <div key={row.k} className="flex gap-2 bg-muted rounded px-3 py-2">
              <span className="font-medium text-foreground shrink-0">{row.k}:</span>
              <span className="text-muted-foreground">{row.v}</span>
            </div>
          ))}
        </div>
      </Card>
    </Section>

    <Section title="REITs — Fundos Imobiliários Americanos">
      <p className="text-sm text-muted-foreground leading-relaxed">
        REITs (Real Estate Investment Trusts) são empresas — não fundos — com foco imobiliário. Para
        ser classificado como REIT, 75% da receita deve ser imobiliária, 95% da receita vir de
        ativos/desenvolvimento e 90% do lucro deve ser distribuído como proventos.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            type: 'Equity REIT',
            desc: 'Possuem imóveis físicos. Equivalente aos FIIs de Tijolo. Renda vem do aluguel. Ex: American Tower (torres de telecom), Public Storage (galpões).',
            badge: 'Tijolo',
          },
          {
            type: 'Mortgage REIT',
            desc: 'Investem em recebíveis de hipotecas (equivalente ao papel brasileiro). Sofreram muito na crise de 2008 quando hipotecas pararam de ser pagas.',
            badge: 'Papel',
          },
          {
            type: 'Hybrid REIT',
            desc: 'Misturam Equity e Mortgage. Gestão mais flexível para alocar conforme o ciclo imobiliário.',
            badge: 'Misto',
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
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-3">
        <p className="text-sm font-semibold text-foreground">
          REITs vs FIIs — principais diferenças
        </p>
        <div className="grid gap-2 sm:grid-cols-2 text-sm">
          {[
            { fi: 'FII distribui mensalmente', reit: 'REIT distribui trimestralmente' },
            {
              fi: 'FII não pode se alavancar facilmente',
              reit: 'REIT pode se alavancar usando imóveis como garantia (pode gerar mais retorno)',
            },
            {
              fi: 'Dividendos isentos de IR para PF',
              reit: 'Dividendos tributados em 30% na fonte para estrangeiros',
            },
            {
              fi: 'DY geralmente > 7%',
              reit: 'DY geralmente < 5%, mas valorização do ativo costuma compensar',
            },
          ].map((row) => (
            <div key={row.fi} className="bg-muted rounded p-2 space-y-1 text-xs">
              <p>
                <span className="font-medium text-foreground">FII:</span>{' '}
                <span className="text-muted-foreground">{row.fi}</span>
              </p>
              <p>
                <span className="font-medium text-foreground">REIT:</span>{' '}
                <span className="text-muted-foreground">{row.reit}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">Exemplos de REITs conhecidos:</strong> AMT (torres de
          telecom), PSA (armazenagem), DOC (consultórios médicos), VNQ (ETF de REITs diversificado).
        </p>
      </Card>
    </Section>

    <Section title="Renda Fixa nos EUA">
      <p className="text-sm text-muted-foreground leading-relaxed">
        O Tesouro americano é considerado o ativo mais seguro do mundo — historicamente nunca deixou
        de pagar. O FED (Federal Reserve) é o banco central americano, e o FOMC (equivalente ao
        COPOM) se reúne 8 vezes ao ano para definir a taxa de juros (Funds Rate).
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            name: 'Treasury Bills (T-Bills)',
            etf: 'ETF: BIL',
            desc: 'Vencimento < 12 meses. Pós-fixado, acompanha a Funds Rate. Equivalente ao Tesouro Selic brasileiro. Baixo risco, baixa rentabilidade.',
            badge: 'Curto prazo',
          },
          {
            name: 'Treasury Notes',
            etf: 'ETF: GOVT',
            desc: 'Vencimento de 2 a 10 anos. Rentabilidade prefixada, paga juros semestrais. Equivalente ao Tesouro Prefixado.',
            badge: 'Médio prazo',
          },
          {
            name: 'Treasury Bonds',
            etf: 'ETF: TLT',
            desc: 'Vencimento de 10 a 30 anos. Prefixado, paga juros semestrais. Muito sensível à marcação a mercado — sobe bastante quando juros caem.',
            badge: 'Longo prazo',
          },
          {
            name: 'TIPS (Tips)',
            etf: 'ETFs: VTIP, STIP, LPTZ',
            desc: 'Vencimento variado. Protegem contra o CPI (inflação americana). Equivalente ao Tesouro IPCA+. Menos populares pois a inflação americana é controlada.',
            badge: 'Anti-inflação',
          },
        ].map((item) => (
          <Card key={item.name} className="p-4 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-semibold text-sm text-foreground">{item.name}</span>
                <p className="text-xs text-muted-foreground font-mono">{item.etf}</p>
              </div>
              <Badge variant="secondary" className="text-xs shrink-0">
                {item.badge}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-2">
        <p className="text-sm font-semibold text-foreground">ETFs de Renda Fixa — outros tipos</p>
        <div className="space-y-2 text-sm">
          {[
            {
              ticker: 'LQD',
              desc: 'Dívidas de grandes empresas americanas com grau de investimento (Investment Grade). Maior risco que o Tesouro, maior rentabilidade.',
            },
            {
              ticker: 'EMB',
              desc: 'Títulos públicos de países emergentes em dólar. Alta rentabilidade, maior risco. Inclui Brasil, México, Indonésia, etc.',
            },
            {
              ticker: 'BNDX',
              desc: 'Títulos de países desenvolvidos (Alemanha, Japão, França). Baixo risco, baixo retorno. Boa diversificação geográfica.',
            },
            {
              ticker: 'BND',
              desc: 'Mix de Tesouro americano + hipotecas (mortgages). Fundo "all-in-one" de renda fixa americana.',
            },
          ].map((item) => (
            <div key={item.ticker} className="flex gap-3 bg-muted rounded px-3 py-2">
              <span className="font-mono font-bold text-primary shrink-0">{item.ticker}</span>
              <p className="text-muted-foreground text-xs">{item.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </Section>

    <Section title="Tributação para brasileiros investindo no exterior">
      <div className="space-y-3">
        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">
            Ganho de capital na venda de ativos
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { faixa: 'Ganho até R$ 5 milhões', aliq: '15%' },
              { faixa: 'R$ 5M a R$ 10M', aliq: '17,5%' },
              { faixa: 'R$ 10M a R$ 30M', aliq: '20%' },
              { faixa: 'Acima de R$ 30M', aliq: '22,5%' },
            ].map((row) => (
              <div key={row.faixa} className="flex justify-between bg-muted rounded px-3 py-2">
                <span className="text-muted-foreground">{row.faixa}</span>
                <span className="font-medium text-foreground">{row.aliq}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Isenção para <strong className="text-foreground">vendas até R$ 35.000/mês</strong> (soma
            de todos os ativos no exterior). Acima disso, pague DARF (código 8523) até o último dia
            útil do mês seguinte.
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Dividendos recebidos do exterior</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Os EUA retêm 30% na fonte sobre dividendos pagos a estrangeiros. Esse valor já é
            descontado antes de chegar na sua conta. Você ainda precisa declarar os dividendos
            recebidos como <strong className="text-foreground">rendimentos tributáveis</strong> no
            Brasil e pagar a diferença (quando a alíquota brasileira for maior que 30%).
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Atenção:</strong> Dividendos de ETFs americanos
            também sofrem a retenção de 30%. Por isso, para quem busca renda, FIIs brasileiros
            (isentos) são mais eficientes do que REITs americanos (30% de IR).
          </p>
        </Card>

        <Card className="p-4 space-y-2">
          <p className="text-sm font-semibold text-foreground">Declaração anual de IR</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Declare saldos e investimentos no exterior na ficha{' '}
            <strong className="text-foreground">Bens e Direitos</strong> (código 06 para ações, 09
            para ETFs). Use o valor em reais na data de 31/12, convertido pela taxa PTAX do Banco
            Central. As corretoras americanas enviam relatórios anuais (Form 1099) com todos os
            dados necessários.
          </p>
        </Card>
      </div>
    </Section>
  </div>
)
