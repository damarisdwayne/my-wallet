import { Check, Pencil } from 'lucide-react'

export interface IndicatorField {
  label: string
  value: string
}

export interface IndicatorEdit {
  editing: boolean
  values: Record<string, string>
  onToggle: () => void
  onChange: (label: string, value: string) => void
}

// The prompts emit "não informado" when an indicator can't be found/computed in the document.
const isMissing = (value: string) => !value || /^n[ãa]o\s+(informad|encontrad|dispon)/i.test(value)

const cleanValue = (value: string) => value.replace(/\s*\(calc[^)]*\)\s*/i, '').trim()

// Short numeric/label values become compact chips; long prose (qualitative indicators) gets a
// full-width block instead — cramming it into a tiny card looks bad.
const isLong = (value: string) => cleanValue(value).length > 32

const editValueOf = (edit: IndicatorEdit, field: IndicatorField) =>
  edit.values[field.label] ?? (isMissing(field.value) ? '' : cleanValue(field.value))

const editInputClass =
  'mt-1 w-full rounded border border-input bg-background px-1.5 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring'

const FieldInput = ({ field, edit }: { field: IndicatorField; edit: IndicatorEdit }) => (
  <input
    className={editInputClass}
    value={editValueOf(edit, field)}
    placeholder="—"
    onChange={(e) => edit.onChange(field.label, e.target.value)}
  />
)

// A short numeric/label indicator, shown as a compact card. Missing ones stay visible (dashed).
const NumericChip = ({ field, edit }: { field: IndicatorField; edit?: IndicatorEdit }) => {
  // A user edit (even if it's the same field) overrides the AI's original value when displaying.
  const edited = edit?.values[field.label]
  const raw = edited ?? field.value
  const missing = isMissing(raw)
  const computed = edited === undefined && /\(calc[^)]*\)/i.test(field.value)

  return (
    <div
      className={`rounded-lg border px-3 py-2 ${
        missing && !edit?.editing
          ? 'border-dashed border-border/60 bg-muted/20'
          : 'border-border bg-card'
      }`}
    >
      <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {field.label}
      </p>
      {edit?.editing ? (
        <FieldInput field={field} edit={edit} />
      ) : missing ? (
        <p className="mt-0.5 text-xs italic text-muted-foreground/50">não encontrado</p>
      ) : (
        <p className="mt-0.5 text-sm font-semibold leading-snug text-foreground">
          {cleanValue(raw)}
          {computed && (
            <span className="ml-1 align-middle text-[9px] font-normal text-primary/60">calc.</span>
          )}
        </p>
      )}
    </div>
  )
}

// A qualitative indicator with long text — rendered full-width as label + paragraph, no card.
const TextRow = ({ field, edit }: { field: IndicatorField; edit?: IndicatorEdit }) => {
  const edited = edit?.values[field.label]
  const raw = edited ?? field.value
  const missing = isMissing(raw)

  return (
    <div className="space-y-0.5">
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {field.label}
      </p>
      {edit?.editing ? (
        <FieldInput field={field} edit={edit} />
      ) : missing ? (
        <p className="text-xs italic text-muted-foreground/50">não encontrado</p>
      ) : (
        <p className="text-sm leading-relaxed text-foreground">{cleanValue(raw)}</p>
      )}
    </div>
  )
}

// Renders a run of "**Rótulo:** valor" lines: short ones in a chip grid (including the missing
// ones, shown dashed, so the user knows what to fill in), long ones as full-width text. When an
// `edit` config is passed, a pencil toggles inputs so the user can correct/fill the values.
export const IndicatorGrid = ({
  fields,
  edit,
}: {
  fields: IndicatorField[]
  edit?: IndicatorEdit
}) => {
  const chips = fields.filter((f) => !isLong(f.value))
  const rows = fields.filter((f) => isLong(f.value))

  return (
    <div className="space-y-3">
      {edit && (
        <div className="flex justify-end">
          <button
            onClick={edit.onToggle}
            className="flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {edit.editing ? <Check size={11} /> : <Pencil size={11} />}
            {edit.editing ? 'Concluir edição' : 'Editar indicadores'}
          </button>
        </div>
      )}
      {chips.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {chips.map((f) => (
            <NumericChip key={f.label} field={f} edit={edit} />
          ))}
        </div>
      )}
      {rows.map((f) => (
        <TextRow key={f.label} field={f} edit={edit} />
      ))}
    </div>
  )
}
