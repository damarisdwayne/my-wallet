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
import type { StockInfo } from '@/types'
import { fetchInvestidor10StockInfo, type Investidor10StockInfo } from '@/services/investidor10'
import { inputClass } from '../utils'
import { STOCK_INFO_FIELDS } from '../constants'

export const StockInfoDialog = ({
  ticker,
  existing,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  existing: StockInfo | undefined
  open: boolean
  onOpenChange: (v: boolean) => void
  onSave: (data: StockInfo) => Promise<void>
}) => {
  const empty: Omit<StockInfo, 'ticker' | 'updatedAt'> = {
    companyName: '',
    cnpj: '',
    sector: '',
    subsector: '',
    about: '',
    foundedYear: '',
    ipoYear: '',
    marketCap: '',
    governanceLevel: '',
    controller: '',
    geographicExposure: '',
    tagAlong: '',
  }

  const fromExisting = (e: StockInfo): Omit<StockInfo, 'ticker' | 'updatedAt'> => ({
    companyName: e.companyName,
    cnpj: e.cnpj ?? '',
    sector: e.sector,
    subsector: e.subsector,
    about: e.about,
    foundedYear: e.foundedYear,
    ipoYear: e.ipoYear,
    marketCap: e.marketCap,
    governanceLevel: e.governanceLevel,
    controller: e.controller,
    geographicExposure: e.geographicExposure,
    tagAlong: e.tagAlong,
  })

  const [form, setForm] = useState<Omit<StockInfo, 'ticker' | 'updatedAt'>>(
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
            <span>Informações da Empresa</span>
            <span className="text-xs font-normal text-muted-foreground">{ticker}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          {STOCK_INFO_FIELDS.map(({ key, label, placeholder, multiline }) => (
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

export const StockInfoSection = ({
  ticker,
  previousTickers,
  info,
  onEdit,
  onAutoSave,
}: {
  ticker: string
  previousTickers?: string[]
  info: StockInfo | undefined
  onEdit: () => void
  onAutoSave?: (data: StockInfo) => Promise<void>
}) => {
  const [apiData, setApiData] = useState<Investidor10StockInfo>({})
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    setFetching(true)
    fetchInvestidor10StockInfo(ticker, previousTickers ?? [])
      .then((data) => {
        setApiData(data)
        const ok = (v: string | undefined) => !!v && v.trim().length > 0
        if (!info && onAutoSave && (ok(data.name) || ok(data.sector))) {
          onAutoSave({
            ticker,
            companyName: data.name ?? '',
            sector: data.sector ?? '',
            subsector: data.subsector ?? '',
            cnpj: '',
            about: data.about ?? '',
            foundedYear: data.foundedYear ?? '',
            ipoYear: data.ipoYear ?? '',
            marketCap: data.marketCap ?? '',
            governanceLevel: '',
            controller: '',
            geographicExposure: '',
            tagAlong: data.tagAlong ?? '',
            updatedAt: new Date().toISOString(),
          }).catch(() => null)
        }
      })
      .catch(() => null)
      .finally(() => setFetching(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker])

  const v = (apiVal: string | undefined, savedVal: string | undefined) =>
    apiVal?.trim() || savedVal?.trim() || ''

  const fields: { label: string; value: string }[] = [
    { label: 'Nome da Empresa', value: v(apiData.name, info?.companyName) },
    { label: 'CNPJ', value: info?.cnpj ?? '' },
    { label: 'Setor', value: v(apiData.sector, info?.sector) },
    { label: 'Subsetor / Segmento', value: v(apiData.subsector, info?.subsector) },
    { label: 'Fundação', value: v(apiData.foundedYear, info?.foundedYear) },
    { label: 'IPO', value: v(apiData.ipoYear, info?.ipoYear) },
    { label: 'Valor de Mercado', value: v(apiData.marketCap, info?.marketCap) },
    { label: 'Governança', value: info?.governanceLevel ?? '' },
    { label: 'Controlador', value: info?.controller ?? '' },
    { label: 'Exposição Geográfica', value: info?.geographicExposure ?? '' },
    { label: 'Tag Along', value: v(apiData.tagAlong, info?.tagAlong) },
    { label: 'Sobre a Empresa', value: v(apiData.about, info?.about) },
  ].filter((f) => f.value.trim() !== '')

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Informações da Empresa
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
            {['n', 'c', 's', 'sg', 'f', 'ipo', 'vm', 'g'].map((k) => (
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
      ) : fields.length > 0 ? (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {fields
              .filter((f) => f.label !== 'Sobre a Empresa')
              .map((f) => (
                <div key={f.label} className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    {f.label}
                  </p>
                  <p className="text-sm font-medium text-foreground break-words">{f.value}</p>
                </div>
              ))}
          </div>
          {fields.find((f) => f.label === 'Sobre a Empresa') && (
            <div className="pt-3 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                Sobre a Empresa
              </p>
              <p className="text-sm text-foreground leading-relaxed">
                {fields.find((f) => f.label === 'Sobre a Empresa')?.value}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma informação registrada.</p>
        </div>
      )}
    </div>
  )
}
