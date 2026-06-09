import type { IndicatorDef, Rating } from './types'
import { directPct, ratio, num1, higherBetter, lowerBetter, positiveBetter } from './utils'

// Payout: 30–70% saudável (bom), 70–90% ou abaixo de 20% aceitável (médio),
// acima de 90% insustentável — distribui mais do que gera (ruim).
const payoutRating = (v: number): Rating => (v > 90 ? 'bad' : v >= 70 || v < 20 ? 'ok' : 'good')

export const STOCK_INDICATORS: IndicatorDef[] = [
  {
    key: 'priceEarnings',
    label: 'P/L',
    format: num1,
    trendType: 'neutral',
    rating: lowerBetter(15, 25),
    inputStep: '0.1',
    inputLabel: 'P/L (ex: 12.5)',
    tooltip: {
      title: 'P/L = Preço sobre o Lucro',
      description:
        'Quanto o mercado paga por cada R$ 1 de lucro líquido. P/L alto pode indicar expectativa de crescimento ou sobrevalorização.',
      ideal: 'Abaixo de 15 é considerado barato; acima de 25, caro — mas varia por setor.',
      calc: 'Preço atual ÷ lucro por ação (LPA)',
    },
  },
  {
    key: 'priceToBook',
    label: 'P/VP',
    format: ratio,
    trendType: 'neutral',
    rating: lowerBetter(1.5, 2.5),
    inputStep: '0.01',
    inputLabel: 'P/VP (ex: 1.40)',
    tooltip: {
      title: 'P/VP = Preço sobre o Valor Patrimonial',
      description:
        'Compara o preço de mercado com o patrimônio líquido por ação. Abaixo de 1 pode indicar ação sendo negociada abaixo do valor contábil.',
      ideal:
        'Menor que 1,5x é geralmente razoável; abaixo de 1x pode ser oportunidade ou sinal de problema.',
      calc: 'Preço atual ÷ valor patrimonial por ação',
    },
  },
  {
    key: 'dividendYield',
    label: 'DY',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(5, 3),
    inputStep: '0.1',
    inputLabel: 'DY em % (ex: 6)',
    tooltip: {
      title: 'DY = Dividend Yield',
      description:
        'Percentual dos dividendos pagos em relação ao preço atual da ação. Mede o retorno em dividendos do investimento.',
      ideal: 'Acima de 5% ao ano é considerado bom para ações brasileiras.',
      calc: 'Dividendos pagos nos últimos 12 meses ÷ preço atual × 100',
    },
  },
  {
    key: 'payout',
    label: 'Payout',
    format: directPct,
    trendType: 'neutral',
    rating: payoutRating,
    inputStep: '0.1',
    inputLabel: 'Payout em % (ex: 40)',
    tooltip: {
      title: 'Payout = Taxa de Distribuição de Dividendos',
      description:
        'Percentual do lucro líquido distribuído como dividendos. Payout muito alto pode comprometer o reinvestimento no negócio.',
      ideal: 'Entre 30% e 60% é saudável. Acima de 80% pode ser insustentável a longo prazo.',
      calc: 'Dividendos pagos ÷ lucro líquido × 100',
    },
  },
  {
    key: 'profitMargins',
    label: 'Mg. Líquida',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(10, 5),
    inputStep: '0.1',
    inputLabel: 'Margem Líquida em % (ex: 18)',
    tooltip: {
      title: 'Margem Líquida',
      description:
        'Percentual da receita que sobra como lucro após todos os custos, despesas, juros e impostos. Indica eficiência geral da empresa.',
      ideal:
        'Acima de 10% é bom; varia bastante por setor (bancos têm margens altas, varejo tem margens baixas).',
      calc: 'Lucro líquido ÷ receita líquida × 100',
    },
  },
  {
    key: 'grossMargins',
    label: 'Mg. Bruta',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(30, 15),
    inputStep: '0.1',
    inputLabel: 'Margem Bruta em % (ex: 45)',
    tooltip: {
      title: 'Margem Bruta',
      description:
        'Percentual da receita que sobra após deduzir o custo dos produtos vendidos (CPV). Reflete o poder de precificação e eficiência produtiva.',
      ideal: 'Acima de 30% é razoável; acima de 50% indica vantagem competitiva forte.',
      calc: 'Lucro bruto ÷ receita líquida × 100',
    },
  },
  {
    key: 'ebitdaMargins',
    label: 'Mg. EBITDA',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(20, 10),
    inputStep: '0.1',
    inputLabel: 'Margem EBITDA em % (ex: 30)',
    tooltip: {
      title: 'Margem EBITDA',
      description:
        'Percentual da receita convertido em EBITDA (lucro antes de juros, impostos, depreciação e amortização). Mede eficiência operacional pura.',
      ideal: 'Acima de 20% é considerado bom na maioria dos setores.',
      calc: 'EBITDA ÷ receita líquida × 100',
    },
  },
  {
    key: 'evToEbitda',
    label: 'EV/EBITDA',
    format: ratio,
    trendType: 'neutral',
    rating: lowerBetter(8, 15),
    inputStep: '0.01',
    inputLabel: 'EV/EBITDA (ex: 8.5)',
    tooltip: {
      title: 'EV/EBITDA = Valor da Empresa sobre EBITDA',
      description:
        'Quantos anos de EBITDA seriam necessários para pagar o valor total da empresa (incluindo dívida). Útil para comparar empresas com estruturas de capital diferentes.',
      ideal: 'Abaixo de 8x é considerado barato; acima de 15x, caro — depende do setor.',
      calc: 'Valor da empresa (market cap + dívida líquida) ÷ EBITDA',
    },
  },
  {
    key: 'returnOnEquity',
    label: 'ROE',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(15, 8),
    inputStep: '0.1',
    inputLabel: 'ROE em % (ex: 25)',
    tooltip: {
      title: 'ROE = Retorno sobre o Patrimônio Líquido',
      description:
        'Quanto a empresa gera de lucro para cada R$ 1 de patrimônio dos acionistas. Mede a eficiência no uso do capital próprio.',
      ideal: 'Acima de 15% é bom; empresas excelentes sustentam acima de 20% consistentemente.',
      calc: 'Lucro líquido ÷ patrimônio líquido × 100',
    },
  },
  {
    key: 'roic',
    label: 'ROIC',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(15, 8),
    inputStep: '0.1',
    inputLabel: 'ROIC em % (ex: 15)',
    tooltip: {
      title: 'ROIC = Retorno sobre o Capital Investido',
      description:
        'Mede a eficiência com que a empresa utiliza todo o capital investido (próprio + terceiros) para gerar lucro operacional. É um dos melhores indicadores de qualidade do negócio.',
      ideal:
        'Acima do custo de capital (WACC); acima de 15% é excelente. Empresas com ROIC alto e consistente tendem a criar valor a longo prazo.',
      calc: 'NOPAT (lucro operacional após impostos) ÷ capital investido × 100',
    },
  },
  {
    key: 'returnOnAssets',
    label: 'ROA',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(10, 5),
    inputStep: '0.1',
    inputLabel: 'ROA em % (ex: 10)',
    tooltip: {
      title: 'ROA = Retorno sobre os Ativos',
      description:
        'Quanto a empresa lucra em relação ao total de ativos que possui. Indica a eficiência no uso de todos os recursos (próprios e financiados).',
      ideal:
        'Acima de 5% é razoável; acima de 10% é muito bom. Bancos naturalmente têm ROA baixo (0,5–1,5%).',
      calc: 'Lucro líquido ÷ ativo total × 100',
    },
  },
  {
    key: 'debtToEquity',
    label: 'Dívida/PL',
    format: ratio,
    trendType: 'up-bad',
    rating: lowerBetter(1, 3),
    inputStep: '0.01',
    inputLabel: 'Dívida/PL (ex: 1.60)',
    tooltip: {
      title: 'Dívida/PL = Alavancagem Financeira',
      description:
        'Relação entre a dívida total e o patrimônio líquido. Mostra o grau de alavancagem da empresa. Quanto maior, maior o risco financeiro.',
      ideal: 'Abaixo de 1x é conservador; entre 1x e 2x é aceitável; acima de 3x requer atenção.',
      calc: 'Dívida total ÷ patrimônio líquido',
    },
  },
  {
    key: 'netDebtToEbitda',
    label: 'Dív. Líq./EBITDA',
    format: ratio,
    trendType: 'up-bad',
    rating: lowerBetter(2, 4),
    inputStep: '0.01',
    inputLabel: 'Dívida Líquida/EBITDA (ex: 2.5)',
    tooltip: {
      title: 'Dívida Líquida / EBITDA',
      description:
        'Quantos anos de geração de caixa operacional (EBITDA) a empresa precisaria para quitar sua dívida líquida. Principal métrica de endividamento usada pelo mercado.',
      ideal: 'Abaixo de 2x é saudável; entre 2x e 3x é tolerável; acima de 4x é alto risco.',
      calc: '(Dívida bruta − caixa) ÷ EBITDA',
    },
  },
  {
    key: 'revenueGrowth',
    label: 'Cresc. Receita',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(10, 0),
    inputStep: '0.1',
    inputLabel: 'Crescimento de Receita em % (ex: 8)',
    tooltip: {
      title: 'Crescimento de Receita',
      description:
        'Variação percentual da receita líquida em relação ao mesmo período do ano anterior. Indica se a empresa está expandindo suas vendas.',
      ideal: 'Acima de 10% a.a. é bom; acima de 20% é excelente para empresas maduras.',
      calc: '(Receita atual − receita anterior) ÷ receita anterior × 100',
    },
  },
  {
    key: 'earningsGrowth',
    label: 'Cresc. Lucro',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(10, 0),
    inputStep: '0.1',
    inputLabel: 'Crescimento de Lucro em % (ex: 12)',
    tooltip: {
      title: 'Crescimento de Lucro',
      description:
        'Variação percentual do lucro líquido em relação ao mesmo período do ano anterior. Deve crescer junto com (ou mais rápido que) a receita.',
      ideal:
        'Acima de 10% a.a. é bom; idealmente maior que o crescimento da receita (margem expandindo).',
      calc: '(Lucro atual − lucro anterior) ÷ lucro anterior × 100',
    },
  },
  {
    key: 'fcf',
    label: 'FCF',
    format: (v) => `R$ ${v.toFixed(0)} M`,
    trendType: 'up-good',
    rating: positiveBetter,
    inputStep: '1',
    inputLabel: 'FCF em R$ milhões (ex: 2300)',
    tooltip: {
      title: 'FCF = Fluxo de Caixa Livre',
      description:
        'Caixa gerado pelas operações após descontar investimentos em ativos fixos (capex). Representa o dinheiro disponível para pagar dividendos, recomprar ações ou quitar dívidas.',
      ideal: 'Deve ser positivo e crescente. FCF consistentemente negativo é sinal de alerta.',
      calc: 'Fluxo de caixa operacional − capex',
    },
  },
  {
    key: 'fcfYield',
    label: 'FCF Yield',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(8, 5),
    inputStep: '0.1',
    inputLabel: 'FCF Yield em % (ex: 8)',
    tooltip: {
      title: 'FCF Yield = Rendimento do Fluxo de Caixa Livre',
      description:
        'Percentual do FCF em relação ao valor de mercado da empresa. Mede quanto do preço pago se converte em caixa livre para o acionista.',
      ideal: 'Acima de 5% é atrativo; acima de 8% é muito bom.',
      calc: 'FCF ÷ capitalização de mercado × 100',
    },
  },
  {
    key: 'cashConversion',
    label: 'Conv. de Caixa',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(80, 50),
    inputStep: '0.1',
    inputLabel: 'Conversão de Caixa em % (ex: 80)',
    tooltip: {
      title: 'Conversão de Caixa',
      description:
        'Percentual do lucro líquido (ou EBITDA) que se converte em caixa livre. Alta conversão indica que os lucros reportados são reais e não apenas contábeis.',
      ideal:
        'Acima de 80% é excelente. Abaixo de 50% indica que o lucro pode não estar se materializando em caixa.',
      calc: 'FCF ÷ lucro líquido × 100 (ou FCF ÷ EBITDA × 100)',
    },
  },
  {
    key: 'pegRatio',
    label: 'PEG Ratio',
    format: ratio,
    trendType: 'neutral',
    rating: lowerBetter(1, 2),
    inputStep: '0.01',
    inputLabel: 'PEG Ratio (ex: 1.5)',
    tooltip: {
      title: 'PEG Ratio = P/L ajustado pelo Crescimento',
      description:
        'Relaciona o P/L com a taxa de crescimento dos lucros. Corrige a limitação do P/L ao considerar o crescimento esperado — uma empresa com P/L alto mas crescimento alto pode ser barata.',
      ideal: 'Abaixo de 1x é considerado barato; entre 1x e 2x é justo; acima de 2x está caro.',
      calc: 'P/L ÷ taxa de crescimento anual dos lucros (%)',
    },
  },
]
