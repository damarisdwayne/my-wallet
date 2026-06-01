import { useMemo, useRef, useState } from 'react'
import { Trash2, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { guessCategory, parseOFX } from '@/services/ofx-import'
import type { Expense, ExpenseCategory } from '@/types'
import { categoryColors, categoryLabel } from '../../utils'

interface Row {
  fitId: string
  date: string
  amount: number
  description: string
  isDebit: boolean
  isExpense: boolean
  category: ExpenseCategory
  duplicate: boolean
  selected: boolean
}

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const DUP_TIP =
  'Já importado: este lançamento (mesmo FITID) já existe. Desmarcado para não duplicar.'

interface Props {
  existingExpenses: Expense[]
  onImport: (items: Omit<Expense, 'id'>[]) => Promise<void>
}

export const OFXImportDialog = ({ existingExpenses, onImport }: Props) => {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<Row[]>([])
  const [onlyDebits, setOnlyDebits] = useState(true)
  const [hideNonExpenses, setHideNonExpenses] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const existingFitIds = useMemo(
    () => new Set(existingExpenses.map((e) => e.fitId).filter(Boolean)),
    [existingExpenses],
  )

  const handleFile = (file: File) => {
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const buffer = e.target?.result as ArrayBuffer
      try {
        // try UTF-8 first, then Windows-1252 fallback
        let content = new TextDecoder('utf-8').decode(buffer)
        let txs = parseOFX(content)
        if (txs.length === 0) {
          content = new TextDecoder('windows-1252').decode(buffer)
          txs = parseOFX(content)
        }
        if (txs.length === 0) {
          setError('Nenhuma transação encontrada. Certifique-se de que o arquivo é um OFX válido.')
          return
        }
        setRows(
          txs.map((t) => {
            const duplicate = existingFitIds.has(t.fitId)
            return {
              ...t,
              category: guessCategory(t.description),
              duplicate,
              selected: t.isDebit && t.isExpense && !duplicate,
            }
          }),
        )
      } catch {
        setError('Não foi possível ler o arquivo. Verifique se é um OFX válido.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const visible = rows.filter((r) => {
    if (onlyDebits && !r.isDebit) return false
    if (hideNonExpenses && !r.isExpense) return false
    return true
  })
  const selectedCount = visible.filter((r) => r.selected).length
  const dupCount = visible.filter((r) => r.duplicate).length

  const toggleAll = (checked: boolean) =>
    setRows((prev) =>
      prev.map((r) => {
        if (onlyDebits && !r.isDebit) return r
        if (hideNonExpenses && !r.isExpense) return r
        return { ...r, selected: checked }
      }),
    )

  const toggleRow = (fitId: string, checked: boolean) =>
    setRows((prev) => prev.map((r) => (r.fitId === fitId ? { ...r, selected: checked } : r)))

  const setCategory = (fitId: string, category: ExpenseCategory) =>
    setRows((prev) => prev.map((r) => (r.fitId === fitId ? { ...r, category } : r)))

  const removeRow = (fitId: string) => setRows((prev) => prev.filter((r) => r.fitId !== fitId))

  const handleImport = async () => {
    const selected = rows.filter((r) => r.selected && (onlyDebits ? r.isDebit : true))
    if (selected.length === 0) return
    setLoading(true)
    try {
      await onImport(
        selected.map((r) => ({
          description: r.description,
          amount: r.amount,
          category: r.category,
          date: r.date,
          source: 'bank' as const,
          fitId: r.fitId,
        })),
      )
      setOpen(false)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) {
      setRows([])
      setError('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors">
          <Upload size={15} />
          <span className="hidden sm:inline">OFX</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar extrato OFX</DialogTitle>
        </DialogHeader>

        {rows.length === 0 ? (
          <div
            className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors"
            onClick={() => fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload size={28} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Arraste um arquivo <span className="text-foreground font-medium">.ofx</span> aqui ou{' '}
              <span className="text-primary underline">clique para selecionar</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Compatível com Itaú, Bradesco, Nubank, Santander, BB, Caixa e outros
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <input
              ref={fileRef}
              type="file"
              accept=".ofx,.OFX"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4 shrink-0">
              <p className="text-sm text-muted-foreground">
                {visible.length} transaç{visible.length === 1 ? 'ão' : 'ões'} —{' '}
                <span className="text-foreground font-medium">
                  {selectedCount} selecionada{selectedCount !== 1 ? 's' : ''}
                </span>
                {dupCount > 0 && (
                  <span className="text-warning font-medium"> · {dupCount} duplicata(s)</span>
                )}
              </p>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hideNonExpenses}
                    onChange={(e) => setHideNonExpenses(e.target.checked)}
                    className="accent-primary"
                  />
                  Ocultar investimentos
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyDebits}
                    onChange={(e) => setOnlyDebits(e.target.checked)}
                    className="accent-primary"
                  />
                  Apenas débitos
                </label>
              </div>
            </div>

            <div className="overflow-auto flex-1 min-h-0 rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left w-8">
                      <input
                        type="checkbox"
                        checked={selectedCount === visible.length && visible.length > 0}
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="accent-primary"
                      />
                    </th>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground w-24">
                      Data
                    </th>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground">
                      Descrição
                    </th>
                    <th className="p-2 text-left text-xs font-medium text-muted-foreground w-36">
                      Categoria
                    </th>
                    <th className="p-2 text-right text-xs font-medium text-muted-foreground w-28">
                      Valor
                    </th>
                    <th className="p-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr
                      key={row.fitId}
                      className={`border-t border-border hover:bg-accent/30 transition-colors ${
                        row.duplicate ? 'bg-warning/5' : ''
                      } ${!row.selected ? 'opacity-60' : ''}`}
                    >
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={(e) => toggleRow(row.fitId, e.target.checked)}
                          className="accent-primary"
                        />
                      </td>
                      <td className="p-2 text-muted-foreground tabular-nums whitespace-nowrap">
                        {row.date.split('-').reverse().join('/')}
                      </td>
                      <td
                        className="p-2 text-foreground max-w-[200px] truncate"
                        title={row.description}
                      >
                        <span className="flex items-center gap-1.5">
                          {row.duplicate && (
                            <span
                              className="text-[10px] font-medium text-warning cursor-help shrink-0"
                              title={DUP_TIP}
                            >
                              ⚠ dup
                            </span>
                          )}
                          <span className="truncate">{row.description}</span>
                        </span>
                      </td>
                      <td className="p-2">
                        <select
                          className={`${inputClass} py-1 text-xs`}
                          value={row.category}
                          onChange={(e) =>
                            setCategory(row.fitId, e.target.value as ExpenseCategory)
                          }
                        >
                          {Object.entries(categoryLabel).map(([k, label]) => (
                            <option key={k} value={k}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 text-right tabular-nums">
                        <div className="flex items-center justify-end gap-2">
                          <Badge
                            variant={categoryColors[row.category]}
                            className="text-[10px] px-1.5 py-0 hidden sm:inline-flex"
                          >
                            {categoryLabel[row.category]}
                          </Badge>
                          <span
                            className={
                              row.isDebit
                                ? 'text-destructive font-medium'
                                : 'text-success font-medium'
                            }
                          >
                            {row.isDebit ? '- ' : '+ '}
                            {row.amount.toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          onClick={() => removeRow(row.fitId)}
                          title="Remover esta linha da importação"
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <DialogFooter className="shrink-0">
          <button
            onClick={() => handleOpenChange(false)}
            className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
          >
            Cancelar
          </button>
          {rows.length > 0 && (
            <button
              onClick={handleImport}
              disabled={selectedCount === 0 || loading}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Importando…'
                : `Importar ${selectedCount} transaç${selectedCount === 1 ? 'ão' : 'ões'}`}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
