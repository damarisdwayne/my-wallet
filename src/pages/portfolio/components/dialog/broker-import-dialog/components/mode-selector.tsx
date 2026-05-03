import { FileText, Receipt } from 'lucide-react'

interface ModeSelectorProps {
  onSelectMode: (mode: 'trades' | 'extrato') => void
}

export const ModeSelector = ({ onSelectMode }: ModeSelectorProps) => (
  <div className="space-y-2 py-2">
    <p className="text-sm text-muted-foreground">Qual documento deseja importar?</p>
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onSelectMode('trades')}
        className="flex flex-col items-start gap-1 rounded-lg border border-border p-4 text-left hover:border-primary/60 hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <Receipt size={16} />
          Nota de corretagem
        </span>
        <span className="text-xs text-muted-foreground">
          Transaction Confirmation — importa compras e vendas
        </span>
      </button>
      <button
        onClick={() => onSelectMode('extrato')}
        className="flex flex-col items-start gap-1 rounded-lg border border-border p-4 text-left hover:border-primary/60 hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-2 font-semibold text-foreground text-sm">
          <FileText size={16} />
          Extrato de movimentações
        </span>
        <span className="text-xs text-muted-foreground">Importa dividendos recebidos em USD</span>
      </button>
    </div>
  </div>
)
