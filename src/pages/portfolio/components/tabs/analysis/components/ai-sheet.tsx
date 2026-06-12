import { useRef, useState } from 'react'
import { BookmarkCheck, BrainCircuit, FileText, GitCompareArrows, Upload } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { analyzeDocument, compareAnalyses } from '@/services/gemini'
import { extractDocumentType, extractReportDate, saveAiAnalysis } from '@/services/ai-analyses'
import {
  fetchInvestidor10FiiIndicators,
  fetchInvestidor10StockIndicators,
} from '@/services/investidor10'
import { useAuth } from '@/store/auth'
import type { AiAnalysis, FundamentalSnapshot } from '@/types'
import { fmtDate } from '../utils'
import {
  buildSnapshotPartial,
  mergeI10IntoAnalysis,
  parseAnalysisIndicators,
} from '../parse-indicators'
import { AiMarkdown } from './ai-markdown'
import { MarketIntelligence } from './market-intelligence'

const getRecommendedDoc = (
  isFii: boolean,
  sector?: string,
  subsector?: string,
): { doc: string; reason: string } | null => {
  if (isFii) return { doc: 'Relatório Gerencial', reason: 'toda a gestão do fundo está aqui' }
  if (!sector && !subsector) return null
  const s = (sector ?? '').toLowerCase()
  const sub = (subsector ?? '').toLowerCase()
  // PT: "Utilidade Pública" / EN: "Utilities"
  // PT sub: "Saneamento", "Energia Elétrica", "Gás" / EN sub: "Water Utilities", "Electric Utilities", "Gas Utilities"
  if (
    s.includes('utilidade') ||
    s.includes('utilities') ||
    sub.includes('saneamento') ||
    sub.includes('energia') ||
    sub.includes('gás') ||
    sub.includes('gas') ||
    sub.includes('electric') ||
    sub.includes('water utili')
  )
    return {
      doc: 'Relatório da Administração',
      reason: 'empresa regulada — tarifas e concessão definem o lucro',
    }
  // PT: "Holding" / EN: "Conglomerates", "Asset Management & Custody Banks"
  if (sub.includes('holding') || s.includes('holding') || sub.includes('conglomerate'))
    return { doc: 'Demonstrações Contábeis', reason: 'o valor vem das participações' }
  return { doc: 'Release de Resultados', reason: 'resumo executivo dos números do trimestre' }
}

export const AiSheet = ({
  ticker,
  previousTickers,
  isFii,
  sector,
  subsector,
  lastAnalysis,
  onSaveSnapshot,
}: {
  ticker: string
  previousTickers?: string[]
  isFii: boolean
  sector?: string
  subsector?: string
  lastAnalysis: AiAnalysis | null
  onSaveSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
}) => {
  const { user } = useAuth()
  const recommendation = getRecommendedDoc(isFii, sector, subsector)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSaving, setAiSaving] = useState(false)
  const [compareText, setCompareText] = useState<string | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareError, setCompareError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [edits, setEdits] = useState<Record<string, string>>({})

  const resetCompare = () => {
    setCompareText(null)
    setCompareError(null)
  }

  const resetEdits = () => {
    setEditing(false)
    setEdits({})
  }

  const handleSave = async () => {
    if (!user || !aiAnalysis) return
    setAiSaving(true)
    try {
      // Persist the structured indicators (AI-extracted + the user's inline corrections) as a
      // monthly snapshot, then save the narrative analysis itself.
      const partial = buildSnapshotPartial(parseAnalysisIndicators(aiAnalysis, isFii), edits)
      if (Object.keys(partial).length > 0) await onSaveSnapshot(ticker, partial)

      const reportDate = extractReportDate(aiAnalysis)
      const documentType = extractDocumentType(aiAnalysis)
      await saveAiAnalysis(
        user.uid,
        ticker,
        isFii ? 'fii' : 'stock',
        aiAnalysis,
        reportDate,
        documentType,
      )
      setAiAnalysis(null)
      resetCompare()
      resetEdits()
    } finally {
      setAiSaving(false)
    }
  }

  const handleCompare = async () => {
    if (!aiAnalysis || !lastAnalysis) return
    setCompareLoading(true)
    setCompareError(null)
    setCompareText(null)
    try {
      // lastAnalysis is the older (saved) one; the freshly generated analysis is the newer.
      const result = await compareAnalyses(lastAnalysis.text, aiAnalysis)
      setCompareText(result.text)
    } catch (err) {
      setCompareError(
        err instanceof Error ? err.message : 'Erro ao comparar análises. Tente novamente.',
      )
    } finally {
      setCompareLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setAiError('Envie um arquivo PDF.')
      return
    }
    setAiLoading(true)
    setAiError(null)
    setAiAnalysis(null)
    resetCompare()
    resetEdits()
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      // Gera a análise do documento e complementa com os indicadores do Investidor 10 os campos
      // que a IA marcou como "não informado" (múltiplos de mercado: P/L, P/VP, Payout, DY...).
      const analysis = await analyzeDocument(base64, isFii ? 'fii' : 'stock', ticker)
      const i10 = await (isFii
        ? fetchInvestidor10FiiIndicators(ticker, previousTickers ?? [])
        : fetchInvestidor10StockIndicators(ticker, previousTickers ?? []))
      setAiAnalysis(mergeI10IntoAnalysis(analysis, i10, isFii))
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'Erro ao consultar a IA. Tente novamente.')
    } finally {
      setAiLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
          <BrainCircuit size={13} className="text-primary/70" />
          IA
        </button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl flex flex-col overflow-y-auto p-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      >
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <BrainCircuit size={15} className="text-primary/70" />
            {ticker} · Análise por IA
          </SheetTitle>
          <SheetDescription className="text-xs">
            Resumo de mercado via Google + análise de documentos com Gemini
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 mt-4 px-6 pb-6">
          {/* Market Intelligence */}
          <MarketIntelligence ticker={ticker} type={isFii ? 'fii' : 'stock'} />

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Document analysis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Analisar documento
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={aiLoading}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
              >
                <Upload size={11} />
                {aiLoading
                  ? 'Analisando...'
                  : aiAnalysis
                    ? 'Novo PDF'
                    : isFii
                      ? 'Enviar relatório'
                      : 'Enviar RI'}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {aiLoading && (
              <div className="rounded-lg border border-border p-4 space-y-2.5 animate-pulse">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary/30" />
                  <div className="h-2.5 w-32 rounded bg-muted" />
                </div>
                {['w-[60%]', 'w-[85%]', 'w-[70%]', 'w-[90%]', 'w-[65%]'].map((w) => (
                  <div key={w} className={`h-2 rounded bg-muted ${w}`} />
                ))}
              </div>
            )}

            {aiError && !aiLoading && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
                <p className="text-xs text-destructive">{aiError}</p>
              </div>
            )}

            {aiAnalysis && !aiLoading && (
              <div className="rounded-lg border border-border p-4 space-y-4">
                <AiMarkdown
                  text={aiAnalysis}
                  indicatorEdit={{
                    editing,
                    values: edits,
                    onToggle: () => setEditing((v) => !v),
                    onChange: (label, value) => setEdits((p) => ({ ...p, [label]: value })),
                  }}
                />

                {(compareLoading || compareText || compareError) && (
                  <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                    <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                      <GitCompareArrows size={12} className="text-primary/70" />
                      Comparação com {fmtDate(lastAnalysis?.analyzedAt ?? '')}
                    </p>
                    {compareLoading && (
                      <div className="space-y-2 animate-pulse">
                        {['w-[70%]', 'w-[85%]', 'w-[60%]'].map((w) => (
                          <div key={w} className={`h-2 rounded bg-muted ${w}`} />
                        ))}
                      </div>
                    )}
                    {compareError && !compareLoading && (
                      <p className="text-xs text-destructive">{compareError}</p>
                    )}
                    {compareText && !compareLoading && <AiMarkdown text={compareText} />}
                  </div>
                )}

                <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                  {lastAnalysis && !compareText ? (
                    <button
                      onClick={handleCompare}
                      disabled={compareLoading}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                    >
                      <GitCompareArrows size={12} />
                      {compareLoading
                        ? 'Comparando...'
                        : `Comparar com a última (${fmtDate(lastAnalysis.analyzedAt)})`}
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={handleSave}
                    disabled={aiSaving}
                    className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    <BookmarkCheck size={12} />
                    {aiSaving ? 'Salvando...' : 'Salvar análise'}
                  </button>
                </div>
              </div>
            )}

            {!aiAnalysis && !aiLoading && !aiError && (
              <div className="space-y-2">
                {recommendation && (
                  <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5 space-y-0.5">
                    <p className="text-[11px] text-primary/70 font-medium uppercase tracking-wide">
                      Documento recomendado
                    </p>
                    <p className="text-xs font-semibold text-foreground">{recommendation.doc}</p>
                    <p className="text-[11px] text-muted-foreground">{recommendation.reason}</p>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-lg border border-dashed border-border p-5 text-center hover:border-primary/40 hover:bg-muted/20 transition-colors group"
                >
                  <FileText
                    size={18}
                    className="mx-auto mb-2 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground">
                    {isFii
                      ? 'Envie o PDF do relatório gerencial'
                      : 'Envie o PDF do relatório de RI'}
                  </p>
                  <p className="text-[11px] text-muted-foreground/40 mt-0.5">Powered by Gemini</p>
                </button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
