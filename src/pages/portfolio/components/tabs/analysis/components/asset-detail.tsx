import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, BookmarkCheck, FileText, Plus, Sparkles, Upload } from 'lucide-react'
import { analyzeDocument } from '@/services/gemini'
import { extractReportDate, saveAiAnalysis, subscribeToAiAnalyses } from '@/services/ai-analyses'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import type {
  AiAnalysis,
  Asset,
  FiiInfo,
  FundamentalRecord,
  FundamentalSnapshot,
  StockInfo,
} from '@/types'
import { FII_COMMON, FII_PAPEL, FII_TIJOLO, STOCK_INDICATORS } from '../constants'
import { AiHistorySection, AiMarkdown } from './ai-analysis'
import { FiiInfoDialog, FiiInfoSection } from './fii-info'
import { IndicatorCard } from './indicator-card'
import { ManualSnapshotDialog } from './snapshot-form'
import { StockInfoDialog, StockInfoSection } from './stock-info'
import { TextIndicatorCard } from './text-indicator-card'

export const AssetDetailView = ({
  asset,
  record,
  isFii,
  fiiInfoData,
  stockInfoData,
  onBack,
  onSaveSnapshot,
  onSaveFiiInfo,
  onSaveStockInfo,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  isFii: boolean
  fiiInfoData: FiiInfo | undefined
  stockInfoData: StockInfo | undefined
  onBack: () => void
  onSaveSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  onSaveFiiInfo: (data: FiiInfo) => Promise<void>
  onSaveStockInfo: (data: StockInfo) => Promise<void>
}) => {
  const { user } = useAuth()
  const [registerOpen, setRegisterOpen] = useState(false)
  const [fiiInfoOpen, setFiiInfoOpen] = useState(false)
  const [stockInfoOpen, setStockInfoOpen] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiSaving, setAiSaving] = useState(false)
  const [aiHistory, setAiHistory] = useState<AiAnalysis[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!user) return
    return subscribeToAiAnalyses(user.uid, asset.ticker, setAiHistory)
  }, [user, asset.ticker])

  const handleSaveAnalysis = async () => {
    if (!user || !aiAnalysis) return
    setAiSaving(true)
    const reportDate = extractReportDate(aiAnalysis)
    await saveAiAnalysis(user.uid, asset.ticker, isFii ? 'fii' : 'stock', aiAnalysis, reportDate)
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
      const result = await analyzeDocument(base64, isFii ? 'fii' : 'stock')
      setAiAnalysis(result)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setAiError(
        msg.includes('429')
          ? 'Cota da API excedida. Aguarde alguns segundos e tente novamente.'
          : `Erro: ${msg}`,
      )
    } finally {
      setAiLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const snapshots = record?.snapshots ?? []
  const current = snapshots.at(-1) ?? null
  const indicators = STOCK_INDICATORS

  return (
    <>
      <div className="space-y-6">
        {/* Top bar: back + ticker + badges */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <span className="text-muted-foreground">/</span>
          <a
            href={`https://investidor10.com.br/${isFii ? 'fiis' : 'acoes'}/${asset.ticker.toLowerCase()}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xl font-bold text-foreground shrink-0 hover:underline"
          >
            {asset.ticker}
          </a>
          {asset.name !== asset.ticker && (
            <p className="text-sm text-muted-foreground truncate hidden sm:block">{asset.name}</p>
          )}
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-bold text-foreground">
            {formatCurrency(asset.currentPrice)}
          </span>
          {current?.industry && (
            <span className="text-xs text-muted-foreground/70">{current.industry}</span>
          )}
        </div>

        {/* FII fund info */}
        {isFii && <FiiInfoSection info={fiiInfoData} onEdit={() => setFiiInfoOpen(true)} />}

        {/* Stock company info */}
        {!isFii && <StockInfoSection info={stockInfoData} onEdit={() => setStockInfoOpen(true)} />}

        {/* Indicators */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Indicadores
            </p>
            <button
              onClick={() => setRegisterOpen(true)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Plus size={12} />
              Registrar indicadores
            </button>
          </div>
          {isFii ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[...FII_COMMON, ...FII_TIJOLO, ...FII_PAPEL].map((def) =>
                def.type === 'number' ? (
                  <IndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
                ) : (
                  <TextIndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
                ),
              )}
              <TextIndicatorCard
                def={{ type: 'text', key: 'notes', label: 'Observações' }}
                snapshots={snapshots}
              />
              {snapshots.length === 0 && (
                <p className="text-xs text-muted-foreground col-span-full mt-1">
                  Nenhum indicador registrado ainda
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {snapshots.length > 0 ? (
                indicators.map((def) => (
                  <IndicatorCard key={def.key as string} def={def} snapshots={snapshots} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground col-span-full mt-1">
                  Nenhum indicador registrado ainda
                </p>
              )}
              <TextIndicatorCard
                def={{ type: 'text', key: 'notes', label: 'Observações' }}
                snapshots={snapshots}
              />
            </div>
          )}
        </div>

        {/* AI analysis history */}
        {aiHistory.length > 0 && <AiHistorySection history={aiHistory} />}

        {/* AI analysis */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileUpload}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary/70" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Análise por IA
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={aiLoading}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            >
              <Upload size={12} />
              {aiLoading
                ? 'Analisando...'
                : aiAnalysis
                  ? 'Novo relatório'
                  : isFii
                    ? 'Enviar relatório gerencial'
                    : 'Enviar relatório de RI'}
            </button>
          </div>

          {aiLoading && (
            <div className="rounded-lg border border-border p-5 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-3 w-3 rounded-full bg-primary/30 animate-pulse" />
                <div className="h-3 w-28 rounded bg-muted animate-pulse" />
              </div>
              {['w-[55%]', 'w-[80%]', 'w-[65%]', 'w-[90%]', 'w-[70%]', 'w-[50%]'].map((w) => (
                <div key={w} className={`h-2.5 rounded bg-muted animate-pulse ${w}`} />
              ))}
            </div>
          )}

          {aiError && !aiLoading && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs text-destructive leading-relaxed">{aiError}</p>
            </div>
          )}

          {aiAnalysis && !aiLoading && (
            <div className="rounded-lg border border-border p-5 space-y-4">
              <AiMarkdown text={aiAnalysis} />
              <div className="pt-2 border-t border-border flex justify-end">
                <button
                  onClick={handleSaveAnalysis}
                  disabled={aiSaving}
                  className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  <BookmarkCheck size={13} />
                  {aiSaving ? 'Salvando...' : 'Salvar análise'}
                </button>
              </div>
            </div>
          )}

          {!aiAnalysis && !aiLoading && !aiError && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border border-dashed border-border p-6 text-center hover:border-primary/40 hover:bg-muted/30 transition-colors group"
            >
              <FileText
                size={20}
                className="mx-auto mb-2 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                {isFii
                  ? 'Clique para enviar o PDF do relatório gerencial'
                  : 'Clique para enviar o PDF do relatório de RI'}
              </p>
              <p className="text-[11px] text-muted-foreground/50 mt-1">Powered by Gemini</p>
            </button>
          )}
        </div>
      </div>

      <ManualSnapshotDialog
        ticker={asset.ticker}
        isFii={isFii}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSave={onSaveSnapshot}
      />
      {isFii && (
        <FiiInfoDialog
          ticker={asset.ticker}
          existing={fiiInfoData}
          open={fiiInfoOpen}
          onOpenChange={setFiiInfoOpen}
          onSave={onSaveFiiInfo}
        />
      )}
      {!isFii && (
        <StockInfoDialog
          ticker={asset.ticker}
          existing={stockInfoData}
          open={stockInfoOpen}
          onOpenChange={setStockInfoOpen}
          onSave={onSaveStockInfo}
        />
      )}
    </>
  )
}
