import { useRef, useState } from 'react'
import { ChevronLeft, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn, formatCurrency } from '@/lib/utils'
import {
  type B3Asset,
  type B3ParseResult,
  type B3RawTrade,
  parseB3Excel,
} from '@/services/b3-import'
import { parseInterPdf } from '@/services/inter-import'
import type { Asset } from '@/types'
import { typeLabel } from '../constants'

interface Broker {
  id: string
  label: string
  description: string
  instructions: React.ReactNode
  fileAccept: string
  fileHint: string
  parse: (buffer: ArrayBuffer) => Promise<B3ParseResult>
}

const BROKERS: Broker[] = [
  {
    id: 'b3',
    label: 'B3',
    description: 'Extrato de Negociação',
    instructions: (
      <p className="text-sm text-muted-foreground">
        Acesse{' '}
        <a
          href="https://www.investidor.b3.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          investidor.b3.com.br
        </a>{' '}
        → <span className="font-medium text-foreground">Extratos</span> →{' '}
        <span className="font-medium text-foreground">Negociação</span> →{' '}
        <span className="font-medium text-foreground">Baixar → Excel</span>. O app calculará sua
        posição atual e preço médio automaticamente.
      </p>
    ),
    fileAccept: '.xlsx,.xls',
    fileHint: 'Excel (.xlsx) — Extrato de Negociação da B3',
    parse: async (buf) => parseB3Excel(buf),
  },
  {
    id: 'inter',
    label: 'Inter Co Securities',
    description: 'Transaction Confirmation (EUA)',
    instructions: (
      <p className="text-sm text-muted-foreground">
        No app da Inter, acesse{' '}
        <span className="font-medium text-foreground">
          Investimentos → Notas de corretagem Ações EUA
        </span>{' '}
        e exporte a <span className="font-medium text-foreground">nota de corretagem em PDF</span>.
        Quantidades e PM serão calculados automaticamente.
      </p>
    ),
    fileAccept: '.pdf',
    fileHint: 'PDF — Transaction Confirmation da Inter Co Securities',
    parse: async (buf) => parseInterPdf(buf),
  },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingAssets: Asset[]
  onImport: (
    assets: B3Asset[],
    trades: B3RawTrade[],
    dividends: B3ParseResult['dividends'],
    filename: string,
    source: 'b3' | 'inter',
  ) => Promise<void>
}

type ParsedRow = B3Asset & { action: 'new' | 'update' | 'sell' }

export const BrokerImportDialog = ({ open, onOpenChange, existingAssets, onImport }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [broker, setBroker] = useState<Broker | null>(null)
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [pendingTrades, setPendingTrades] = useState<B3RawTrade[]>([])
  const [pendingDividends, setPendingDividends] = useState<B3ParseResult['dividends']>([])
  const [filename, setFilename] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [parsing, setParsing] = useState(false)

  const resetFile = () => {
    setRows(null)
    setPendingTrades([])
    setPendingDividends([])
    setFilename('')
    setParseError(null)
    setParsing(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const resetAll = () => {
    setBroker(null)
    resetFile()
  }

  const processBuffer = async (buffer: ArrayBuffer, selectedBroker: Broker) => {
    setParsing(true)
    try {
      const { assets, trades, dividends } = await selectedBroker.parse(buffer)
      setPendingTrades(trades)
      setPendingDividends(dividends)
      const withAction: ParsedRow[] = assets
        .filter((a) => {
          const exists = existingAssets.some((x) => x.ticker.toUpperCase() === a.ticker)
          return a.quantity > 0 || exists
        })
        .map((a) => {
          const exists = existingAssets.some((x) => x.ticker.toUpperCase() === a.ticker)
          const action = a.quantity < 0 ? 'sell' : exists ? 'update' : 'new'
          return { ...a, action } as ParsedRow
        })
      setRows(withAction)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Erro ao processar arquivo.')
    } finally {
      setParsing(false)
    }
  }

  const handleFile = (file: File, selectedBroker: Broker) => {
    resetFile()
    setFilename(file.name)
    file
      .arrayBuffer()
      .then((buf) => processBuffer(buf, selectedBroker))
      .catch(() => {
        setParseError('Não foi possível ler o arquivo.')
        setParsing(false)
      })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && broker) handleFile(file, broker)
  }

  const handleConfirm = async () => {
    if (!rows) return
    setImporting(true)
    try {
      await onImport(
        rows,
        pendingTrades,
        pendingDividends,
        filename,
        (broker?.id ?? 'b3') as 'b3' | 'inter',
      )
      onOpenChange(false)
      resetAll()
    } finally {
      setImporting(false)
    }
  }

  const newCount = rows?.filter((r) => r.action === 'new').length ?? 0
  const updateCount = rows?.filter((r) => r.action === 'update').length ?? 0
  const sellCount = rows?.filter((r) => r.action === 'sell').length ?? 0

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) resetAll()
      }}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {broker && (
              <button
                onClick={() => {
                  setBroker(null)
                  resetFile()
                }}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {broker ? `Importar — ${broker.label}` : 'Importar nota de corretagem'}
          </DialogTitle>
        </DialogHeader>

        {!broker && (
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">Selecione a corretora:</p>
            <div className="grid grid-cols-2 gap-3">
              {BROKERS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBroker(b)}
                  className="flex flex-col items-start gap-1 rounded-lg border border-border p-4 text-left hover:border-primary/60 hover:bg-muted/40 transition-colors"
                >
                  <span className="font-semibold text-foreground text-sm">{b.label}</span>
                  <span className="text-xs text-muted-foreground">{b.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {broker && !rows && !parsing && (
          <div className="space-y-3">
            <div className="rounded-md bg-muted/50 px-4 py-3">{broker.instructions}</div>
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
              <p className="text-xs text-muted-foreground">{broker.fileHint}</p>
              <input
                ref={inputRef}
                type="file"
                accept={broker.fileAccept}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file, broker)
                }}
              />
            </label>
          </div>
        )}

        {parsing && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <span className="animate-spin">⏳</span> Lendo arquivo…
          </div>
        )}

        {parseError && (
          <div className="rounded-md bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
            {parseError}
            <button onClick={resetFile} className="ml-3 underline text-xs">
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
              {sellCount > 0 && (
                <span className="text-destructive font-medium">-{sellCount} vendas</span>
              )}
              <button onClick={resetFile} className="ml-auto underline hover:text-foreground">
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
                    <th className="px-3 py-2 font-medium text-right">PM</th>
                    <th className="px-3 py-2 font-medium text-center">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.ticker}
                      className="border-t border-border hover:bg-accent/20 transition-colors"
                    >
                      <td className="px-3 py-2 font-semibold text-foreground">{row.ticker}</td>
                      <td className="px-3 py-2">
                        <Badge variant="secondary">{typeLabel[row.type]}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right text-foreground">
                        {row.quantity % 1 === 0
                          ? row.quantity
                          : Number.parseFloat(row.quantity.toFixed(2))}
                      </td>
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
              PM calculado pela média ponderada das compras.
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
          {rows && (
            <button
              onClick={handleConfirm}
              disabled={importing}
              className="px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {importing ? 'Importando...' : 'Confirmar importação'}
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
