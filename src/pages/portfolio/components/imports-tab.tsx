import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import type { ImportRecord } from '@/types'

interface Props {
  records: ImportRecord[]
  onRevert: (record: ImportRecord) => Promise<void>
}

export const ImportsTab = ({ records, onRevert }: Props) => {
  const [confirmRecord, setConfirmRecord] = useState<ImportRecord | null>(null)
  const [reverting, setReverting] = useState(false)

  const handleRevert = async () => {
    if (!confirmRecord) return
    setReverting(true)
    try {
      await onRevert(confirmRecord)
      setConfirmRecord(null)
    } finally {
      setReverting(false)
    }
  }

  const sorted = [...records].sort(
    (a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime(),
  )

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-12">
        Nenhuma importação realizada ainda. Use o botão "Importar B3" na aba Visão Geral.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {sorted.map((record) => (
        <div key={record.id} className="border border-border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
            <div>
              <p className="text-sm font-medium text-foreground">{record.filename}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(record.importedAt).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {' · '}
                {record.items.length} ativo(s)
              </p>
            </div>
            <button
              onClick={() => setConfirmRecord(record)}
              title="Reverter importação"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
              Reverter
            </button>
          </div>

          <div className="divide-y divide-border">
            {record.items.map((item) => (
              <div key={item.assetId} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="font-semibold text-foreground w-20 shrink-0">{item.ticker}</span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                    item.wasCreated
                      ? 'bg-success/15 text-success'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {item.wasCreated ? 'Criado' : 'Atualizado'}
                </span>
                <span className="text-muted-foreground text-xs flex-1">
                  {item.quantityDelta > 0 ? '+' : ''}
                  {item.quantityDelta} unid.
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  PM {formatCurrency(item.importAvgPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Dialog
        open={!!confirmRecord}
        onOpenChange={(v) => {
          if (!v) setConfirmRecord(null)
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reverter importação?</DialogTitle>
            <DialogDescription>
              Isso vai restaurar as quantidades e preços médios de{' '}
              <span className="font-medium text-foreground">
                {confirmRecord?.items.length} ativo(s)
              </span>{' '}
              ao estado anterior. Ativos criados por esta importação serão removidos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setConfirmRecord(null)}
              className="px-4 py-2 rounded-md text-sm bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRevert}
              disabled={reverting}
              className="px-4 py-2 rounded-md text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-40"
            >
              {reverting ? 'Revertendo...' : 'Confirmar reversão'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
