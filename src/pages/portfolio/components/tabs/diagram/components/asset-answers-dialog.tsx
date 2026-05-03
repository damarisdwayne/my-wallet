import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Asset, AssetAnswers, Diagram } from '@/types'

interface AssetAnswersDialogProps {
  editingAsset: Asset | null
  diagram: Diagram
  editingAnswers: AssetAnswers
  editYes: number
  editTotal: number
  onClose: () => void
  onSetAnswer: (questionId: string, value: 0 | 1) => Promise<void>
}

export const AssetAnswersDialog = ({
  editingAsset,
  diagram,
  editingAnswers,
  editYes,
  editTotal,
  onClose,
  onSetAnswer,
}: AssetAnswersDialogProps) => (
  <Dialog open={!!editingAsset} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {editingAsset?.ticker} — {diagram.name}
        </DialogTitle>
        <DialogDescription>
          Responda Sim ou Não para cada critério. Pontuação:{' '}
          <strong
            className={cn(
              editTotal > 0 && editYes / editTotal >= 0.75
                ? 'text-success'
                : editTotal > 0 && editYes / editTotal >= 0.5
                  ? 'text-warning'
                  : 'text-destructive',
            )}
          >
            {editYes}/{editTotal}
          </strong>
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 mt-2">
        {diagram.questions.map((q, i) => {
          const val = editingAnswers[q.id] ?? -1
          return (
            <div
              key={q.id}
              className="flex items-start gap-3 py-2 border-b border-border last:border-0"
            >
              <span className="text-xs text-muted-foreground w-5 shrink-0 mt-0.5">
                {i + 1}.
              </span>
              <p className="flex-1 text-sm text-foreground">{q.text}</p>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => onSetAnswer(q.id, 1)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-semibold transition-colors',
                    val === 1
                      ? 'bg-success text-white'
                      : 'bg-muted text-muted-foreground hover:bg-success/20 hover:text-success',
                  )}
                >
                  Sim
                </button>
                <button
                  onClick={() => onSetAnswer(q.id, 0)}
                  className={cn(
                    'px-2.5 py-1 rounded text-xs font-semibold transition-colors',
                    val === 0
                      ? 'bg-destructive/80 text-white'
                      : 'bg-muted text-muted-foreground hover:bg-destructive/20 hover:text-destructive',
                  )}
                >
                  Não
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </DialogContent>
  </Dialog>
)
