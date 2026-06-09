import type { FiiIndicatorDef } from './types'
import { directPct, ratio, higherBetter, lowerBetter } from './utils'

export const FII_COMMON: FiiIndicatorDef[] = [
  {
    type: 'number',
    key: 'dividendYield',
    label: 'DY',
    format: directPct,
    trendType: 'up-good',
    rating: higherBetter(8, 6),
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
    rating: lowerBetter(1.05, 1.2),
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
    rating: lowerBetter(0.3, 0.5),
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
    rating: lowerBetter(5, 10),
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
    rating: lowerBetter(5, 10),
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
    type: 'number',
    key: 'occupancyCost',
    label: 'Custo de Ocupação',
    format: directPct,
    trendType: 'up-bad',
    rating: lowerBetter(13, 18),
    inputStep: '0.01',
    inputLabel: 'Custo de ocupação em % (ex: 11.5)',
    tooltip: {
      title: 'Custo de Ocupação (para FIIs de Shopping)',
      description:
        'Quanto o lojista gasta com aluguel + condomínio + fundo de promoção em relação às suas vendas. Custo alto demais sufoca o lojista e aumenta o risco de inadimplência e devolução de lojas.',
      ideal:
        'Saudável em torno de 8% a 13%. Acima disso pressiona os lojistas — quanto menor, melhor.',
      calc: '(Aluguel + condomínio + fundo de promoção) ÷ vendas dos lojistas × 100',
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
    rating: higherBetter(7, 5),
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
    rating: lowerBetter(65, 75),
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
    rating: lowerBetter(2, 5),
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
