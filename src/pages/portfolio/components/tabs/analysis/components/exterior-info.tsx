import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Skeleton,
} from '@/components'
import type { ExteriorInfo } from '@/types'
import {
  fetchInvestidor10ExteriorInfo,
  type Investidor10ExteriorInfo,
} from '@/services/investidor10'
import { inputClass } from '../utils'
import { EXTERIOR_INFO_FIELDS } from '../constants'
import { ExpandableText } from './expandable-text'

export const ExteriorInfoDialog = ({
  ticker,
  existing,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  existing: ExteriorInfo | undefined
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: ExteriorInfo) => Promise<void>
}) => {
  const empty: Omit<ExteriorInfo, 'ticker' | 'updatedAt'> = {
    name: '',
    expenseRatio: '',
    aum: '',
    trackedIndex: '',
    category: '',
    about: '',
  }

  const fromExisting = (e: ExteriorInfo): Omit<ExteriorInfo, 'ticker' | 'updatedAt'> => ({
    name: e.name,
    expenseRatio: e.expenseRatio,
    aum: e.aum,
    trackedIndex: e.trackedIndex,
    category: e.category,
    about: e.about,
  })

  const [form, setForm] = useState<Omit<ExteriorInfo, 'ticker' | 'updatedAt'>>(
    existing ? fromExisting(existing) : empty,
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(existing ? fromExisting(existing) : empty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ ticker, updatedAt: new Date().toISOString(), ...form })
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span>Informações do ETF</span>
            <span className="text-xs font-normal text-muted-foreground">{ticker}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {EXTERIOR_INFO_FIELDS.map(({ key, label, placeholder, multiline }) => (
            <div key={key}>
              <label className="block text-xs text-muted-foreground mb-1">{label}</label>
              {multiline ? (
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={3}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              ) : (
                <input
                  className={inputClass}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const ExteriorInfoSection = ({
  ticker,
  info,
  onEdit,
  onAutoSave,
}: {
  ticker: string
  info: ExteriorInfo | undefined
  onEdit: () => void
  onAutoSave?: (data: ExteriorInfo) => Promise<void>
}) => {
  const [apiData, setApiData] = useState<Investidor10ExteriorInfo>({})
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    setFetching(true)
    fetchInvestidor10ExteriorInfo(ticker)
      .then((data) => {
        setApiData(data)
        const ok = (v: string | undefined) => !!v && v.trim().length > 0
        const anyMissing = (
          [
            [info?.name, data.name],
            [info?.aum, data.aum],
            [info?.about, data.about],
          ] as [string | undefined, string | undefined][]
        ).some(([saved, api]) => ok(api) && !ok(saved))
        if (onAutoSave && anyMissing) {
          const fill = (saved: string | undefined, api: string | undefined) =>
            ok(saved) ? saved! : (api ?? '')
          onAutoSave({
            ticker,
            name: fill(info?.name, data.name),
            aum: fill(info?.aum, data.aum),
            about: fill(info?.about, data.about),
            expenseRatio: info?.expenseRatio ?? '',
            trackedIndex: info?.trackedIndex ?? '',
            category: info?.category ?? '',
            updatedAt: new Date().toISOString(),
          }).catch(() => null)
        }
      })
      .catch(() => null)
      .finally(() => setFetching(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker, info])

  const v = (apiVal: string | undefined, savedVal: string | undefined) =>
    apiVal?.trim() || savedVal?.trim() || ''

  const fields: { label: string; value: string }[] = [
    { label: 'Nome do ETF', value: v(apiData.name, info?.name) },
    { label: 'Categoria', value: info?.category ?? '' },
    { label: 'Índice Rastreado', value: info?.trackedIndex ?? '' },
    { label: 'Taxa de Administração', value: info?.expenseRatio ?? '' },
    { label: 'Patrimônio (AUM)', value: v(apiData.aum, info?.aum) },
  ].filter((f) => f.value.trim() !== '')

  const about = v(apiData.about, info?.about)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Informações do ETF
        </p>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={11} />
          {info ? 'Editar' : 'Preencher'}
        </button>
      </div>

      {fetching ? (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {['n', 'c', 'i', 'e', 'a'].map((k) => (
              <div key={k} className="space-y-1">
                <Skeleton className="h-2.5 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-border space-y-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ) : fields.length === 0 && !about ? (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma informação registrada.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border p-4 space-y-4">
          {fields.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              {fields.map((f) => (
                <div key={f.label} className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    {f.label}
                  </p>
                  <p className="text-sm font-medium text-foreground">{f.value}</p>
                </div>
              ))}
            </div>
          )}
          {about && <ExpandableText label="Sobre o ETF" text={about} />}
        </div>
      )}
    </div>
  )
}
