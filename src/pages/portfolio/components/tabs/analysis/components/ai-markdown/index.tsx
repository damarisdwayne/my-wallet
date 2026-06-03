import { renderInline, verdictFromText } from '../../utils'
import { MetaRow, type MetaItem } from './meta-row'
import { IndicatorGrid, type IndicatorEdit, type IndicatorField } from './indicator-grid'

type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'fields'; items: IndicatorField[] }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'paragraph'; text: string }

// Matches "**Rótulo:** valor" (label inside bold, ending with a colon).
const FIELD_RE = /^\*\*([^*]+?):\*\*\s*(.*)$/
const META_LABELS = new Set(['data do relatório', 'tipo de documento'])

// Renders the Gemini markdown analysis: verdict + metadata badges on top, section headings,
// indicator key-value lines as a chip grid, and regular bullets/paragraphs. When `indicatorEdit`
// is passed, the first indicator grid becomes editable (used in the analysis sheet).
export const AiMarkdown = ({
  text,
  indicatorEdit,
}: {
  text: string
  indicatorEdit?: IndicatorEdit
}) => {
  const meta: MetaItem[] = []
  const blocks: Block[] = []
  let bullets: string[] = []
  let fields: IndicatorField[] = []

  const flushBullets = () => {
    if (bullets.length) {
      blocks.push({ kind: 'bullets', items: [...bullets] })
      bullets = []
    }
  }
  const flushFields = () => {
    if (fields.length) {
      blocks.push({ kind: 'fields', items: [...fields] })
      fields = []
    }
  }
  const flush = () => {
    flushBullets()
    flushFields()
  }

  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line) {
      // Keep accumulating indicator fields across blank lines so the obligatory list and the
      // "extra" indicators below it render as a single chip grid, not two separate ones.
      flushBullets()
      continue
    }

    // Section heading: "**Title**" alone, or "**1. Title".
    if (/^\*\*[^*]+\*\*\s*$/.test(line) || /^\*\*\d+\.\s/.test(line)) {
      flush()
      blocks.push({ kind: 'heading', text: line.replaceAll('**', '') })
      continue
    }

    const wasBullet = /^[*-]\s+/.test(line)
    const body = line.replace(/^[*-]\s+/, '')
    const field = FIELD_RE.exec(body)
    if (field) {
      const label = field[1].trim()
      const value = field[2].trim()
      if (META_LABELS.has(label.toLowerCase())) {
        flush()
        meta.push({ label, value })
      } else {
        flushBullets()
        fields.push({ label, value })
      }
      continue
    }

    if (wasBullet) {
      flushFields()
      bullets.push(body)
      continue
    }

    flush()
    blocks.push({ kind: 'paragraph', text: line })
  }
  flush()

  const verdict = verdictFromText(text)
  const firstFieldsIndex = blocks.findIndex((b) => b.kind === 'fields')

  return (
    <div className="space-y-4">
      {(verdict || meta.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {verdict && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${verdict.className}`}
            >
              {verdict.label}
            </span>
          )}
          <MetaRow items={meta} />
        </div>
      )}
      {blocks.map((block, i) => {
        if (block.kind === 'heading') {
          return (
            <div key={i} className="pt-1">
              <p className="mb-2 border-b border-border pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {block.text}
              </p>
            </div>
          )
        }
        if (block.kind === 'fields') {
          return (
            <IndicatorGrid
              key={i}
              fields={block.items}
              edit={i === firstFieldsIndex ? indicatorEdit : undefined}
            />
          )
        }
        if (block.kind === 'bullets') {
          return (
            <ul key={i} className="space-y-1.5 pl-1">
              {block.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-foreground">
            {renderInline(block.text)}
          </p>
        )
      })}
    </div>
  )
}
