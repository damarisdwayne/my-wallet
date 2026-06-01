import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { B3ParseResult, B3RawTrade } from '@/services/b3-import'
import { aggregateTradesToAssets, dividendSignature, tradeSignature } from '@/services/b3-import'
import { parseInterExtrato, extratoToDividends } from '@/services/inter-extrato'
import type { ExtratoEntry } from '@/services/inter-extrato'
import { subscribeToTrades } from '@/services/trades'
import { subscribeToAllDividends } from '@/services/dividends'
import { useAuth } from '@/store/auth'
import type { Dividend, Trade } from '@/types'
import { BROKERS } from './constants'
import type { Broker } from './constants'
import type { DividendItem, ExtratoItem, InterMode, ParsedRow, Props, TradeItem } from './types'
import {
  BrokerSelector,
  ExtratoPreview,
  FileDropZone,
  ModeSelector,
  TradesPreview,
} from './components'

export const BrokerImportDialog = ({ open, onOpenChange, existingAssets, onImport }: Props) => {
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [broker, setBroker] = useState<Broker | null>(null)
  const [interMode, setInterMode] = useState<InterMode | null>(null)
  const [rows, setRows] = useState<ParsedRow[] | null>(null)
  const [pendingTrades, setPendingTrades] = useState<B3RawTrade[]>([])
  const [pendingDividends, setPendingDividends] = useState<B3ParseResult['dividends']>([])
  const [extratoResult, setExtratoResult] = useState<{
    entries: ExtratoEntry[]
    usdRate: number
  } | null>(null)
  const [filename, setFilename] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const [parsing, setParsing] = useState(false)
  // User's explicit include/exclude choices, keyed by item key. Default is derived from
  // duplicate detection (duplicates start unchecked), so only overrides are stored here.
  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  // Already-saved operations, used to flag duplicates in the preview.
  const [existingTrades, setExistingTrades] = useState<Trade[]>([])
  const [existingDividends, setExistingDividends] = useState<Dividend[]>([])

  useEffect(() => {
    if (!open || !user?.uid) return
    const unsubTrades = subscribeToTrades(user.uid, setExistingTrades)
    const unsubDividends = subscribeToAllDividends(user.uid, setExistingDividends)
    return () => {
      unsubTrades()
      unsubDividends()
    }
  }, [open, user?.uid])

  const existingTradeSigs = useMemo(
    () => new Set(existingTrades.map(tradeSignature)),
    [existingTrades],
  )
  const existingDividendSigs = useMemo(
    () => new Set(existingDividends.map(dividendSignature)),
    [existingDividends],
  )

  const resetFile = () => {
    setRows(null)
    setPendingTrades([])
    setPendingDividends([])
    setExtratoResult(null)
    setFilename('')
    setParseError(null)
    setParsing(false)
    setOverrides({})
    if (inputRef.current) inputRef.current.value = ''
  }

  const resetAll = () => {
    setBroker(null)
    setInterMode(null)
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
        .map((a): ParsedRow => {
          const exists = existingAssets.some((x) => x.ticker.toUpperCase() === a.ticker)
          const action = a.quantity < 0 ? 'sell' : exists ? 'update' : 'new'
          return { ...a, action }
        })
      setRows(withAction)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Erro ao processar arquivo.')
    } finally {
      setParsing(false)
    }
  }

  const processExtratoBuffer = async (buffer: ArrayBuffer) => {
    setParsing(true)
    try {
      const result = await parseInterExtrato(buffer)
      if (result.entries.length === 0) {
        throw new Error(
          'Nenhum dividendo encontrado. Verifique se é o Extrato de Movimentações da Inter.',
        )
      }
      setExtratoResult(result)
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Erro ao processar arquivo.')
    } finally {
      setParsing(false)
    }
  }

  const handleFile = (file: File) => {
    resetFile()
    setFilename(file.name)
    const read = file.arrayBuffer()
    if (broker?.id === 'inter' && interMode === 'extrato') {
      read.then(processExtratoBuffer).catch(() => {
        setParseError('Não foi possível ler o arquivo.')
        setParsing(false)
      })
    } else if (broker) {
      read
        .then((buf) => processBuffer(buf, broker))
        .catch(() => {
          setParseError('Não foi possível ler o arquivo.')
          setParsing(false)
        })
    }
  }

  const isExtratoMode = broker?.id === 'inter' && interMode === 'extrato'

  // Pair each parsed operation with its duplicate flag and current selection.
  const tradeItems: TradeItem[] = pendingTrades.map((trade, i) => {
    const key = `t${i}`
    const duplicate = existingTradeSigs.has(tradeSignature(trade))
    return { trade, key, duplicate, included: overrides[key] ?? !duplicate }
  })
  const dividendItems: DividendItem[] = pendingDividends.map((dividend, i) => {
    const key = `d${i}`
    const duplicate = existingDividendSigs.has(dividendSignature(dividend))
    return { dividend, key, duplicate, included: overrides[key] ?? !duplicate }
  })

  const extratoMapped = (extratoResult?.entries ?? []).filter((e) => e.ticker !== null)
  const extratoUnmapped = (extratoResult?.entries ?? []).filter((e) => e.ticker === null)
  const extratoItems: ExtratoItem[] = extratoMapped.map((entry, i) => {
    const key = `e${i}`
    const duplicate = existingDividendSigs.has(
      dividendSignature({
        ticker: entry.ticker!,
        paymentDate: entry.date,
        type: 'dividendo_ext',
        amount: 0,
        amountUsd: entry.amountUsd,
      }),
    )
    return { entry, key, duplicate, included: overrides[key] ?? !duplicate }
  })

  const dupByKey: Record<string, boolean> = {}
  for (const it of [...tradeItems, ...dividendItems, ...extratoItems])
    dupByKey[it.key] = it.duplicate
  const handleToggle = (key: string) =>
    setOverrides((o) => ({ ...o, [key]: !(o[key] ?? !dupByKey[key]) }))

  const handleConfirm = async () => {
    setImporting(true)
    try {
      if (isExtratoMode && extratoResult) {
        const keptEntries = extratoItems.filter((it) => it.included).map((it) => it.entry)
        const dividends = extratoToDividends(keptEntries)
        await onImport([], [], dividends, filename, 'inter')
      } else if (rows) {
        const keptTrades = tradeItems.filter((it) => it.included).map((it) => it.trade)
        const keptDividends = dividendItems.filter((it) => it.included).map((it) => it.dividend)
        const assets = await aggregateTradesToAssets(keptTrades)
        await onImport(
          assets,
          keptTrades,
          keptDividends,
          filename,
          (broker?.id ?? 'b3') as 'b3' | 'inter',
        )
      }
      onOpenChange(false)
      resetAll()
    } finally {
      setImporting(false)
    }
  }

  const showModeSelector = broker?.id === 'inter' && interMode === null
  const showFileZone = broker !== null && !showModeSelector && !rows && !extratoResult && !parsing
  const canConfirm = rows !== null || extratoResult !== null

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        if (!v) resetAll()
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {(broker || interMode) && (
              <button
                onClick={() => {
                  if (interMode) {
                    setInterMode(null)
                    resetFile()
                  } else {
                    setBroker(null)
                    resetFile()
                  }
                }}
                className="p-1 rounded hover:bg-muted transition-colors"
                aria-label="Voltar"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            {broker
              ? isExtratoMode
                ? 'Importar extrato — Inter Co Securities'
                : `Importar — ${broker.label}`
              : 'Importar nota de corretagem'}
          </DialogTitle>
        </DialogHeader>

        {!broker && <BrokerSelector brokers={BROKERS} onSelect={setBroker} />}

        {showModeSelector && <ModeSelector onSelectMode={setInterMode} />}

        {showFileZone && (
          <FileDropZone
            isExtratoMode={isExtratoMode}
            broker={broker}
            inputRef={inputRef}
            onFile={handleFile}
          />
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

        {rows && !isExtratoMode && (
          <TradesPreview
            tradeItems={tradeItems}
            dividendItems={dividendItems}
            onToggle={handleToggle}
            onReset={resetFile}
          />
        )}

        {extratoResult && (
          <ExtratoPreview
            items={extratoItems}
            unmappedFunds={extratoUnmapped}
            usdRate={extratoResult.usdRate}
            onToggle={handleToggle}
            onReset={resetFile}
          />
        )}

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          {canConfirm && (
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
