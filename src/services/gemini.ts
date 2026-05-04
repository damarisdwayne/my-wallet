import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY ?? '')

const FII_PROMPT = `Você é um analista especializado em Fundos de Investimento Imobiliário (FIIs) brasileiros.
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

**5. Avaliação Geral**
Otimista / Neutro / Pessimista — com justificativa em 2 linhas.

Seja objetivo, técnico e direto. Use marcadores quando aplicável.`

const RI_PROMPT = `Você é um analista fundamentalista especializado em ações brasileiras.
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

**5. Avaliação Geral**
Otimista / Neutro / Pessimista — com justificativa em 2 linhas.

Seja objetivo, técnico e direto. Use marcadores quando aplicável.`

export const analyzeDocument = async (
  pdfBase64: string,
  type: 'fii' | 'stock',
): Promise<string> => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
  const result = await model.generateContent([
    { inlineData: { data: pdfBase64, mimeType: 'application/pdf' } },
    type === 'fii' ? FII_PROMPT : RI_PROMPT,
  ])
  return result.response.text()
}
