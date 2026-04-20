import { useState } from 'react'
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { Asset, AssetAnswers, Diagram, DiagramQuestion, PortfolioCategory } from '@/types'
import { computeAssetTargets } from '../compute-targets'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const calcScore = (answers: AssetAnswers, questions: DiagramQuestion[]) => {
  const yes = questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0)
  return { yes, total: questions.length }
}

interface Props {
  assets: Asset[]
  categories: PortfolioCategory[]
  diagrams: Diagram[]
  answers: Record<string, AssetAnswers>
  saveDiagram: (diagram: Diagram) => Promise<void>
  saveAnswers: (assetId: string, answers: AssetAnswers) => Promise<void>
}

export const DiagramTab = ({
  assets,
  categories,
  diagrams,
  answers,
  saveDiagram,
  saveAnswers,
}: Props) => {
  const assetTargets = computeAssetTargets(assets, categories, diagrams, answers)

  const [selectedDiagramId, setSelectedDiagramId] = useState('')
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editQuestionsOpen, setEditQuestionsOpen] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<DiagramQuestion | null>(null)
  const [editingQuestionText, setEditingQuestionText] = useState('')

  const activeDiagramId = selectedDiagramId || diagrams[0]?.id || ''
  const diagram = diagrams.find((d) => d.id === activeDiagramId) ?? diagrams[0]

  if (!diagram) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Nenhum diagrama configurado ainda.
      </p>
    )
  }

  const diagramAssets = assets.filter((a) => diagram.appliesTo.includes(a.type))
  const editingAnswers = (editingAsset && answers[editingAsset.id]) || {}
  const { yes: editYes, total: editTotal } = calcScore(editingAnswers, diagram.questions)

  const setAnswer = async (questionId: string, value: 0 | 1) => {
    if (!editingAsset) return
    const updated = { ...(answers[editingAsset.id] ?? {}), [questionId]: value }
    await saveAnswers(editingAsset.id, updated)
  }

  const addQuestion = async () => {
    const text = newQuestionText.trim()
    if (!text) return
    await saveDiagram({
      ...diagram,
      questions: [...diagram.questions, { id: `q-${Date.now()}`, text }],
    })
    setNewQuestionText('')
  }

  const removeQuestion = async (qId: string) => {
    await saveDiagram({
      ...diagram,
      questions: diagram.questions.filter((q) => q.id !== qId),
    })
  }

  const saveEditQuestion = async () => {
    const text = editingQuestionText.trim()
    if (!text || !editingQuestion) return
    await saveDiagram({
      ...diagram,
      questions: diagram.questions.map((q) => (q.id === editingQuestion.id ? { ...q, text } : q)),
    })
    setEditingQuestion(null)
    setEditingQuestionText('')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {diagrams.map((d) => (
          <button
            key={d.id}
            onClick={() => setSelectedDiagramId(d.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              activeDiagramId === d.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            {d.name}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground text-sm font-semibold">
                {diagram.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {diagram.questions.length} perguntas · clique em um ativo para avaliar
              </p>
            </div>
            <button
              onClick={() => setEditQuestionsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <Pencil size={12} />
              Editar perguntas
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {diagramAssets.length === 0 && (
              <p className="text-sm text-muted-foreground py-4">
                Nenhum ativo desta categoria na carteira.
              </p>
            )}
            {diagramAssets.map((a) => {
              const { yes, total } = calcScore(answers[a.id] ?? {}, diagram.questions)
              const pct = total > 0 ? (yes / total) * 100 : 0
              const scoreColor =
                pct >= 75 ? 'text-success' : pct >= 50 ? 'text-warning' : 'text-destructive'
              return (
                <button
                  key={a.id}
                  onClick={() => setEditingAsset(a)}
                  className="w-full flex items-center gap-4 group text-left hover:bg-accent/40 rounded-md px-2 py-2 transition-colors"
                >
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-semibold text-foreground">{a.ticker}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{a.name}</p>
                  </div>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      'shrink-0 text-sm font-bold w-12 text-right tabular-nums',
                      scoreColor,
                    )}
                  >
                    {yes}/{total}
                  </span>
                  <span className="w-12 text-xs text-right text-muted-foreground shrink-0">
                    alvo {(assetTargets.get(a.id) ?? 0).toFixed(1)}%
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingAsset} onOpenChange={(open) => !open && setEditingAsset(null)}>
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
                      onClick={() => setAnswer(q.id, 1)}
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
                      onClick={() => setAnswer(q.id, 0)}
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

      <Dialog
        open={editQuestionsOpen}
        onOpenChange={(open) => {
          setEditQuestionsOpen(open)
          setEditingQuestion(null)
        }}
      >
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Perguntas — {diagram.name}</DialogTitle>
            <DialogDescription>
              Adicione, edite ou remova perguntas deste diagrama.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {diagram.questions.map((q, i) => (
              <div
                key={q.id}
                className="flex items-start gap-2 py-2 border-b border-border last:border-0"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0 mt-2">{i + 1}.</span>
                {editingQuestion?.id === q.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      className={cn(inputClass, 'flex-1')}
                      value={editingQuestionText}
                      onChange={(e) => setEditingQuestionText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEditQuestion()}
                      autoFocus
                    />
                    <button
                      onClick={saveEditQuestion}
                      className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs"
                    >
                      OK
                    </button>
                    <button
                      onClick={() => setEditingQuestion(null)}
                      className="px-2 py-1 rounded bg-muted text-muted-foreground text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="flex-1 text-sm text-foreground py-1.5">{q.text}</p>
                    <button
                      onClick={() => {
                        setEditingQuestion(q)
                        setEditingQuestionText(q.text)
                      }}
                      className="p-1.5 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => removeQuestion(q.id)}
                      className="p-1.5 rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          <DialogFooter className="flex-col gap-2 mt-2">
            <div className="flex gap-2 w-full">
              <input
                className={cn(inputClass, 'flex-1')}
                placeholder="Nova pergunta..."
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addQuestion()}
              />
              <button
                onClick={addQuestion}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors shrink-0"
              >
                <Plus size={14} />
                Adicionar
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
