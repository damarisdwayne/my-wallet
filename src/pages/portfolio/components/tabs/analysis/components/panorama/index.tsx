import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { AiAnalysis, Asset, PortfolioCategory } from '@/types'
import { AiMarkdown } from '../ai-markdown'
import { CategoryPills } from '../category-pills'
import { AnalysisSummaryCard } from './summary-card'
import { useLatestAnalyses } from './use-latest-analyses'

interface Props {
  uid: string | null
  assets: Asset[]
  categories: PortfolioCategory[]
}

export const PanoramaTab = ({ uid, assets, categories }: Props) => {
  const { byTicker, loaded } = useLatestAnalyses(uid)
  const [openAnalysis, setOpenAnalysis] = useState<AiAnalysis | null>(null)
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? '')

  const shown = assets
    .filter((a) => a.categoryId === categoryId)
    .flatMap((a) => {
      const analysis = byTicker[a.ticker.toUpperCase()]
      return analysis ? [analysis] : []
    })

  return (
    <div className="space-y-5">
      <CategoryPills categories={categories} selectedId={categoryId} onSelect={setCategoryId} />

      {loaded && shown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Nenhuma análise salva nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {shown.map((analysis) => (
            <AnalysisSummaryCard
              key={analysis.id}
              analysis={analysis}
              onClick={() => setOpenAnalysis(analysis)}
            />
          ))}
        </div>
      )}

      <Dialog
        open={!!openAnalysis}
        onOpenChange={(v) => {
          if (!v) setOpenAnalysis(null)
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={15} className="text-primary/70" />
              {openAnalysis?.ticker} — {openAnalysis?.documentType ?? 'Relatório'}
              {openAnalysis?.reportDate ? ` · ${openAnalysis.reportDate}` : ''}
            </DialogTitle>
          </DialogHeader>
          {openAnalysis && <AiMarkdown text={openAnalysis.text} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
