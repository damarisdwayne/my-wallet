import { Upload } from 'lucide-react'
import type { Broker } from '../constants'

interface FileDropZoneProps {
  isExtratoMode: boolean
  broker: Broker | null
  inputRef: React.RefObject<HTMLInputElement | null>
  onFile: (file: File) => void
}

export const FileDropZone = ({ isExtratoMode, broker, inputRef, onFile }: FileDropZoneProps) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  return (
    <div className="space-y-3">
      {!isExtratoMode && broker && (
        <div className="rounded-md bg-muted/50 px-4 py-3">{broker.instructions}</div>
      )}
      {isExtratoMode && (
        <div className="rounded-md bg-muted/50 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            No app da Inter, acesse{' '}
            <span className="font-medium text-foreground">
              Invest → Global → Extrato → Exportar
            </span>{' '}
            e baixe o PDF do período desejado.
          </p>
        </div>
      )}
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
          {isExtratoMode
            ? 'PDF — Extrato de Movimentações da Inter Co Securities'
            : broker?.fileHint}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onFile(file)
          }}
        />
      </label>
    </div>
  )
}
