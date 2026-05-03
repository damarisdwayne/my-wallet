import { useState } from 'react'
import { Pencil } from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components'
import { formatCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'
import { INPUT_CLASS } from '../constants'

type SalaryCardProps = {
  salary: number
  isCurrentMonth: boolean
  onSave: (amount: number) => Promise<void>
}

const SalaryCard = ({ salary, isCurrentMonth, onSave }: SalaryCardProps) => {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { hideValues } = usePrivacy()

  const handleSave = async () => {
    const parsed = Number.parseFloat(input.replace(',', '.'))
    if (!Number.isNaN(parsed) && parsed > 0) await onSave(parsed)
    setOpen(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Salário líquido</CardTitle>
          {isCurrentMonth && (
            <Dialog
              open={open}
              onOpenChange={(o) => {
                if (o) setInput(String(salary || ''))
                setOpen(o)
              }}
            >
              <DialogTrigger asChild>
                <button className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <Pencil size={14} />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Atualizar salário líquido</DialogTitle>
                  <DialogDescription>Informe o seu salário líquido atual.</DialogDescription>
                </DialogHeader>
                <div className="space-y-1.5">
                  <label htmlFor="salary" className="text-sm font-medium text-foreground">
                    Salário líquido (R$)
                  </label>
                  <input
                    id="salary"
                    type="number"
                    min="0"
                    step="0.01"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    className={INPUT_CLASS}
                    placeholder="0,00"
                    autoFocus
                  />
                </div>
                <DialogFooter>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                  >
                    Salvar
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <CardValue>{hideValues ? MASK : formatCurrency(salary)}</CardValue>
      </CardHeader>
    </Card>
  )
}

type Props = {
  salary: number
  grand: number
  leftover: number
  spentPct: number
  isCurrentMonth: boolean
  onSaveSalary: (amount: number) => Promise<void>
}

export const SummaryCards = ({
  salary,
  grand,
  leftover,
  spentPct,
  isCurrentMonth,
  onSaveSalary,
}: Props) => {
  const { hideValues } = usePrivacy()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SalaryCard salary={salary} isCurrentMonth={isCurrentMonth} onSave={onSaveSalary} />
      <Card>
        <CardHeader>
          <CardTitle>Total gasto</CardTitle>
          <CardValue className="text-destructive">
            {hideValues ? MASK : formatCurrency(grand)}
          </CardValue>
          {salary > 0 && !hideValues && (
            <p className="text-xs text-muted-foreground">{spentPct.toFixed(1)}% do salário</p>
          )}
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sobrou</CardTitle>
          <CardValue className={leftover >= 0 ? 'text-success' : 'text-destructive'}>
            {hideValues ? MASK : formatCurrency(leftover)}
          </CardValue>
          {salary > 0 && !hideValues && (
            <p className="text-xs text-muted-foreground">
              {((leftover / salary) * 100).toFixed(1)}% do salário
            </p>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}
