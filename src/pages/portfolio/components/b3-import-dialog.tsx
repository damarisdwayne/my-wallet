import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatCurrency } from '@/lib/utils'
import { type B3Asset, parseB3Excel } from '@/services/b3-import'
import type { Asset } from '@/types'
import { typeLabel } from '../constants'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingAssets: Asset[]
  onImport: (assets: B3Asset[], filename: string) => Promise<void>
}

type ParsedRow = B3Asset & { action: 'new' | 'update' }

export const B3ImportDialog = ({ open, onOpenChange, existingAssets, onImport }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [filename, setFilename] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  const reset = () => {
    setRows(null)
    setFilename('')
    setParseError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const processBuffer = (buffer: ArrayBuffer) => {
    try {
      const parsed = parseB3Excel(buffer)
      const withAction: ParsedRow[] = parsed.map((a) => ({
        ...a,
        action: existingAssets.some((x) => x.ticker.toUpperCase() === a.ticker) ? 'update' : 'new',
      }))
      setRows(withAction)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Erro ao processar arquivo.')
    }
  }

  const handleFile = (file: File) => {
    reset()
    setFilename(file.name)
    file.arrayBuffer().then(processBuffer).catch(() => {
      setParseError('Não foi possível ler o arquivo.')
    })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleConfirm = async () => {
    if (!rows) return
    setImporting(true)
    try {
      await onImport(rows, filename)
      onOpenChange(false)
      reset()
    } finally {
      setImporting(false)
    }
  }

  const newCount = rows?.filter((r) => r.action === 'new').length ?? 0
  const updateCount = rows?.filter((r) => r.action === 'update').length ?? 0

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) reset()
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importar negociações da B3</DialogTitle>
          <DialogDescription>
            Em <span className="font-medium text-foreground">investidor.b3.com.br</span> → Extratos
            → Negociação → Baixar → Excel. O app calculará sua posição atual e preço médio.
          </DialogDescription>
        </DialogHeader>

        {!rows && (
          <label
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-lg p-10 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          >
            <Upload size={28} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Arraste o arquivo aqui ou{' '}
              <span className="text-primary font-medium">clique para selecionar</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Formato: Excel (.xlsx) — Extrato de Negociação da B3
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </label>
        )}

        {parseError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {parseError}
            <button onClick={reset} className="ml-3 underline text-xs">
              Tentar novamente
            </button>
          </div>
        )}

        {rows && (
          <>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{rows.length} ativo(s) encontrado(s):</span>
              {newCount > 0 && <span className="text-success font-medium">+{newCount} novos</span>}
              {updateCount > 0 && (
                <span className="text-foreground font-medium">{updateCount} a atualizar</span>
              )}
              <button onClick={reset} className="ml-auto underline hover:text-foreground">
                Trocar arquivo
              </button>
            </div>

            <div className="overflow-y-auto flex-1 rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur-sm">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Ativo</th>
                    <th className="px-3 py-2 font-medium">Tipo</th>
                    <th className="px-3 py-2 font-medium text-right">Qtd</th>
                    <th className="px-3 py-2 font-medium text-right">PM calc.</th>
                    <th className="px-3 py-2 font-medium text-center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.ticker}
                      className="border-t border-border hover:bg-accent/20 transition-colors"
                    >
                      <td className="px-3 py-2">
                        <p className="font-semibold text-foreground">{row.ticker}</p>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary">{typeLabel[row.type]}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right text-foreground">{row.quantity}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground">
                        {row.avgPrice > 0 ? formatCurrency(row.avgPrice) : '—'}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            row.action === 'new'
                              ? 'bg-success/15 text-success'
                              : 'bg-muted text-muted-foreground',
                          )}
                        >
                          {row.action === 'new' ? 'Novo' : 'Atualizar'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-muted-foreground">
              PM calculado pela média ponderada das compras. Ativos existentes terão qtd e PM atualizados.
            </p>
          </>
        )}

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!rows || importing}
            className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {importing ? 'Importando...' : 'Confirmar importação'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
