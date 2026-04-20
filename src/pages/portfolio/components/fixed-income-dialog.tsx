import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Asset, FixedIncomeType, RateType } from '@/types'

const FIXED_INCOME_TYPES: FixedIncomeType[] = [
  'CDB',
  'LCI',
  'LCA',
  'LCE',
  'CRI',
  'CRA',
  'Debenture',
  'Tesouro IPCA+',
  'Tesouro Selic',
  'Tesouro Prefixado',
  'Outros',
]

const RATE_TYPE_LABEL: Record<RateType, string> = {
  prefixado: 'Prefixado',
  pos_cdi: 'CDI',
  ipca_plus: 'IPCA+',
  igpm_plus: 'IGP-M+',
  pos_selic: 'SELIC',
}

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const Label = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs text-muted-foreground mb-1 block">{children}</label>
)

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: { id: string; name: string }[]
  onAdd: (asset: Asset) => Promise<void>
}

const empty = () => ({
  name: '',
  fixedIncomeType: 'CDB' as FixedIncomeType,
  institution: '',
  issuer: '',
  rateType: 'pos_cdi' as RateType,
  indexerRate: '100',
  prefixedRate: '',
  totalInvested: '',
  operationDate: '',
  maturityDate: '',
  categoryId: '',
})

export const FixedIncomeDialog = ({ open, onOpenChange, categories, onAdd }: Props) => {
  const [form, setForm] = useState(empty())
  const [saving, setSaving] = useState(false)

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }))

  const fixedIncomeCategories = categories.filter((c) => {
    return true // show all categories so user can pick the right one
  })

  const handleSave = async () => {
    const invested = Number.parseFloat(form.totalInvested)
    if (!form.name || invested <= 0) return
    setSaving(true)
    try {
      const ticker = `${form.fixedIncomeType}${form.institution ? `-${form.institution.toUpperCase().slice(0, 8)}` : ''}`
      const asset: Asset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        ticker,
        name: form.name,
        type: 'fixed_income',
        categoryId: form.categoryId,
        quantity: 1,
        avgPrice: invested,
        currentPrice: invested,
        targetPercent: 0,
        institution: form.institution || undefined,
        fixedIncomeType: form.fixedIncomeType,
        rateType: form.rateType,
        indexerRate: form.rateType !== 'prefixado' ? Number.parseFloat(form.indexerRate) || undefined : undefined,
        prefixedRate: form.rateType === 'prefixado' ? Number.parseFloat(form.prefixedRate) || undefined : undefined,
        maturityDate: form.maturityDate || undefined,
        operationDate: form.operationDate || undefined,
        issuer: form.issuer || undefined,
      }
      await onAdd(asset)
      setForm(empty())
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  const showIndexerRate = form.rateType !== 'prefixado'
  const showPrefixedRate = form.rateType === 'prefixado'

  const rateLabel: Record<RateType, string> = {
    prefixado: 'Taxa a.a. (%)',
    pos_cdi: '% do CDI',
    ipca_plus: 'IPCA + (% a.a.)',
    igpm_plus: 'IGP-M + (% a.a.)',
    pos_selic: '% da SELIC',
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) setForm(empty())
      }}
    >
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Incluir Renda Fixa</DialogTitle>
          <DialogDescription>Preencha os dados do investimento.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          <div>
            <Label>Descrição / Nome</Label>
            <input
              className={inputClass}
              placeholder="Ex: CDB Nubank 110% CDI"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Tipo</Label>
              <select
                className={inputClass}
                value={form.fixedIncomeType}
                onChange={(e) => set('fixedIncomeType', e.target.value)}
              >
                {FIXED_INCOME_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Operação</Label>
              <select className={inputClass} defaultValue="aplicacao" disabled>
                <option value="aplicacao">Aplicação</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Data de aplicação</Label>
              <input
                className={inputClass}
                type="date"
                value={form.operationDate}
                onChange={(e) => set('operationDate', e.target.value)}
              />
            </div>
            <div>
              <Label>Instituição</Label>
              <input
                className={inputClass}
                placeholder="Nubank, Inter, XP..."
                value={form.institution}
                onChange={(e) => set('institution', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Tipo de Taxa</Label>
              <select
                className={inputClass}
                value={form.rateType}
                onChange={(e) => set('rateType', e.target.value)}
              >
                {(Object.entries(RATE_TYPE_LABEL) as [RateType, string][]).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Vencimento</Label>
              <input
                className={inputClass}
                type="date"
                value={form.maturityDate}
                onChange={(e) => set('maturityDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Indexador / {rateLabel[form.rateType]}</Label>
              {showIndexerRate && (
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.1}
                  placeholder={form.rateType === 'pos_cdi' ? '110' : '6,5'}
                  value={form.indexerRate}
                  onChange={(e) => set('indexerRate', e.target.value)}
                />
              )}
              {showPrefixedRate && (
                <input
                  className={inputClass}
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="12.5"
                  value={form.prefixedRate}
                  onChange={(e) => set('prefixedRate', e.target.value)}
                />
              )}
            </div>
            <div>
              <Label>Emissor (opcional)</Label>
              <input
                className={inputClass}
                placeholder="Banco XYZ"
                value={form.issuer}
                onChange={(e) => set('issuer', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Total investido (R$)</Label>
              <input
                className={inputClass}
                type="number"
                min={0}
                step={0.01}
                placeholder="5000.00"
                value={form.totalInvested}
                onChange={(e) => set('totalInvested', e.target.value)}
              />
            </div>
            <div>
              <Label>Categoria</Label>
              <select
                className={inputClass}
                value={form.categoryId}
                onChange={(e) => set('categoryId', e.target.value)}
              >
                <option value="">Sem categoria</option>
                {fixedIncomeCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            disabled={!form.name || !form.totalInvested || saving}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {saving ? 'Salvando...' : 'Confirmar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
