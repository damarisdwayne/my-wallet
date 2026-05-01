// ─── IR table ───────────────────────────────────────────────────────────────

export const IR_RATES = [
  { label: 'Até 180 dias', maxDays: 180, rate: 0.225 },
  { label: '181 a 360 dias', maxDays: 360, rate: 0.2 },
  { label: '361 a 720 dias', maxDays: 720, rate: 0.175 },
  { label: 'Acima de 720 dias', maxDays: Number.POSITIVE_INFINITY, rate: 0.15 },
]

export const getIrRate = (days: number) => {
  for (const bracket of IR_RATES) {
    if (days <= bracket.maxDays) return bracket
  }
  return IR_RATES[3]
}

// ─── Period helpers ──────────────────────────────────────────────────────────

export type PeriodUnit = 'dias' | 'meses' | 'anos'

export const PERIOD_UNITS: { value: PeriodUnit; label: string; placeholder: string }[] = [
  { value: 'dias', label: 'dia(s)', placeholder: 'ex: 365' },
  { value: 'meses', label: 'mês(es)', placeholder: 'ex: 12' },
  { value: 'anos', label: 'ano(s)', placeholder: 'ex: 1' },
]

export const toDays = (value: number, unit: PeriodUnit) => {
  if (unit === 'meses') return value * 30.4375
  if (unit === 'anos') return value * 365
  return value
}

export const toMonths = (value: number, unit: PeriodUnit) => {
  if (unit === 'dias') return value / 30.4375
  if (unit === 'anos') return value * 12
  return value
}

// ─── Formatter ───────────────────────────────────────────────────────────────

export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// ─── Input components ────────────────────────────────────────────────────────

const inputCls =
  'flex-1 min-w-0 px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none'

const groupCls =
  'flex rounded-md border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary'

const prefixCls =
  'flex items-center px-3 bg-muted text-muted-foreground text-sm font-medium border-r border-border shrink-0 select-none'

const suffixSelectCls =
  'px-2 py-2 text-sm bg-background text-foreground border-l border-border focus:outline-none shrink-0 cursor-pointer'

/** Labeled wrapper */
export const Field = ({
  id,
  label,
  children,
}: {
  id?: string
  label: string
  children: React.ReactNode
}) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="text-sm text-muted-foreground block">
      {label}
    </label>
    {children}
  </div>
)

/** [R$] [input] */
export const CurrencyInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = '00,00',
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) => (
  <Field id={id} label={label}>
    <div className={groupCls}>
      <span className={prefixCls}>R$</span>
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  </Field>
)

/**
 * [%] [input] [optional inline select]
 * Pass showPrefix={false} to omit the % badge — use when the suffix select
 * already conveys the unit (e.g. "Prefixado / % CDI / IPCA+").
 */
export const PercentInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = '0',
  showPrefix = true,
  selectValue,
  selectOptions,
  onSelectChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  showPrefix?: boolean
  selectValue?: string
  selectOptions?: { value: string; label: string }[]
  onSelectChange?: (v: string) => void
}) => (
  <Field id={id} label={label}>
    <div className={groupCls}>
      {showPrefix && <span className={prefixCls}>%</span>}
      <input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
      {selectOptions && onSelectChange && (
        <select
          value={selectValue}
          onChange={(e) => onSelectChange(e.target.value)}
          className={suffixSelectCls}
        >
          {selectOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      )}
    </div>
  </Field>
)

/** [input] [unit select] */
export const PeriodInput = ({
  id,
  label,
  value,
  onChange,
  unit,
  onUnitChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  unit: PeriodUnit
  onUnitChange: (u: PeriodUnit) => void
}) => {
  const placeholder = PERIOD_UNITS.find((u) => u.value === unit)?.placeholder ?? '1'
  return (
    <Field id={id} label={label}>
      <div className={groupCls}>
        <input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputCls}
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as PeriodUnit)}
          className={suffixSelectCls}
        >
          {PERIOD_UNITS.map((u) => (
            <option key={u.value} value={u.value}>{u.label}</option>
          ))}
        </select>
      </div>
    </Field>
  )
}

/** [input type=date] */
export const DateInput = ({
  id,
  label,
  value,
  onChange,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
}) => (
  <Field id={id} label={label}>
    <div className={groupCls}>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    </div>
  </Field>
)

/** Plain labeled select */
export const SelectField = ({
  id,
  label,
  value,
  onChange,
  options,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) => (
  <Field id={id} label={label}>
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </Field>
)

/** Calcular + Limpar row */
export const CalcActions = ({
  onCalc,
  onClear,
}: {
  onCalc: () => void
  onClear: () => void
}) => (
  <div className="flex items-center gap-4">
    <button
      onClick={onCalc}
      className="px-8 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
    >
      Calcular
    </button>
    <button
      onClick={onClear}
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      Limpar
    </button>
  </div>
)
