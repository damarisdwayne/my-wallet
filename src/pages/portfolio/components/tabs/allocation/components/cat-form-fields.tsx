import { Plus } from 'lucide-react'
import type { AssetType, CategoryTracking, Diagram } from '@/types'
import { ASSET_TYPES, typeLabel } from '../../../../constants'
import { inputClass, emptyForm } from '../constants'

const TRACKING_OPTIONS: { value: CategoryTracking; label: string; desc: string }[] = [
  { value: 'both', label: 'Meta + Diagrama', desc: 'Define % alvo e usa diagrama de qualificação' },
  { value: 'goal_only', label: 'Só Meta', desc: 'Apenas meta de alocação percentual' },
  { value: 'diagram_only', label: 'Só Diagrama', desc: 'Qualifica ativos sem meta fixa' },
  { value: 'none', label: 'Nenhum', desc: 'Apenas agrupa ativos por categoria' },
]

const hasDiagram = (tracking: CategoryTracking) =>
  tracking === 'both' || tracking === 'diagram_only'

export const CatFormFields = ({
  form,
  set,
  prefix,
  diagrams,
}: {
  form: ReturnType<typeof emptyForm>
  set: (k: string, v: string | AssetType[]) => void
  prefix: string
  diagrams: Diagram[]
}) => {
  const toggleType = (t: AssetType) => {
    const current = form.assetTypes
    const next = current.includes(t) ? current.filter((x) => x !== t) : [...current, t]
    set('assetTypes', next)
  }

  return (
    <div className="space-y-4 mt-2">
      {/* Name */}
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

      {/* Asset types */}
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

      {/* Tracking mode */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Modo de acompanhamento</p>
        <div className="grid grid-cols-2 gap-2">
          {TRACKING_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('tracking', opt.value)}
              className={`text-left px-3 py-2 rounded-md border text-xs transition-colors ${
                form.tracking === opt.value
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <p className="font-medium">{opt.label}</p>
              <p className="text-[10px] mt-0.5 opacity-75">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Target % — only when tracking includes goal */}
      {(form.tracking === 'both' || form.tracking === 'goal_only') && (
        <div>
          <label
            htmlFor={`${prefix}-target`}
            className="text-xs text-muted-foreground mb-1 block"
          >
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
      )}

      {/* Diagram link — only when tracking includes diagram */}
      {hasDiagram(form.tracking) && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">Diagrama vinculado</p>
          <select
            className={inputClass}
            value={form.selectedDiagramId}
            onChange={(e) => {
              set('selectedDiagramId', e.target.value)
              if (e.target.value !== 'new') set('newDiagramName', '')
            }}
          >
            <option value="">Nenhum (criar depois)</option>
            {diagrams.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.questions.length} perguntas)
              </option>
            ))}
            <option value="new">+ Criar novo diagrama</option>
          </select>

          {form.selectedDiagramId === 'new' && (
            <div className="mt-2 flex gap-2 items-center">
              <Plus size={13} className="text-muted-foreground shrink-0" />
              <input
                className={inputClass}
                placeholder="Nome do novo diagrama"
                value={form.newDiagramName}
                onChange={(e) => set('newDiagramName', e.target.value)}
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* Color */}
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
