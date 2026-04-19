import { useMemo, useState } from 'react'
import { ChevronRight, Pencil, Plus, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { mockAnswers, mockAssets, mockCategories, mockDiagrams } from '@/data/mock'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { Asset, AssetAnswers, AssetType, Diagram, DiagramQuestion } from '@/types'

const tabs = ['Visão Geral', 'Alocação', 'Diagrama do Cerrado', 'Análise']

const typeLabel: Record<AssetType, string> = {
  stock: 'Ações BR',
  fii: 'Fundos Imob.',
  bdr: 'BDR',
  etf: 'ETF',
  fixed_income: 'Renda Fixa',
  crypto: 'Cripto',
  other: 'Outros',
}

const ALL = 'all'

const calcScore = (answers: AssetAnswers, questions: DiagramQuestion[]) => {
  const yes = questions.reduce((s, q) => s + (answers[q.id] ?? 0), 0)
  return { yes, total: questions.length }
}

export const PortfolioPage = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [filterType, setFilterType] = useState<AssetType | typeof ALL>(ALL)

  // diagrama state
  const [diagrams, setDiagrams] = useState<Diagram[]>(mockDiagrams)
  const [activeDiagramId, setActiveDiagramId] = useState(mockDiagrams[0].id)
  const [answers, setAnswers] = useState<Record<string, AssetAnswers>>(mockAnswers)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  // question management state
  const [editQuestionsOpen, setEditQuestionsOpen] = useState(false)
  const [newQuestionText, setNewQuestionText] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<DiagramQuestion | null>(null)
  const [editingQuestionText, setEditingQuestionText] = useState('')

  const totalValue = useMemo(
    () => mockAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0),
    [],
  )

  // unique types present in portfolio
  const availableTypes = useMemo(
    () => [...new Set(mockAssets.map((a) => a.type))] as AssetType[],
    [],
  )

  const filteredAssets = useMemo(
    () => (filterType === ALL ? mockAssets : mockAssets.filter((a) => a.type === filterType)),
    [filterType],
  )

  // total value per type for summary cards
  const valueByType = useMemo(
    () =>
      availableTypes.reduce(
        (acc, type) => {
          const v = mockAssets
            .filter((a) => a.type === type)
            .reduce((s, a) => s + a.currentPrice * a.quantity, 0)
          return { ...acc, [type]: v }
        },
        {} as Record<string, number>,
      ),
    [availableTypes],
  )

  const filteredTotal = filteredAssets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === i
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && (
        <div className="space-y-5">
          {/* Patrimônio total + filtros */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">
                {filterType === ALL ? 'Patrimônio total' : typeLabel[filterType]}
              </p>
              <p className="text-2xl font-bold text-foreground">{formatCurrency(filteredTotal)}</p>
              {filterType !== ALL && (
                <p className="text-xs text-muted-foreground">
                  {((filteredTotal / totalValue) * 100).toFixed(1)}% da carteira
                </p>
              )}
            </div>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType(ALL)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterType === ALL
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos
              </button>
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    filterType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {typeLabel[type]}
                </button>
              ))}
            </div>
          </div>

          {/* Category summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {availableTypes.map((type) => {
              const val = valueByType[type] ?? 0
              const pct = (val / totalValue) * 100
              const isActive = filterType === type
              return (
                <button
                  key={type}
                  onClick={() => setFilterType(filterType === type ? ALL : type)}
                  className="text-left"
                >
                  <Card
                    className={`transition-colors ${isActive ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}
                  >
                    <CardHeader className="p-4">
                      <CardTitle>{typeLabel[type]}</CardTitle>
                      <p className="text-base font-bold text-foreground mt-1">
                        {formatCurrency(val)}
                      </p>
                      <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% da carteira</p>
                    </CardHeader>
                  </Card>
                </button>
              )
            })}
          </div>

          {/* Assets table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-2 font-medium">Ativo</th>
                  <th className="pb-2 font-medium">Tipo</th>
                  <th className="pb-2 font-medium text-right">Qtd</th>
                  <th className="pb-2 font-medium text-right">PM</th>
                  <th className="pb-2 font-medium text-right">Atual</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  <th className="pb-2 font-medium text-right">Resultado</th>
                  <th className="pb-2 font-medium text-right">% Cart.</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((a) => {
                  const total = a.currentPrice * a.quantity
                  const cost = a.avgPrice * a.quantity
                  const ret = ((total - cost) / cost) * 100
                  const pct = (total / totalValue) * 100
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-3">
                        <p className="font-semibold text-foreground">{a.ticker}</p>
                        <p className="text-xs text-muted-foreground">{a.name}</p>
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary">{typeLabel[a.type]}</Badge>
                      </td>
                      <td className="py-3 text-right text-foreground">{a.quantity}</td>
                      <td className="py-3 text-right text-muted-foreground">
                        {formatCurrency(a.avgPrice)}
                      </td>
                      <td className="py-3 text-right text-foreground">
                        {formatCurrency(a.currentPrice)}
                      </td>
                      <td className="py-3 text-right font-medium text-foreground">
                        {formatCurrency(total)}
                      </td>
                      <td
                        className={`py-3 text-right font-medium ${ret >= 0 ? 'text-success' : 'text-destructive'}`}
                      >
                        {formatPercent(ret)}
                      </td>
                      <td className="py-3 text-right text-muted-foreground">{pct.toFixed(1)}%</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="space-y-4">
          {mockCategories.map((cat) => {
            const assets = mockAssets.filter((a) => a.categoryId === cat.id)
            const catValue = assets.reduce((s, a) => s + a.currentPrice * a.quantity, 0)
            const actualPct = (catValue / totalValue) * 100
            const diff = actualPct - cat.targetPercent

            return (
              <Card key={cat.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <CardTitle className="text-foreground text-sm font-semibold">
                        {cat.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-muted-foreground">Meta: {cat.targetPercent}%</span>
                      <span className="font-medium text-foreground">
                        Atual: {actualPct.toFixed(1)}%
                      </span>
                      <Badge variant={diff >= 0 ? 'success' : 'destructive'}>
                        {diff >= 0 ? '+' : ''}
                        {diff.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min(actualPct, 100)}%`,
                        background: cat.color,
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {assets.map((a) => {
                      const v = a.currentPrice * a.quantity
                      return (
                        <div key={a.id} className="text-xs p-2 rounded bg-muted">
                          <p className="font-semibold text-foreground">{a.ticker}</p>
                          <p className="text-muted-foreground">{formatCurrency(v)}</p>
                          <p className="text-muted-foreground">Alvo: {a.targetPercent}%</p>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {activeTab === 2 &&
        (() => {
          const diagram = diagrams.find((d) => d.id === activeDiagramId) ?? diagrams[0]
          const diagramAssets = mockAssets.filter((a) => diagram.appliesTo.includes(a.type))
          const editingAnswers = (editingAsset && answers[editingAsset.id]) || {}
          const { yes: editYes, total: editTotal } = calcScore(editingAnswers, diagram.questions)

          const setAnswer = (questionId: string, value: 0 | 1) => {
            if (!editingAsset) return
            setAnswers((prev) => ({
              ...prev,
              [editingAsset.id]: {
                ...prev[editingAsset.id],
                [questionId]: value,
              },
            }))
          }

          const addQuestion = () => {
            const text = newQuestionText.trim()
            if (!text) return
            setDiagrams((prev) =>
              prev.map((d) =>
                d.id === diagram.id
                  ? {
                      ...d,
                      questions: [...d.questions, { id: `q-${Date.now()}`, text }],
                    }
                  : d,
              ),
            )
            setNewQuestionText('')
          }

          const removeQuestion = (qId: string) => {
            setDiagrams((prev) =>
              prev.map((d) =>
                d.id === diagram.id
                  ? { ...d, questions: d.questions.filter((q) => q.id !== qId) }
                  : d,
              ),
            )
          }

          const saveEditQuestion = () => {
            const text = editingQuestionText.trim()
            if (!text || !editingQuestion) return
            setDiagrams((prev) =>
              prev.map((d) =>
                d.id === diagram.id
                  ? {
                      ...d,
                      questions: d.questions.map((q) =>
                        q.id === editingQuestion.id ? { ...q, text } : q,
                      ),
                    }
                  : d,
              ),
            )
            setEditingQuestion(null)
            setEditingQuestionText('')
          }

          const inputClass =
            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

          return (
            <div className="space-y-5">
              {/* Diagram selector */}
              <div className="flex flex-wrap items-center gap-2">
                {diagrams.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setActiveDiagramId(d.id)}
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

              {/* Asset list card */}
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
                            alvo {a.targetPercent}%
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

              {/* Score answers dialog */}
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
                          editYes / editTotal >= 0.75
                            ? 'text-success'
                            : editYes / editTotal >= 0.5
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
                      const val = editingAnswers[q.id] ?? 0
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
                                val === 0 && q.id in (answers[editingAsset?.id ?? ''] ?? {})
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

              {/* Edit questions dialog */}
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
                        <span className="text-xs text-muted-foreground w-5 shrink-0 mt-2">
                          {i + 1}.
                        </span>
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
        })()}

      {activeTab === 3 && (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          Análise de ativos — em breve
        </div>
      )}
    </div>
  )
}
