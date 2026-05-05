import { useState } from 'react'
import { Clock, GitCompareArrows, Sparkles, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { deleteAiAnalysis } from '@/services/ai-analyses'
import { compareAnalyses } from '@/services/gemini'
import { useAuth } from '@/store/auth'
import type { AiAnalysis } from '@/types'
import { renderInline, verdictFromText } from '../utils'
import { VERDICT_MAP } from '../constants'

export const AiMarkdown = ({ text }: { text: string }) => {
  type Block =
    | { kind: 'heading'; text: string }
    | { kind: 'bullets'; items: string[] }
    | { kind: 'paragraph'; text: string }

  const blocks: Block[] = []
  const lines = text.split('\n')
  let bullets: string[] = []

  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ kind: 'bullets', items: [...bullets] })
      bullets = []
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushBullets()
      continue
    }
    if (/^\*\*[^*]+\*\*\s*$/.test(line) || /^\*\*\d+\.\s/.test(line)) {
      flushBullets()
      blocks.push({ kind: 'heading', text: line.replace(/\*\*/g, '') })
    } else if (/^[*-]\s+/.test(line)) {
      bullets.push(line.replace(/^[*-]\s+/, ''))
    } else {
      flushBullets()
      blocks.push({ kind: 'paragraph', text: line })
    }
  }
  flushBullets()

  const lowerText = text.toLowerCase()
  const verdict = Object.keys(VERDICT_MAP).find((k) => lowerText.includes(k))

  return (
    <div className="space-y-4">
      {verdict && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${VERDICT_MAP[verdict].className}`}
          >
            {VERDICT_MAP[verdict].label}
          </span>
        </div>
      )}
      {blocks.map((block, i) => {
        if (block.kind === 'heading') {
          return (
            <div key={i} className="pt-1">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 pb-1.5 border-b border-border">
                {block.text}
              </p>
            </div>
          )
        }
        if (block.kind === 'bullets') {
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-foreground leading-relaxed"
                >
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="text-sm text-foreground leading-relaxed">
            {renderInline(block.text)}
          </p>
        )
      })}
    </div>
  )
}

export const AiHistorySection = ({ history }: { history: AiAnalysis[] }) => {
  const [modalItem, setModalItem] = useState<AiAnalysis | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [selected, setSelected] = useState<AiAnalysis[]>([])
  const [compareText, setCompareText] = useState<string | null>(null)
  const [compareLoading, setCompareLoading] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const { user } = useAuth()

  const years = [...new Set(history.map((h) => new Date(h.analyzedAt).getFullYear()))].sort(
    (a, b) => b - a,
  )
  const [selectedYear, setSelectedYear] = useState<number>(years[0])
  const filtered = history.filter((h) => new Date(h.analyzedAt).getFullYear() === selectedYear)

  const toggleCompareMode = () => {
    setCompareMode((v) => !v)
    setSelected([])
  }

  const toggleSelect = (item: AiAnalysis) => {
    setSelected((prev) =>
      prev.some((s) => s.id === item.id)
        ? prev.filter((s) => s.id !== item.id)
        : prev.length < 2
          ? [...prev, item]
          : prev,
    )
  }

  const runComparison = async () => {
    const sorted = [...selected].sort(
      (a, b) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime(),
    )
    setCompareLoading(true)
    setCompareOpen(true)
    try {
      const result = await compareAnalyses(sorted[0].text, sorted[1].text)
      setCompareText(result.text)
    } finally {
      setCompareLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Histórico de análises
        </p>
        <div className="flex items-center gap-2">
          {years.length > 1 && (
            <div className="flex gap-1">
              {years.map((y) => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  className={`px-2 py-0.5 rounded text-xs transition-colors ${
                    selectedYear === y
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
          {history.length >= 2 && (
            <button
              onClick={toggleCompareMode}
              className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-colors ${
                compareMode
                  ? 'bg-primary/10 text-primary border border-primary/30'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitCompareArrows size={11} />
              Comparar
            </button>
          )}
        </div>
      </div>

      {compareMode && (
        <div className="mb-3 flex items-center justify-between rounded-md bg-primary/5 border border-primary/15 px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            {selected.length === 0
              ? 'Selecione 2 análises para comparar'
              : selected.length === 1
                ? 'Selecione mais 1 análise'
                : '2 análises selecionadas'}
          </p>
          {selected.length === 2 && (
            <button
              onClick={runComparison}
              className="text-xs bg-primary text-primary-foreground px-2.5 py-1 rounded-md hover:bg-primary/90 transition-colors"
            >
              Ver comparação
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((item) => {
          const verdict = verdictFromText(item.text)
          const savedAt = new Date(item.analyzedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })
          const isSelected = selected.some((s) => s.id === item.id)
          return (
            <button
              key={item.id}
              onClick={() => (compareMode ? toggleSelect(item) : setModalItem(item))}
              className={`rounded-lg border p-3 text-left transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-muted/20'
              }`}
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                {item.documentType ?? 'Relatório'}
              </p>
              <p className="text-sm font-bold text-foreground">{item.reportDate ?? savedAt}</p>
              <div className="flex items-center justify-between mt-2">
                {verdict ? (
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${verdict.className}`}
                  >
                    {verdict.label}
                  </span>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                    <Clock size={10} />
                    {savedAt}
                  </div>
                  {!compareMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (user) deleteAiAnalysis(user.uid, item.id)
                      }}
                      className="text-muted-foreground/30 hover:text-destructive transition-colors"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Análise individual */}
      <Dialog
        open={!!modalItem}
        onOpenChange={(v) => {
          if (!v) setModalItem(null)
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles size={15} className="text-primary/70" />
              Análise —{' '}
              {modalItem?.reportDate ??
                new Date(modalItem?.analyzedAt ?? '').toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
            </DialogTitle>
          </DialogHeader>
          {modalItem && <AiMarkdown text={modalItem.text} />}
        </DialogContent>
      </Dialog>

      {/* Comparação */}
      <Dialog
        open={compareOpen}
        onOpenChange={(v) => {
          if (!v) {
            setCompareOpen(false)
            setCompareText(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompareArrows size={15} className="text-primary/70" />
              Comparação —{' '}
              {selected
                .map(
                  (s) =>
                    s.reportDate ??
                    new Date(s.analyzedAt).toLocaleDateString('pt-BR', {
                      month: 'short',
                      year: '2-digit',
                    }),
                )
                .join(' vs ')}
            </DialogTitle>
          </DialogHeader>
          {compareLoading ? (
            <div className="space-y-2.5 animate-pulse py-4">
              {['w-[70%]', 'w-[85%]', 'w-[60%]', 'w-[90%]', 'w-[75%]'].map((w) => (
                <div key={w} className={`h-2 rounded bg-muted ${w}`} />
              ))}
            </div>
          ) : compareText ? (
            <AiMarkdown text={compareText} />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
