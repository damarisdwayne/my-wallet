import type { FiiInfo, StockInfo } from '@/types'
import type { FiiIndicatorDef, IndicatorDef } from './types'
import { directPct, ratio, num1 } from './utils'

export const STOCK_INDICATORS: IndicatorDef[] = [
  {
    key: 'priceEarnings',
    label: 'P/L',
    format: num1,
    trendType: 'neutral',
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

export const FII_COMMON: FiiIndicatorDef[] = [
  {
    type: 'number',
    key: 'dividendYield',
    label: 'DY',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'DY em % (ex: 8.5)',
    tooltip: {
      title: 'DY = Dividend Yield',
      description:
        'Percentual dos rendimentos distribuídos nos últimos 12 meses em relação ao preço atual da cota. Principal indicador de renda de um FII.',
      ideal: 'Acima de 8% ao ano é considerado atrativo para FIIs.',
      calc: 'Rendimentos pagos nos últimos 12 meses ÷ preço atual da cota × 100',
    },
  },
  {
    type: 'number',
    key: 'priceToBook',
    label: 'P/VP',
    format: ratio,
    trendType: 'neutral',
    inputStep: '0.01',
    inputLabel: 'P/VP (ex: 0.95)',
    tooltip: {
      title: 'P/VP = Preço sobre o Valor Patrimonial',
      description:
        'Relação entre o preço de mercado da cota e o valor patrimonial (patrimônio líquido ÷ cotas). Abaixo de 1 significa que o mercado precifica o fundo com desconto sobre seu patrimônio.',
      ideal: 'Entre 0,9x e 1,1x é considerado justo. Abaixo de 0,95x pode ser oportunidade.',
      calc: 'Preço da cota ÷ valor patrimonial por cota',
    },
  },
  {
    type: 'number',
    key: 'debtToEquity',
    label: 'Alavancagem (Dívida/PL)',
    format: ratio,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Alavancagem (Dívida/PL) (ex: 0.30)',
    tooltip: {
      title: 'Alavancagem = Dívida / Patrimônio Líquido',
      description:
        'Mede o grau de endividamento do fundo em relação ao seu patrimônio. FIIs com alta alavancagem têm maior risco em cenários de alta de juros.',
      ideal: 'Abaixo de 0,3x é conservador; acima de 0,5x requer atenção ao custo da dívida.',
      calc: 'Dívida total ÷ patrimônio líquido',
    },
  },
  {
    type: 'text',
    key: 'majorRevenueConcentration',
    label: 'Concentração de Receita',
    inputPlaceholder: 'Ex: Tenant A — 35% da receita',
    tooltip: {
      title: 'Concentração de Receita',
      description:
        'Percentual da receita do fundo proveniente dos maiores locatários ou devedores. Alta concentração em poucos inquilinos aumenta o risco de queda de renda.',
      ideal: 'Nenhum locatário respondendo por mais de 20–25% da receita total.',
    },
  },
]

export const FII_TIJOLO: FiiIndicatorDef[] = [
  {
    type: 'number',
    key: 'physicalVacancy',
    label: 'Vacância Física',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Vacância Física em % (ex: 8)',
    tooltip: {
      title: 'Vacância Física',
      description:
        'Percentual da área total do fundo que está desocupada. Área vaga não gera aluguel e pressiona os rendimentos distribuídos.',
      ideal: 'Abaixo de 5% é ótimo; entre 5% e 10% é aceitável; acima de 15% é preocupante.',
      calc: 'Área total vaga (m²) ÷ área total do fundo (m²) × 100',
    },
  },
  {
    type: 'number',
    key: 'financialVacancy',
    label: 'Vacância Financeira',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Vacância Financeira em % (ex: 6)',
    tooltip: {
      title: 'Vacância Financeira',
      description:
        'Percentual da receita potencial total que não está sendo recebida devido a áreas vagas. Difere da física pois pondera pelo valor de aluguel de cada área.',
      ideal:
        'Abaixo de 5% é saudável. Vacância financeira < física indica que as melhores áreas estão ocupadas.',
      calc: 'Receita potencial de áreas vagas ÷ receita potencial total × 100',
    },
  },
  {
    type: 'number',
    key: 'propertyCount',
    label: 'Qtd. Imóveis',
    format: (v) => String(Math.round(v)),
    trendType: 'up-good',
    inputStep: '1',
    inputLabel: 'Quantidade de imóveis',
    tooltip: {
      title: 'Quantidade de Imóveis',
      description:
        'Número total de imóveis na carteira do fundo. Maior diversificação geográfica e por ativo reduz o risco de concentração.',
      ideal: 'Quanto mais imóveis, menor o risco de um único ativo impactar os rendimentos.',
    },
  },
  {
    type: 'text',
    key: 'propertyQuality',
    label: 'Qualidade dos Imóveis',
    inputPlaceholder: 'Ex: AAA — lajes corporativas classe A em SP',
    tooltip: {
      title: 'Qualidade dos Imóveis',
      description:
        'Classificação e perfil dos ativos do fundo (classe A, B ou C; localização; padrão construtivo). Imóveis de alta qualidade têm menor vacância e maior valorização.',
      ideal:
        'Imóveis classe A em regiões prime tendem a ter locatários mais sólidos e contratos mais longos.',
    },
  },
  {
    type: 'number',
    key: 'noiPerSqm',
    label: 'NOI/m²',
    format: (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'NOI por m² em R$ (ex: 85.50)',
    tooltip: {
      title: 'NOI/m² = Renda Operacional Líquida por m²',
      description:
        'Receita de aluguel menos despesas operacionais do imóvel, dividida pela área total. Mede a geração de caixa por metro quadrado.',
      ideal: 'Deve ser crescente ao longo do tempo e superior à inflação.',
      calc: '(Receita de aluguel − despesas operacionais) ÷ área total (m²)',
    },
  },
  {
    type: 'number',
    key: 'salesPerSqm',
    label: 'Vendas/m²',
    format: (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'Vendas por m² em R$ (ex: 1119)',
    tooltip: {
      title: 'Vendas/m² (para FIIs de Shopping)',
      description:
        'Volume de vendas dos lojistas por metro quadrado de ABL. Indica a saúde do varejo dentro do shopping e a capacidade de pagar aluguel.',
      ideal:
        'Deve crescer acima da inflação. Quedas consecutivas sinalizam dificuldade dos lojistas.',
      calc: 'Vendas totais dos lojistas ÷ área bruta locável (m²)',
    },
  },
  {
    type: 'text',
    key: 'operators',
    label: 'Operadores',
    inputPlaceholder: 'Ex: Multiplan, BR Malls, Iguatemi',
    tooltip: {
      title: 'Operadores',
      description:
        'Empresas responsáveis pela gestão e operação dos imóveis do fundo (ex: administradora de shopping, operadora logística). A qualidade do operador afeta diretamente a taxa de ocupação.',
    },
  },
  {
    type: 'number',
    key: 'tenantCount',
    label: 'Qtd. Inquilinos',
    format: (v) => String(Math.round(v)),
    trendType: 'up-good',
    inputStep: '1',
    inputLabel: 'Quantidade de inquilinos',
    tooltip: {
      title: 'Quantidade de Inquilinos',
      description:
        'Número total de locatários ativos no fundo. Maior número de inquilinos reduz o risco de vacância concentrada em poucos contratos.',
      ideal:
        'Quanto mais diversificado o mix de inquilinos, menor o risco de perda súbita de renda.',
    },
  },
  {
    type: 'text',
    key: 'regionDiversification',
    label: 'Diversificação por Região',
    inputPlaceholder: 'Ex: SP 60%, RJ 25%, MG 15%',
    tooltip: {
      title: 'Diversificação Geográfica',
      description:
        'Distribuição dos imóveis do fundo por estado ou cidade. Concentração excessiva em uma região expõe o fundo a riscos locais (recessão, desastres naturais, excesso de oferta).',
      ideal:
        'Presença em múltiplos estados, com predominância em mercados líquidos como SP, RJ e MG.',
    },
  },
  {
    type: 'text',
    key: 'rentalContracts',
    label: 'Contratos de Aluguel',
    inputPlaceholder: 'Ex: 70% típico, 30% atípico',
    tooltip: {
      title: 'Tipo de Contratos de Aluguel',
      description:
        'Contratos típicos seguem a Lei do Inquilinato (revisão a cada 3 anos, rescisão com multa). Contratos atípicos são personalizados, geralmente mais longos e com multa mais alta — maior previsibilidade de renda.',
      ideal: 'Contratos atípicos de longo prazo com bons pagadores oferecem renda mais estável.',
    },
  },
  {
    type: 'text',
    key: 'avgContractDuration',
    label: 'Prazo Médio dos Contratos',
    inputPlaceholder: 'Ex: 7 anos (vencimento médio 2031)',
    tooltip: {
      title: 'Prazo Médio dos Contratos',
      description:
        'Duração média (ou data média de vencimento) dos contratos de locação vigentes. Contratos mais longos garantem maior previsibilidade de receita.',
      ideal: 'Acima de 5 anos é considerado longo prazo e reduz o risco de renovação.',
    },
  },
]

export const FII_PAPEL: FiiIndicatorDef[] = [
  {
    type: 'text',
    key: 'creditQuality',
    label: 'Qualidade do Crédito',
    inputPlaceholder: 'Ex: 80% AAA/AA, 15% A, 5% BB',
    tooltip: {
      title: 'Qualidade do Crédito',
      description:
        'Rating médio dos CRIs e CRAs na carteira do fundo. Créditos de alta qualidade (AAA/AA) têm menor risco de inadimplência, mas geralmente pagam spreads menores.',
      ideal: 'Carteira com pelo menos 70–80% dos ativos classificados como AA ou superior.',
    },
  },
  {
    type: 'text',
    key: 'indexationType',
    label: 'Tipo de Indexação',
    inputPlaceholder: 'Ex: 75% IPCA, 25% CDI',
    tooltip: {
      title: 'Tipo de Indexação',
      description:
        'Índice de correção dos ativos do fundo (IPCA, CDI, IGP-M, prefixado). Define como os rendimentos se comportam em diferentes cenários de inflação e juros.',
      ideal:
        'IPCA protege contra inflação; CDI é favorável em ambiente de juros altos. Boa mistura reduz o risco.',
    },
  },
  {
    type: 'text',
    key: 'paperSegments',
    label: 'Segmentos',
    inputPlaceholder: 'Ex: Residencial, Logística, Shoppings',
    tooltip: {
      title: 'Segmentos dos Recebíveis',
      description:
        'Setores imobiliários aos quais os CRIs/CRAs da carteira estão expostos (residencial, logístico, corporativo, shopping, agro). Diversificação reduz o risco setorial.',
      ideal: 'Exposição a múltiplos segmentos com preponderância em setores resilientes.',
    },
  },
  {
    type: 'text',
    key: 'debtorConcentration',
    label: 'Concentração de Devedores',
    inputPlaceholder: 'Ex: Top 5 devedores = 40% da carteira',
    tooltip: {
      title: 'Concentração de Devedores',
      description:
        'Percentual da carteira concentrado nos maiores devedores. Alta concentração em poucos emissores aumenta o risco de crédito — um calote pode impactar fortemente os rendimentos.',
      ideal: 'Nenhum devedor representando mais de 15–20% da carteira.',
    },
  },
  {
    type: 'number',
    key: 'spread',
    label: 'Spread Médio',
    format: directPct,
    trendType: 'up-good',
    inputStep: '0.01',
    inputLabel: 'Spread em % (ex: 8)',
    tooltip: {
      title: 'Spread Médio',
      description:
        'Taxa adicional paga pelos CRIs/CRAs acima do indexador (ex: IPCA + 7% → spread de 7%). Representa o prêmio pelo risco de crédito assumido.',
      ideal: 'Acima de 6–7% a.a. acima do IPCA é considerado atrativo com risco controlado.',
      calc: 'Taxa total do ativo − taxa do indexador de referência',
    },
  },
  {
    type: 'number',
    key: 'ltv',
    label: 'LTV',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'LTV em % (ex: 60)',
    tooltip: {
      title: 'LTV = Loan-to-Value',
      description:
        'Relação entre o valor do empréstimo (CRI/CRA) e o valor do imóvel dado em garantia. Quanto menor, maior a margem de segurança para o fundo em caso de execução da garantia.',
      ideal: 'Abaixo de 65% é conservador e oferece boa proteção ao credor.',
      calc: 'Valor total do CRI ÷ valor de avaliação do imóvel em garantia × 100',
    },
  },
  {
    type: 'number',
    key: 'defaultRate',
    label: 'Inadimplência',
    format: directPct,
    trendType: 'up-bad',
    inputStep: '0.01',
    inputLabel: 'Inadimplência em % (ex: 2)',
    tooltip: {
      title: 'Taxa de Inadimplência',
      description:
        'Percentual dos CRIs/CRAs com pagamentos em atraso ou em default. Inadimplência elevada reduz diretamente os rendimentos distribuídos e pode exigir provisões.',
      ideal: 'Abaixo de 2% é saudável. Acima de 5% é sinal de alerta relevante.',
      calc: 'Valor em atraso ou default ÷ carteira total × 100',
    },
  },
]

export const FII_INFO_FIELDS: {
  key: keyof Omit<FiiInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
}[] = [
  {
    key: 'longName',
    label: 'Nome do Fundo',
    placeholder: 'Ex: XP Malls Fundo de Investimento Imobiliário',
  },
  { key: 'cnpj', label: 'CNPJ', placeholder: 'Ex: 28.757.546/0001-00' },
  { key: 'startDate', label: 'Início do Fundo', placeholder: 'Ex: 2012-05-17 ou 17/05/2012' },
  {
    key: 'segment',
    label: 'Segmento',
    placeholder: 'Ex: Shoppings, Lajes Corporativas, Logística...',
  },
  { key: 'marketCap', label: 'Valor de Mercado', placeholder: 'Ex: R$ 2,4 bi' },
  {
    key: 'adminName',
    label: 'Administradora / Gestora',
    placeholder: 'Ex: BTG Pactual (adm.) / XP Asset (gestora)',
  },
  { key: 'adminFee', label: 'Taxa de Administração', placeholder: 'Ex: 0,85% a.a.' },
  {
    key: 'performanceFee',
    label: 'Taxa de Performance',
    placeholder: 'Ex: 20% sobre IPCA+6% ou Não há',
  },
]

export const STOCK_INFO_FIELDS: {
  key: keyof Omit<StockInfo, 'ticker' | 'updatedAt'>
  label: string
  placeholder: string
  multiline?: boolean
}[] = [
  { key: 'companyName', label: 'Nome da Empresa', placeholder: 'Ex: Itaú Unibanco Holding S.A.' },
  { key: 'sector', label: 'Setor', placeholder: 'Ex: Financeiro' },
  { key: 'subsector', label: 'Subsetor / Segmento', placeholder: 'Ex: Bancos / Large Caps' },
  {
    key: 'about',
    label: 'Sobre a Empresa',
    placeholder: 'Mini descrição da empresa e modelo de negócio...',
    multiline: true,
  },
  { key: 'foundedYear', label: 'Fundação', placeholder: 'Ex: 1945' },
  { key: 'ipoYear', label: 'IPO', placeholder: 'Ex: 2002' },
  { key: 'marketCap', label: 'Valor de Mercado', placeholder: 'Ex: R$ 280 bi' },
  {
    key: 'governanceLevel',
    label: 'Governança',
    placeholder: 'Ex: Novo Mercado, Nível 2, Nível 1',
  },
  { key: 'controller', label: 'Controlador', placeholder: 'Ex: Família Villela / Itaúsa' },
  {
    key: 'geographicExposure',
    label: 'Exposição Geográfica',
    placeholder: 'Ex: Brasil 85%, América Latina 15%',
  },
  { key: 'tagAlong', label: 'Tag Along', placeholder: 'Ex: 100%' },
]

export const VERDICT_MAP: Record<string, { label: string; className: string }> = {
  bullish: {
    label: 'Otimista',
    className: 'bg-success/10 text-success border-success/20',
  },
  neutro: {
    label: 'Neutro',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  bearish: {
    label: 'Pessimista',
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
}
