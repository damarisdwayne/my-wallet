import { ASSET_TYPES, typeLabel } from '../../../../constants'
import { inputClass, emptyForm } from '../constants'

export const CatFormFields = ({
  form,
  set,
  prefix,
}: {
  form: ReturnType<typeof emptyForm>
  set: (k: string, v: string) => void
  prefix: string
}) => (
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
      <label htmlFor={`${prefix}-type`} className="text-xs text-muted-foreground mb-1 block">
        Tipo de ativo
      </label>
      <select
        id={`${prefix}-type`}
        className={inputClass}
        value={form.type}
        onChange={(e) => set('type', e.target.value)}
      >
        {ASSET_TYPES.map((t) => (
          <option key={t} value={t}>
            {typeLabel[t]}
          </option>
        ))}
      </select>
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
