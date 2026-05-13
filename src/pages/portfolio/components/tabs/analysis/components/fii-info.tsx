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
import type { FiiInfo } from '@/types'
import { fetchInvestidor10FiiInfo, type Investidor10FiiInfo } from '@/services/investidor10'
import { inputClass } from '../utils'
import { FII_INFO_FIELDS } from '../constants'
import { ExpandableText } from './expandable-text'

export const FiiInfoDialog = ({
  ticker,
  existing,
  apiAbout,
  open,
  onOpenChange,
  onSave,
}: {
  ticker: string
  existing: FiiInfo | undefined
  apiAbout?: string
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
    about: '',
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
          about: existing.about || apiAbout || '',
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
              about: existing.about || apiAbout || '',
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
          {FII_INFO_FIELDS.map(({ key, label, placeholder, multiline }) => (
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

export const FiiInfoSection = ({
  ticker,
  previousTickers,
  info,
  onAutoSave,
}: {
  ticker: string
  previousTickers?: string[]
  info: FiiInfo | undefined
  onAutoSave?: (data: FiiInfo) => Promise<void>
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [apiData, setApiData] = useState<Investidor10FiiInfo>({})
  const [fetching, setFetching] = useState(true)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFetching(true)
    fetchInvestidor10FiiInfo(ticker, previousTickers ?? [])
      .then((data) => {
        setApiData(data)
        const ok = (v: string | undefined) => !!v && v.trim().length > 0
        const anyMissing = (
          [
            [info?.longName, data.name],
            [info?.segment, data.segment],
            [info?.about, data.about],
          ] as [string | undefined, string | undefined][]
        ).some(([saved, api]) => ok(api) && !ok(saved))
        if (onAutoSave && anyMissing) {
          const fill = (saved: string | undefined, api: string | undefined) =>
            ok(saved) ? saved! : (api ?? '')
          onAutoSave({
            ticker,
            longName: fill(info?.longName, data.name),
            segment: fill(info?.segment, data.segment),
            about: fill(info?.about, data.about),
            cnpj: info?.cnpj ?? '',
            startDate: info?.startDate ?? '',
            marketCap: fill(info?.marketCap, data.marketCap),
            adminName: info?.adminName ?? '',
            adminFee: fill(info?.adminFee, data.adminFee),
            performanceFee: info?.performanceFee ?? '',
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
    { label: 'Nome do Fundo', value: v(apiData.name, info?.longName) },
    { label: 'CNPJ', value: info?.cnpj ?? '' },
    { label: 'Início', value: info?.startDate ?? '' },
    { label: 'Segmento', value: v(apiData.segment, info?.segment) },
    { label: 'Valor de Mercado', value: v(apiData.marketCap, info?.marketCap) },
    { label: 'Administradora / Gestora', value: info?.adminName ?? '' },
    { label: 'Taxa de Adm.', value: v(apiData.adminFee, info?.adminFee) },
    { label: 'Taxa de Performance', value: info?.performanceFee ?? '' },
  ].filter((f) => f.value.trim() !== '')

  const about = v(apiData.about, info?.about)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Informações do Fundo
        </p>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={11} />
          {info ? 'Editar' : 'Preencher'}
        </button>
      </div>
      {fetching ? (
        <div className="rounded-lg border border-border p-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
            {['n', 'c', 'i', 's', 'vm', 'a', 'ta', 'tp'].map((k) => (
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
      ) : fields.length > 0 || about ? (
        <div className="rounded-lg border border-border p-4 space-y-4">
          {fields.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
              {fields.map((f) => (
                <div key={f.label} className="min-w-0">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                    {f.label}
                  </p>
                  <p className="text-sm font-medium text-foreground wrap-break-word">{f.value}</p>
                </div>
              ))}
            </div>
          )}
          {about && <ExpandableText label="Sobre o Fundo" text={about} />}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">Nenhuma informação registrada.</p>
        </div>
      )}
      <FiiInfoDialog
        ticker={ticker}
        existing={info}
        apiAbout={apiData.about}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={async (data) => {
          await onAutoSave?.(data)
          setDialogOpen(false)
        }}
      />
    </div>
  )
}
