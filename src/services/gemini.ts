import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY ?? '')

// Friendly, typed wrapper around Gemini SDK failures so every call site can just
// surface `err.message` to the user instead of leaking raw API noise.
export class GeminiError extends Error {
  status: number | null
  constructor(message: string, status: number | null, options?: { cause?: unknown }) {
    super(message, options)
    this.name = 'GeminiError'
    this.status = status
  }
}

// SDK messages look like "[GoogleGenerativeAI Error]: ... [403 ] ..." — pull the HTTP status.
const statusFromError = (raw: string): number | null => {
  const match = /\[(\d{3})[\s\]]/.exec(raw)
  return match ? Number(match[1]) : null
}

const friendlyMessage = (raw: string, status: number | null): string => {
  if (status === 403 || /dunning|billing|permission_denied|service_disabled/i.test(raw))
    return 'IA indisponível: há um problema de faturamento na conta do Gemini. Regularize o pagamento no Google Cloud ou configure uma nova chave de API.'
  if (status === 429 || /quota|rate limit|resource_exhausted/i.test(raw))
    return 'Cota da IA excedida. Tente novamente em alguns minutos.'
  if (status === 401 || /api key not valid|api_key_invalid|invalid api key/i.test(raw))
    return 'Chave da API do Gemini inválida ou ausente. Verifique a configuração.'
  if (/failed to fetch|networkerror|network request failed/i.test(raw))
    return 'Falha de conexão com a IA. Verifique sua internet e tente novamente.'
  return 'Erro ao consultar a IA. Tente novamente.'
}

const toGeminiError = (err: unknown): GeminiError => {
  if (err instanceof GeminiError) return err
  const raw = err instanceof Error ? err.message : String(err)
  const status = statusFromError(raw)
  return new GeminiError(friendlyMessage(raw, status), status, { cause: err })
}

// Runs a Gemini call and normalizes any failure into a GeminiError with a user-facing message.
const guard = async <T>(fn: () => Promise<T>): Promise<T> => {
  try {
    return await fn()
  } catch (err) {
    throw toGeminiError(err)
  }
}

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

const ASSISTANT_SYSTEM_PROMPT = (context: string) =>
  `Você é um assistente pessoal de investimentos integrado ao app de carteira do usuário.
Você tem acesso aos dados reais da carteira abaixo. Use-os para responder perguntas específicas sobre a carteira do usuário.
Para perguntas gerais sobre investimentos, responda com base no seu conhecimento.

DADOS DA CARTEIRA:
${context}

Regras:
- Responda sempre em português
- Seja objetivo e direto
- Use os dados reais da carteira quando relevante
- Não invente dados que não estão no contexto
- Formate valores em R$ quando falar de dinheiro`

export const chatWithAssistant = async (
  message: string,
  history: ChatMessage[],
  portfolioContext: string,
): Promise<string> =>
  guard(async () => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: ASSISTANT_SYSTEM_PROMPT(portfolioContext) }],
        },
        {
          role: 'model',
          parts: [
            { text: 'Entendido! Estou pronto para ajudar com sua carteira de investimentos.' },
          ],
        },
        ...history.map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        })),
      ],
    })

    const result = await chat.sendMessage(message)
    return result.response.text()
  })

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
Identifique o tipo do FII (Tijolo, Papel, Híbrido, FOF etc.) a partir do documento.

Liste OBRIGATORIAMENTE cada indicador abaixo, um por linha, exatamente no formato \`**Rótulo:** valor\` (use o rótulo exato indicado).
- Se o documento trouxer o valor, use-o.
- Se o documento trouxer apenas os insumos, CALCULE o derivado (ex: P/VP = cota de mercado ÷ valor patrimonial por cota; DY = soma dos rendimentos dos últimos 12 meses ÷ preço da cota × 100). Ao calcular, acrescente "(calculado)" após o valor.
- Se não encontrar nem puder calcular, escreva exatamente \`não informado\` como valor (não omita a linha).

Comuns a todos os FIIs (sempre liste os 4): **DY:**, **P/VP:**, **Alavancagem (Dívida/PL):**, **Concentração de Receita:**.

Se for FII de Tijolo (shoppings, lajes, galpões, residencial etc.), liste também: **Vacância Física:**, **Vacância Financeira:**, **Qtd. Imóveis:**, **Qualidade dos Imóveis:**, **NOI/m²:**, **Vendas/m²:**, **Custo de Ocupação:**, **Operadores:**, **Qtd. Inquilinos:**, **Diversificação por Região:**, **Contratos de Aluguel:**, **Prazo Médio dos Contratos:**.

Se for FII de Papel (CRI, CRA, recebíveis), liste também: **Qualidade do Crédito:**, **Tipo de Indexação:**, **Segmentos:**, **Concentração de Devedores:**, **Spread Médio:**, **LTV:**, **Inadimplência:**.

Depois das linhas obrigatórias, acrescente em linhas extras quaisquer outros números relevantes do relatório (distribuição por cota, patrimônio líquido, valor de mercado, ABL etc.).

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
Liste OBRIGATORIAMENTE cada indicador abaixo, um por linha, exatamente no formato \`**Rótulo:** valor\` (use o rótulo exato indicado).
- Se o documento trouxer o valor, use-o.
- Se o documento trouxer apenas os insumos, CALCULE o derivado (ex: Margem Líquida = lucro líquido ÷ receita líquida × 100; Dívida Líquida/EBITDA = (dívida bruta − caixa) ÷ EBITDA). Ao calcular, acrescente "(calculado)" após o valor.
- Se não encontrar nem puder calcular, escreva exatamente \`não informado\` como valor (não omita a linha).

Liste sempre os 19: **P/L:**, **P/VP:**, **EV/EBITDA:**, **PEG Ratio:**, **DY:**, **Payout:**, **Margem Líquida:**, **Margem Bruta:**, **Margem EBITDA:**, **ROE:**, **ROIC:**, **ROA:**, **Dívida/PL:**, **Dívida Líquida/EBITDA:**, **FCF:**, **FCF Yield:**, **Conversão de Caixa:**, **Crescimento de Receita:**, **Crescimento de Lucro:**.

Depois das linhas obrigatórias, acrescente em linhas extras quaisquer outros números relevantes (guidance, receita absoluta, lucro líquido, EBITDA absoluto etc.).

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
): Promise<string> =>
  guard(async () => {
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
  })

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

export const compareAnalyses = async (older: string, newer: string): Promise<ComparisonResult> =>
  guard(async () => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const result = await model.generateContent(COMPARISON_PROMPT(older, newer))
    return { text: result.response.text() }
  })

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
): Promise<RecentCommunicationsResult> =>
  guard(async () => {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      // @ts-expect-error — google_search is valid but not yet typed in 0.24.x
      tools: [{ google_search: {} }],
    })

    const result = await model.generateContent(COMMUNICATIONS_PROMPT(ticker, type))
    const text = result.response.text()
    return { items: parseCommunications(text) }
  })

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
): Promise<MarketIntelligenceResult> =>
  guard(async () => {
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
  })
