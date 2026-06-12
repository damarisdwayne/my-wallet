import { useState } from 'react'
import { Loader2, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components'
import type { AiAnalysis, FundamentalSnapshot } from '@/types'
import {
  fetchInvestidor10FiiIndicators,
  fetchInvestidor10StockIndicators,
} from '@/services/investidor10'
import type { FiiIndicatorDef } from '../types'
import { inputClass } from '../utils'
import { analysisToFormValues } from '../parse-indicators'
import { FII_COMMON, FII_PAPEL, FII_TIJOLO, STOCK_INDICATORS } from '../constants'

export const ManualSnapshotDialog = ({
  ticker,
  previousTickers,
  isFii,
  open,
  onOpenChange,
  onSave,
  lastAnalysis,
}: {
  ticker: string
  previousTickers?: string[]
  isFii: boolean
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
  lastAnalysis: AiAnalysis | null
}) => {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [filling, setFilling] = useState(false)

  // Reset the form when the dialog closes so reopening starts clean (avoids a setState-in-effect).
  const handleOpenChange = (v: boolean) => {
    if (!v) setForm({})
    onOpenChange(v)
  }

  // Preenche os indicadores: busca o conjunto do Investidor 10 (dados de mercado) e sobrepõe os
  // valores da última análise (que vêm do relatório). Funciona para qualquer análise, nova ou antiga.
  const fillIndicators = async () => {
    setFilling(true)
    try {
      const fromAnalysis = lastAnalysis ? analysisToFormValues(lastAnalysis.text, isFii) : {}
      const i10 = await (isFii
        ? fetchInvestidor10FiiIndicators(ticker, previousTickers ?? [])
        : fetchInvestidor10StockIndicators(ticker, previousTickers ?? []))
      const fromI10: Record<string, string> = {}
      for (const [k, v] of Object.entries(i10)) {
        if (typeof v === 'number' && Number.isFinite(v)) fromI10[k] = String(Number(v.toFixed(2)))
      }
      // Prioridade: o que o usuário já digitou > análise (relatório) > Investidor 10. Nunca apaga
      // um campo já preenchido — só completa os vazios.
      setForm((prev) => {
        const merged: Record<string, string> = { ...fromI10, ...fromAnalysis }
        for (const [k, v] of Object.entries(prev)) if (v !== '') merged[k] = v
        return merged
      })
    } finally {
      setFilling(false)
    }
  }

  const setField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }))

  const buildPartial = (defs: FiiIndicatorDef[]): Partial<FundamentalSnapshot> => {
    const partial: Partial<FundamentalSnapshot> = {}
    for (const def of defs) {
      const raw = form[def.key as string]
      if (raw === undefined || raw === '') continue
      if (def.type === 'number') {
        ;(partial as Record<string, number>)[def.key as string] = Number(raw)
      } else {
        ;(partial as Record<string, string>)[def.key as string] = raw
      }
    }
    return partial
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      let partial: Partial<FundamentalSnapshot>
      if (isFii) {
        partial = {
          ...buildPartial(FII_COMMON),
          ...buildPartial(FII_TIJOLO),
          ...buildPartial(FII_PAPEL),
        }
      } else {
        partial = buildPartial(STOCK_INDICATORS.map((d) => ({ ...d, type: 'number' as const })))
      }
      if (form['notes'] !== undefined && form['notes'] !== '') {
        ;(partial as Record<string, string>)['notes'] = form['notes']
      }
      await onSave(ticker, partial)
      handleOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const renderField = (def: FiiIndicatorDef) => {
    const key = def.key as string
    if (def.type === 'number') {
      return (
        <div key={key}>
          <label className="text-xs text-muted-foreground mb-1 block">
            {def.inputLabel ?? def.label}
          </label>
          <input
            className={inputClass}
            type="number"
            step={def.inputStep}
            placeholder="—"
            value={form[key] ?? ''}
            onChange={(e) => setField(key, e.target.value)}
          />
        </div>
      )
    }
    return (
      <div key={key}>
        <label className="text-xs text-muted-foreground mb-1 block">{def.label}</label>
        <input
          className={inputClass}
          type="text"
          placeholder={def.inputPlaceholder ?? '—'}
          value={form[key] ?? ''}
          onChange={(e) => setField(key, e.target.value)}
        />
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <DialogHeader>
          <DialogTitle>Registrar indicadores — {ticker}</DialogTitle>
        </DialogHeader>
        <div className="-mt-1 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Salva os dados do mês atual. Deixe em branco para não alterar.
          </p>
          <button
            onClick={fillIndicators}
            disabled={filling}
            className="flex shrink-0 items-center gap-1.5 rounded-md border border-primary/30 px-2.5 py-1 text-xs text-primary transition-colors hover:bg-primary/5 disabled:opacity-50"
          >
            {filling ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {filling ? 'Buscando...' : 'Preencher automaticamente'}
          </button>
        </div>

        {isFii ? (
          <div className="space-y-3 mt-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1 border-b border-border">
              Todos os FIIs
            </p>
            {FII_COMMON.map(renderField)}

            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1 border-b border-border">
              FII de Tijolo
            </p>
            {FII_TIJOLO.map(renderField)}

            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2 pb-1 border-b border-border">
              FII de Papel
            </p>
            {FII_PAPEL.map(renderField)}
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            {STOCK_INDICATORS.map((def) => renderField({ ...def, type: 'number' }))}
          </div>
        )}

        <div className="mt-2">
          <label htmlFor="snapshot-notes" className="text-xs text-muted-foreground mb-1 block">
            Observações
          </label>
          <textarea
            id="snapshot-notes"
            className={`${inputClass} resize-none`}
            rows={3}
            placeholder="Ex: Vacância alta em 2026, reavaliar no próximo trimestre"
            value={form['notes'] ?? ''}
            onChange={(e) => setField('notes', e.target.value)}
          />
        </div>

        <DialogFooter className="mt-4">
          <button
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Registrar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
