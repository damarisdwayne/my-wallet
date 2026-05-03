import { useState } from 'react'
import { Clock, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
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
  const years = [...new Set(history.map((h) => new Date(h.analyzedAt).getFullYear()))].sort(
    (a, b) => b - a,
  )
  const [selectedYear, setSelectedYear] = useState<number>(years[0])
  const filtered = history.filter((h) => new Date(h.analyzedAt).getFullYear() === selectedYear)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Histórico de análises
        </p>
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
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {filtered.map((item) => {
          const verdict = verdictFromText(item.text)
          const savedAt = new Date(item.analyzedAt).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })
          return (
            <button
              key={item.id}
              onClick={() => setModalItem(item)}
              className="rounded-lg border border-border p-3 text-left hover:border-primary/40 hover:bg-muted/20 transition-colors"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                Relatório
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
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <Clock size={10} />
                  {savedAt}
                </div>
              </div>
            </button>
          )
        })}
      </div>

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
    </div>
  )
}
