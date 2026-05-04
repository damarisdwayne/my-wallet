import { useRef, useState } from 'react'
import { BookmarkCheck, BrainCircuit, FileText, Upload } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { analyzeDocument } from '@/services/gemini'
import { extractDocumentType, extractReportDate, saveAiAnalysis } from '@/services/ai-analyses'
import { useAuth } from '@/store/auth'
import { AiMarkdown } from './ai-analysis'
import { MarketIntelligence } from './market-intelligence'

export const AiSheet = ({ ticker, isFii }: { ticker: string; isFii: boolean }) => {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSaving, setAiSaving] = useState(false)

  const handleSave = async () => {
    if (!user || !aiAnalysis) return
    setAiSaving(true)
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
    setAiSaving(false)
    setAiAnalysis(null)
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
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setAiAnalysis(await analyzeDocument(base64, isFii ? 'fii' : 'stock'))
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setAiError(msg.includes('429') ? 'Cota da API excedida. Tente novamente.' : `Erro: ${msg}`)
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

      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
            <BrainCircuit size={15} className="text-primary/70" />
            {ticker} · Análise por IA
          </SheetTitle>
          <SheetDescription className="text-xs">
            Resumo de mercado via Google + análise de documentos com Gemini
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 mt-4">
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
                <AiMarkdown text={aiAnalysis} />
                <div className="pt-2 border-t border-border flex justify-end">
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
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-lg border border-dashed border-border p-5 text-center hover:border-primary/40 hover:bg-muted/20 transition-colors group"
              >
                <FileText
                  size={18}
                  className="mx-auto mb-2 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors"
                />
                <p className="text-xs text-muted-foreground">
                  {isFii ? 'Envie o PDF do relatório gerencial' : 'Envie o PDF do relatório de RI'}
                </p>
                <p className="text-[11px] text-muted-foreground/40 mt-0.5">Powered by Gemini</p>
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
