import { useState, type KeyboardEvent, type MouseEvent } from 'react'
import { Pencil, RotateCcw } from 'lucide-react'
import { Input, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui'
import { cn, formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

interface Props {
  value: number
  overridden: boolean
  max: number
  onChange: (value: number | null) => void
}

const stop = (e: MouseEvent | KeyboardEvent) => e.stopPropagation()

export const CategoryAporteEditor = ({ value, overridden, max, onChange }: Props) => {
  const { hideValues } = usePrivacy()
  const [draft, setDraft] = useState<string | null>(null)

  const commit = () => {
    if (draft === null) return
    const parsed = Number.parseFloat(draft.replace(',', '.'))
    setDraft(null)
    if (Number.isNaN(parsed)) return
    onChange(Math.min(Math.max(0, parsed), max))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    stop(e)
    if (e.key === 'Enter') commit()
    if (e.key === 'Escape') setDraft(null)
  }

  if (draft !== null)
    return (
      <Input
        type="number"
        min={0}
        max={max}
        step="any"
        className="h-7 w-28 text-right text-sm"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onClick={stop}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        autoFocus
      />
    )

  return (
    <span className="flex items-center gap-1.5">
      {overridden && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                stop(e)
                onChange(null)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={12} />
            </button>
          </TooltipTrigger>
          <TooltipContent>Voltar ao valor sugerido</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={(e) => {
              stop(e)
              setDraft(value.toFixed(2))
            }}
            className={cn(
              'group flex items-center gap-1 font-semibold text-sm min-w-20 justify-end',
              overridden ? 'text-warning' : 'text-foreground',
            )}
          >
            <Pencil
              size={11}
              className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
            />
            {hideValues ? MASK : formatCurrency(value)}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {overridden
            ? 'Valor editado por você — a diferença foi redistribuída'
            : 'Editar valor desta categoria'}
        </TooltipContent>
      </Tooltip>
    </span>
  )
}
