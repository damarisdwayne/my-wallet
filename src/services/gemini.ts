import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY ?? '')

const FII_PROMPT = (ticker: string) =>
  `Você é um analista especializado em Fundos de Investimento Imobiliário (FIIs) brasileiros.
Analise o relatório gerencial a seguir e forneça uma análise estruturada.

Comece SEMPRE com estas duas linhas (extraia do documento):
**Data do Relatório:** MM/AAAA
**Tipo de Documento:** Relatório Gerencial | Informe Mensal | Fato Relevante | Laudo de Avaliação | Outro

Depois responda os tópicos:

**1. Resumo Executivo**
3 a 5 pontos principais do período.

**2. Destaques Positivos**
Pontos favoráveis: ocupação, distribuição, aquisições, contratos, etc.

**3. Pontos de Atenção**
Riscos, vacância elevada, inadimplência, vencimentos de contratos, etc.

**4. Principais Indicadores Mencionados**
Identifique o tipo do FII (Tijolo, Papel, Híbrido, FOF etc.) a partir do documento e liste apenas os indicadores pertinentes ao tipo identificado, além de qualquer outro número relevante encontrado.

Indicadores comuns a todos os FIIs (liste se mencionados): DY, P/VP, Alavancagem (Dívida/PL), Concentração de Receita, distribuição por cota, patrimônio líquido, valor de mercado.

Se for FII de Tijolo (shoppings, lajes, galpões, residencial etc.), priorize: Vacância Física, Vacância Financeira, NOI/m², Vendas/m², Qtd. Imóveis, Qualidade dos Imóveis, Qtd. Inquilinos, Diversificação por Região, Tipo de Contratos, Prazo Médio dos Contratos, Operadores, ABL.

Se for FII de Papel (CRI, CRA, recebíveis), priorize: Qualidade do Crédito, Tipo de Indexação, Segmentos dos Recebíveis, Concentração de Devedores, Spread Médio, LTV, Inadimplência.

Acrescente outros indicadores relevantes que encontrar no relatório, independentemente do tipo.

**5. Comentários do Mercado**
Pesquise na web o que o mercado esperava para ${ticker} no período deste relatório.
- O resultado veio acima, abaixo ou em linha com as expectativas? (ex: distribuição acima/abaixo do esperado)
- Destaque 1-2 reações de analistas ou casas de análise se encontrar.
- Se não encontrar informações confiáveis, escreva "Sem dados de consenso disponíveis."

**6. Avaliação Geral**
Otimista / Neutro / Pessimista — com justificativa em 2 linhas.

Seja objetivo, técnico e direto. Use marcadores quando aplicável.`

const RI_PROMPT = (ticker: string) =>
  `Você é um analista fundamentalista especializado em ações brasileiras.
Analise o relatório de RI (Relações com Investidores) a seguir e forneça uma análise estruturada.

Comece SEMPRE com estas duas linhas (extraia do documento):
**Data do Relatório:** MM/AAAA
**Tipo de Documento:** DFP | ITR | Release de Resultados | Fato Relevante | FRE | Outro

Depois responda os tópicos:

**1. Resumo Executivo**
3 a 5 pontos principais do período.

**2. Destaques Operacionais e Financeiros**
Receita, lucro, margens, EBITDA, fluxo de caixa — com variações em relação ao período anterior.

**3. Pontos de Atenção**
Endividamento, margens sob pressão, perda de clientes, riscos regulatórios, etc.

**4. Principais Indicadores Mencionados**
Priorize os indicadores abaixo (se mencionados no documento) e acrescente qualquer outro número relevante que encontrar:

Valuation: P/L, P/VP, EV/EBITDA, PEG Ratio.
Dividendos: DY (Dividend Yield), Payout.
Margens: Margem Líquida, Margem Bruta, Margem EBITDA.
Retorno: ROE, ROIC, ROA.
Endividamento: Dívida/PL, Dívida Líquida/EBITDA.
Caixa: FCF (Fluxo de Caixa Livre), FCF Yield, Conversão de Caixa.
Crescimento: Crescimento de Receita (%), Crescimento de Lucro (%).
Outros relevantes encontrados no relatório (guidance, receita absoluta, lucro líquido, EBITDA absoluto, etc.).

**5. Comentários do Mercado**
Pesquise na web o que o mercado esperava para ${ticker} no período deste relatório.
- O resultado veio acima, abaixo ou em linha com o consenso de analistas? (ex: lucro acima/abaixo do esperado pelo Bloomberg/Reuters/casas de análise)
- Destaque 1-2 reações de analistas ou casas de análise se encontrar.
- Se não encontrar informações confiáveis, escreva "Sem dados de consenso disponíveis."

**6. Avaliação Geral**
Otimista / Neutro / Pessimista — com justificativa em 2 linhas.

Seja objetivo, técnico e direto. Use marcadores quando aplicável.`

export const analyzeDocument = async (
  pdfBase64: string,
  type: 'fii' | 'stock',
  ticker: string,
): Promise<string> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // @ts-expect-error — google_search is valid but not yet typed in 0.24.x
    tools: [{ google_search: {} }],
  })
  const result = await model.generateContent([
    { inlineData: { data: pdfBase64, mimeType: 'application/pdf' } },
    type === 'fii' ? FII_PROMPT(ticker) : RI_PROMPT(ticker),
  ])
  return result.response.text()
}

export interface ComparisonResult {
  text: string
}

const COMPARISON_PROMPT = (a: string, b: string) =>
  `Você é um analista fundamentalista. Compare as duas análises de documentos abaixo do mesmo ativo e responda de forma estruturada.

ANÁLISE MAIS ANTIGA:
${a}

ANÁLISE MAIS RECENTE:
${b}

Responda EXATAMENTE neste formato:

**Melhorou**
Liste em bullets o que evoluiu positivamente entre os dois períodos.

**Piorou**
Liste em bullets o que regrediu ou apresentou piora.

**Estável**
Liste em bullets o que se manteve sem mudança relevante.

**Tendência Geral**
Melhorando / Piorando / Estável — com justificativa em 1-2 linhas.

Seja objetivo e direto. Foque em fatos dos documentos, não em opiniões.`

export const compareAnalyses = async (older: string, newer: string): Promise<ComparisonResult> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent(COMPARISON_PROMPT(older, newer))
  return { text: result.response.text() }
}

export interface CommunicationItem {
  type: string
  date: string
  summary: string
}

export interface RecentCommunicationsResult {
  items: CommunicationItem[]
}

const COMMUNICATIONS_PROMPT = (ticker: string, type: 'fii' | 'stock') => {
  const importantDocs =
    type === 'fii'
      ? 'Relatório Gerencial e Fato Relevante'
      : 'Release de Resultados, DFP, ITR e Fato Relevante'

  return `Pesquise os documentos mais recentes e importantes do ${type === 'fii' ? 'FII' : 'ação'} ${ticker} na bolsa brasileira (B3).

Retorne APENAS os documentos desta lista: ${importantDocs}.
Ignore: Comunicados ao Mercado genéricos, Avisos aos Cotistas de rotina (distribuição mensal padrão), Atas de assembleia sem pauta relevante, Prospectos.

Responda EXATAMENTE neste formato para cada documento encontrado (máximo 5):

TIPO: [nome do tipo de documento]
DATA: [data no formato DD/MM/AAAA]
RESUMO: [1-2 frases objetivas sobre o conteúdo]
---

Não invente informações. Use apenas o que encontrar nas buscas.`
}

const parseCommunications = (text: string): CommunicationItem[] => {
  const blocks = text
    .split('---')
    .map((b) => b.trim())
    .filter(Boolean)
  return blocks.flatMap((block) => {
    const get = (key: string) => {
      const match = new RegExp(String.raw`${key}:\s*(.+)`).exec(block)
      return match ? match[1].trim() : ''
    }
    const type = get('TIPO')
    const date = get('DATA')
    const summary = get('RESUMO')
    if (!type || !summary) return []
    return [{ type, date, summary }]
  })
}

export const fetchRecentCommunications = async (
  ticker: string,
  type: 'fii' | 'stock',
): Promise<RecentCommunicationsResult> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // @ts-expect-error — google_search is valid but not yet typed in 0.24.x
    tools: [{ google_search: {} }],
  })

  const result = await model.generateContent(COMMUNICATIONS_PROMPT(ticker, type))
  const text = result.response.text()
  return { items: parseCommunications(text) }
}

export interface MarketIntelligenceSection {
  title: string
  content: string
  highlight?: boolean
}

export interface MarketIntelligenceResult {
  sections: MarketIntelligenceSection[]
  fetchedAt: string
}

const MARKET_INTELLIGENCE_PROMPT = (ticker: string, type: 'fii' | 'stock') => {
  const isFii = type === 'fii'
  const focus = isFii
    ? 'distribuição por cota, vacância, aquisições ou desinvestimentos, gestão, emissão de cotas, desempenho vs expectativas do mercado'
    : 'resultado trimestral/anual (lucro, receita, margens vs expectativas), guidance, planos de expansão, M&A, mudanças na gestão, visão de analistas, dividendos'

  return `Você é um analista de investimentos experiente. Pesquise as informações mais atuais e relevantes sobre ${isFii ? 'o FII' : 'a ação'} ${ticker} na bolsa brasileira (B3).

Foque em: ${focus}.

Responda EXATAMENTE neste formato (não omita nenhuma seção, escreva "Sem informações recentes." se não encontrar):

DESTAQUE: [O ponto mais crítico que o investidor precisa saber AGORA — 1 frase direta]
RESULTADOS: [Últimos resultados financeiros — lucro/distribuição vs período anterior e vs expectativas do mercado]
PERSPECTIVAS: [Guidance, planos, expansões ou mudanças estratégicas divulgadas]
MERCADO: [Visão de analistas, recomendações recentes, preço-alvo se disponível]
RISCOS: [Principais riscos ou pontos de atenção no momento]
---

Use apenas informações verificadas. Seja direto e objetivo.`
}

const parseMarketIntelligence = (text: string): MarketIntelligenceSection[] => {
  const MAP: { key: string; title: string; highlight?: boolean }[] = [
    { key: 'DESTAQUE', title: 'Destaque', highlight: true },
    { key: 'RESULTADOS', title: 'Resultados' },
    { key: 'PERSPECTIVAS', title: 'Perspectivas' },
    { key: 'MERCADO', title: 'Visão do Mercado' },
    { key: 'RISCOS', title: 'Riscos' },
  ]

  return MAP.flatMap(({ key, title, highlight }) => {
    const match = new RegExp(String.raw`${key}:\s*([^\n]+(?:\n(?![A-Z]{3,}:)[^\n]+)*)`).exec(text)
    const content = match ? match[1].trim() : ''
    if (!content || content === 'Sem informações recentes.') return []
    return [{ title, content, highlight }]
  })
}

export const fetchMarketIntelligence = async (
  ticker: string,
  type: 'fii' | 'stock',
): Promise<MarketIntelligenceResult> => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    // @ts-expect-error — google_search is valid but not yet typed in 0.24.x
    tools: [{ google_search: {} }],
  })

  const result = await model.generateContent(MARKET_INTELLIGENCE_PROMPT(ticker, type))
  const text = result.response.text()
  return {
    sections: parseMarketIntelligence(text),
    fetchedAt: new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }
}
