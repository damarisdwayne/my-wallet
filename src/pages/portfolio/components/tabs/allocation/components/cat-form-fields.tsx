import type { AssetType } from '@/types'
import { ASSET_TYPES, typeLabel } from '../../../../constants'
import { inputClass, emptyForm } from '../constants'

export const CatFormFields = ({
  form,
  set,
  prefix,
}: {
  form: ReturnType<typeof emptyForm>
  set: (k: string, v: string | AssetType[]) => void
  prefix: string
}) => {
  const toggleType = (t: AssetType) => {
    const current = form.assetTypes
    const next = current.includes(t) ? current.filter((x) => x !== t) : [...current, t]
    set('assetTypes', next)
  }

  return (
    <div className="space-y-3 mt-2">
      <div>
        <label htmlFor={`${prefix}-name`} className="text-xs text-muted-foreground mb-1 block">
          Nome
        </label>
        <input
          id={`${prefix}-name`}
          className={inputClass}
          placeholder="Ex: Ações Growth"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          autoFocus
        />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-2">Tipos de ativo incluídos</p>
        <div className="flex flex-wrap gap-1.5">
          {ASSET_TYPES.filter((t) => t !== 'other').map((t) => {
            const active = form.assetTypes.includes(t)
            return (
              <button
                key={t}
                type="button"
                onClick={() => toggleType(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                }`}
              >
                {typeLabel[t]}
              </button>
            )
          })}
        </div>
        {form.assetTypes.length === 0 && (
          <p className="text-xs text-destructive mt-1">Selecione ao menos um tipo.</p>
        )}
      </div>
      <div>
        <label htmlFor={`${prefix}-target`} className="text-xs text-muted-foreground mb-1 block">
          Meta de alocação (%)
        </label>
        <input
          id={`${prefix}-target`}
          className={inputClass}
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={form.targetPercent}
          onChange={(e) => set('targetPercent', e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${prefix}-color`} className="text-xs text-muted-foreground mb-1 block">
          Cor
        </label>
        <div className="flex items-center gap-3">
          <input
            id={`${prefix}-color`}
            type="color"
            value={form.color}
            onChange={(e) => set('color', e.target.value)}
            className="w-10 h-10 rounded-md border border-input bg-background cursor-pointer p-0.5"
          />
          <span className="text-sm text-muted-foreground font-mono">{form.color}</span>
        </div>
      </div>
    </div>
  )
}
