import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { FiiInfo } from '@/types'
import { fetchMfinanceFiiInfo } from '@/services/fundamentals'
import { inputClass } from '../utils'
import { FII_INFO_FIELDS } from '../constants'

export const FiiInfoDialog = ({
  ticker,
  existing,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  existing: FiiInfo | undefined
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: FiiInfo) => Promise<void>
}) => {
  const empty = {
    longName: '',
    cnpj: '',
    startDate: '',
    segment: '',
    marketCap: '',
    adminName: '',
    adminFee: '',
    performanceFee: '',
  }
  const [form, setForm] = useState<Omit<FiiInfo, 'ticker' | 'updatedAt'>>(
    existing
      ? {
          longName: existing.longName,
          cnpj: existing.cnpj,
          startDate: existing.startDate,
          segment: existing.segment,
          marketCap: existing.marketCap,
          adminName: existing.adminName,
          adminFee: existing.adminFee,
          performanceFee: existing.performanceFee,
        }
      : empty,
  )
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(
        existing
          ? {
              longName: existing.longName,
              cnpj: existing.cnpj,
              startDate: existing.startDate,
              segment: existing.segment,
              marketCap: existing.marketCap,
              adminName: existing.adminName,
              adminFee: existing.adminFee,
              performanceFee: existing.performanceFee,
            }
          : empty,
      )
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <span>Informações do Fundo</span>
            <span className="text-xs font-normal text-muted-foreground">{ticker}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {FII_INFO_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-xs text-muted-foreground mb-1">{label}</label>
              <input
                className={inputClass}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              />
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

export const FiiInfoSection = ({
  ticker,
  previousTickers,
  info,
  onEdit,
  onAutoSave,
}: {
  ticker: string
  previousTickers?: string[]
  info: FiiInfo | undefined
  onEdit: () => void
  onAutoSave?: (data: FiiInfo) => Promise<void>
}) => {
  const [apiData, setApiData] = useState<Partial<{ name: string; segment: string }>>({})

  useEffect(() => {
    fetchMfinanceFiiInfo(ticker, previousTickers ?? [])
      .then((data) => {
        setApiData(data)
        if (!info && onAutoSave && (data.name || data.segment)) {
          onAutoSave({
            ticker,
            longName: data.name ?? '',
            segment: data.segment ?? '',
            cnpj: '',
            startDate: '',
            marketCap: '',
            adminName: '',
            adminFee: '',
            performanceFee: '',
            updatedAt: new Date().toISOString(),
          }).catch(() => null)
        }
      })
      .catch(() => null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker])

  const v = (apiVal: string | undefined, savedVal: string | undefined) => {
    const api = apiVal?.trim()
    return api && !api.startsWith('#') ? api : savedVal?.trim() || ''
  }

  const fields: { label: string; value: string }[] = [
    { label: 'Nome do Fundo', value: v(apiData.name, info?.longName) },
    { label: 'CNPJ', value: info?.cnpj ?? '' },
    { label: 'Início', value: info?.startDate ?? '' },
    { label: 'Segmento', value: v(apiData.segment, info?.segment) },
    { label: 'Valor de Mercado', value: info?.marketCap ?? '' },
    { label: 'Administradora / Gestora', value: info?.adminName ?? '' },
    { label: 'Taxa de Adm.', value: info?.adminFee ?? '' },
    { label: 'Taxa de Performance', value: info?.performanceFee ?? '' },
  ].filter((f) => f.value.trim() !== '')

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Informações do Fundo
        </p>
        <button
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={11} />
          {info ? 'Editar' : 'Preencher'}
        </button>
      </div>
      {fields.length > 0 ? (
        <div className="rounded-lg border border-border p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                {f.label}
              </p>
              <p className="text-sm font-medium text-foreground break-words">{f.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma informação registrada.</p>
        </div>
      )}
    </div>
  )
}
