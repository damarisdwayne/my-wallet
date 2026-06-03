import type { FundamentalSnapshot } from '@/types'
import { FII_COMMON, FII_PAPEL, FII_TIJOLO, STOCK_INDICATORS } from './constants'

export interface ParsedIndicator {
  key: string
  label: string
  type: 'number' | 'text'
  value: string // raw value from the analysis; '' when the AI marked it "não informado"
}

// Matches "**Rótulo:** valor" (label inside bold, ending with a colon) — same shape the prompts emit.
const FIELD_RE = /^\*\*([^*]+?):\*\*\s*(.*)$/

const isMissingValue = (v: string) => !v || /^n[ãa]o\s+(informad|encontrad|dispon)/i.test(v)

const stripComputed = (v: string) => v.replace(/\s*\(calc[^)]*\)\s*/i, '').trim()

const defsFor = (isFii: boolean): { key: string; label: string; type: 'number' | 'text' }[] =>
  isFii
    ? [...FII_COMMON, ...FII_TIJOLO, ...FII_PAPEL].map((d) => ({
        key: d.key as string,
        label: d.label,
        type: d.type,
      }))
    : STOCK_INDICATORS.map((d) => ({
        key: d.key as string,
        label: d.label,
        type: 'number' as const,
      }))

// Parses a pt-BR number out of a value string: "9,09% (calc.)" -> 9.09, "R$ 1.284" -> 1284,
// "20 shopping centers" -> 20. Best-effort — the user reviews values before saving.
export const parseBrNumber = (raw: string): number | null => {
  const match = /-?\d[\d.]*(?:,\d+)?/.exec(stripComputed(raw))
  if (!match) return null
  const normalized = match[0].replaceAll('.', '').replace(',', '.')
  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

// Extracts every tracked indicator from an analysis text, in definition order. Missing/"não
// informado" ones come back with value '' so callers can show them as gaps to fill.
export const parseAnalysisIndicators = (text: string, isFii: boolean): ParsedIndicator[] => {
  const defs = defsFor(isFii)
  const byLabel = new Map(defs.map((d) => [d.label.toLowerCase(), d]))
  const found = new Map<string, string>()

  for (const raw of text.split('\n')) {
    const line = raw.trim().replace(/^[*-]\s+/, '')
    const m = FIELD_RE.exec(line)
    if (!m) continue
    const def = byLabel.get(m[1].trim().toLowerCase())
    if (!def || found.has(def.key)) continue
    const val = m[2].trim()
    found.set(def.key, isMissingValue(val) ? '' : val)
  }

  return defs.map((d) => ({
    key: d.key,
    label: d.label,
    type: d.type,
    value: found.get(d.key) ?? '',
  }))
}

// Pre-fill values for the "Registrar indicadores" form (string-keyed by indicator key).
export const analysisToFormValues = (text: string, isFii: boolean): Record<string, string> => {
  const out: Record<string, string> = {}
  for (const ind of parseAnalysisIndicators(text, isFii)) {
    if (!ind.value) continue
    if (ind.type === 'number') {
      const n = parseBrNumber(ind.value)
      if (n != null) out[ind.key] = String(n)
    } else {
      out[ind.key] = stripComputed(ind.value)
    }
  }
  return out
}

// Builds a snapshot Partial from parsed indicators overlaid with the user's inline edits
// (edits keyed by label, matching what the chip grid exposes).
export const buildSnapshotPartial = (
  indicators: ParsedIndicator[],
  edits: Record<string, string>,
): Partial<FundamentalSnapshot> => {
  const partial: Partial<FundamentalSnapshot> = {}
  for (const ind of indicators) {
    const raw = (edits[ind.label] ?? ind.value).trim()
    if (!raw) continue
    if (ind.type === 'number') {
      const n = parseBrNumber(raw)
      if (n != null) (partial as Record<string, number>)[ind.key] = n
    } else {
      ;(partial as Record<string, string>)[ind.key] = stripComputed(raw)
    }
  }
  return partial
}
