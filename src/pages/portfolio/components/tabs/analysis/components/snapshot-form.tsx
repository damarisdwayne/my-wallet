import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components'
import type { FundamentalSnapshot } from '@/types'
import type { FiiIndicatorDef } from '../types'
import { inputClass } from '../utils'
import { FII_COMMON, FII_PAPEL, FII_TIJOLO, STOCK_INDICATORS } from '../constants'

export const ManualSnapshotDialog = ({
  ticker,
  isFii,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  isFii: boolean
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (ticker: string, partial: Partial<FundamentalSnapshot>) => Promise<void>
}) => {
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

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
      onOpenChange(false)
      setForm({})
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar indicadores — {ticker}</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground -mt-1">
          Salva os dados do mês atual. Deixe em branco para não alterar.
        </p>

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
            onClick={() => onOpenChange(false)}
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
