import { useEffect, useState } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { subscribeToAiAnalyses } from '@/services/ai-analyses'
import { useAuth } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import type {
  AiAnalysis,
  Asset,
  ExteriorInfo,
  FiiInfo,
  FundamentalRecord,
  FundamentalSnapshot,
  StockInfo,
} from '@/types'
import { FII_COMMON, FII_PAPEL, FII_TIJOLO, STOCK_INDICATORS } from '../constants'
import { AiHistorySection } from './ai-analysis'
import { AiSheet } from './ai-sheet'
import { ExteriorInfoDialog, ExteriorInfoSection } from './exterior-info'
import { FixedIncomeSection } from './fixed-income-section'
import { FiiInfoSection } from './fii-info'
import { IndicatorCard } from './indicator-card'
import { ManualSnapshotDialog } from './snapshot-form'
import { StockInfoDialog, StockInfoSection } from './stock-info'
import { TextIndicatorCard } from './text-indicator-card'
import { FiiValuation, StockValuation } from './valuation-section'
import { ComunicadosSection } from './comunicados-section'
import { NewsSection } from './news-section'
import { mergeSnapshots } from '../utils'

export const AssetDetailView = ({
  asset,
  record,
  isFii,
  fiiInfoData,
  stockInfoData,
  exteriorInfoData,
  onBack,
  onSaveSnapshot,
  onDeleteSnapshot,
  onSaveFiiInfo,
  onSaveStockInfo,
  onSaveExteriorInfo,
}: {
  asset: Asset
  record: FundamentalRecord | undefined
  isFii: boolean
  fiiInfoData: FiiInfo | undefined
  stockInfoData: StockInfo | undefined
  exteriorInfoData: ExteriorInfo | undefined
  onBack: () => void
  onSaveSnapshot: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  onDeleteSnapshot: (fetchedAt: string) => Promise<void>
  onSaveFiiInfo: (data: FiiInfo) => Promise<void>
  onSaveStockInfo: (data: StockInfo) => Promise<void>
  onSaveExteriorInfo: (data: ExteriorInfo) => Promise<void>
}) => {
  const { user } = useAuth()
  const [registerOpen, setRegisterOpen] = useState(false)
  const [stockInfoOpen, setStockInfoOpen] = useState(false)
  const [exteriorInfoOpen, setExteriorInfoOpen] = useState(false)
  const [aiHistory, setAiHistory] = useState<AiAnalysis[]>([])

  useEffect(() => {
    if (!user) return
    return subscribeToAiAnalyses(user.uid, asset.ticker, setAiHistory)
  }, [user, asset.ticker])

  const snapshots = record?.snapshots ?? []
  const current = mergeSnapshots(snapshots)
  const indicators = STOCK_INDICATORS

  const isFixedIncome = asset.type === 'fixed_income' || asset.type === 'tesouro'
  const isExterior = asset.type === 'stock_us' || asset.type === 'etf_us' || asset.type === 'bdr'
  const showStockInfo = !isFii && !isFixedIncome
  const showIndicators = !isFixedIncome

  return (
    <>
      <div className="space-y-6">
        {/* Top bar */}
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
          {!isFixedIncome && (
            <div className="ml-auto shrink-0">
              <AiSheet
                ticker={asset.ticker}
                isFii={isFii}
                sector={stockInfoData?.sector ?? current?.sector ?? undefined}
                subsector={stockInfoData?.subsector ?? current?.industry ?? undefined}
                lastAnalysis={aiHistory[0] ?? null}
                onSaveSnapshot={onSaveSnapshot}
              />
            </div>
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

        {/* Valuation */}
        {!isFixedIncome &&
          (isFii ? (
            <FiiValuation currentPrice={asset.currentPrice} snapshot={current} />
          ) : (
            <StockValuation currentPrice={asset.currentPrice} snapshot={current} />
          ))}

        {/* Renda fixa / Tesouro */}
        {isFixedIncome && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
              {asset.type === 'tesouro' ? 'Dados do Título' : 'Dados do Investimento'}
            </p>
            <FixedIncomeSection asset={asset} />
          </div>
        )}

        {/* FII fund info */}
        {isFii && (
          <FiiInfoSection
            ticker={asset.ticker}
            previousTickers={asset.previousTickers}
            info={fiiInfoData}
            onAutoSave={onSaveFiiInfo}
          />
        )}

        {/* Exterior ETF info */}
        {isExterior && (
          <ExteriorInfoSection
            ticker={asset.ticker}
            info={exteriorInfoData}
            onEdit={() => setExteriorInfoOpen(true)}
            onAutoSave={onSaveExteriorInfo}
          />
        )}

        {/* Stock company info */}
        {showStockInfo && !isExterior && (
          <StockInfoSection
            ticker={asset.ticker}
            previousTickers={asset.previousTickers}
            info={stockInfoData}
            onEdit={() => setStockInfoOpen(true)}
            onAutoSave={onSaveStockInfo}
          />
        )}

        {/* Indicators */}
        {showIndicators && (
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
                    <IndicatorCard
                      key={def.key as string}
                      def={def}
                      snapshots={snapshots}
                      onDeleteSnapshot={onDeleteSnapshot}
                    />
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
        )}

        {/* AI analysis history */}
        {aiHistory.length > 0 && <AiHistorySection history={aiHistory} />}

        {/* Comunicados */}
        {(isFii || (!isFixedIncome && !isExterior)) && (
          <ComunicadosSection ticker={asset.ticker} type={isFii ? 'fii' : 'stock'} />
        )}

        {/* News */}
        {(isFii || (!isFixedIncome && !isExterior)) && (
          <NewsSection ticker={asset.ticker} type={isFii ? 'fii' : 'stock'} />
        )}
      </div>

      <ManualSnapshotDialog
        ticker={asset.ticker}
        isFii={isFii}
        open={registerOpen}
        onOpenChange={setRegisterOpen}
        onSave={onSaveSnapshot}
        lastAnalysis={aiHistory[0] ?? null}
      />
      {isExterior && (
        <ExteriorInfoDialog
          ticker={asset.ticker}
          existing={exteriorInfoData}
          open={exteriorInfoOpen}
          onOpenChange={setExteriorInfoOpen}
          onSave={onSaveExteriorInfo}
        />
      )}
      {!isFii && !isExterior && (
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
