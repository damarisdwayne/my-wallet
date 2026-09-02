import { RefreshCw, Upload, Plus, Download } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  priceError: string | undefined | null
  refreshingPrices: boolean
  onRefreshPrices: () => void
  onOpenBrokerImport: () => void
  onOpenAddAsset: () => void
  onExportCsv: () => void
}

export const Toolbar = ({
  priceError,
  refreshingPrices,
  onRefreshPrices,
  onOpenBrokerImport,
  onOpenAddAsset,
  onExportCsv,
}: ToolbarProps) => (
  <div className="flex items-center justify-end gap-3">
    {priceError && <p className="text-xs text-destructive">{priceError}</p>}
    <button
      onClick={() => onRefreshPrices()}
      disabled={refreshingPrices}
      title={refreshingPrices ? 'Atualizando...' : 'Atualizar preços'}
      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors disabled:opacity-50"
    >
      <RefreshCw size={14} className={cn(refreshingPrices && 'animate-spin')} />
      <span className="hidden sm:inline">
        {refreshingPrices ? 'Atualizando...' : 'Atualizar preços'}
      </span>
    </button>
    <button
      onClick={onExportCsv}
      title="Exportar CSV"
      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
    >
      <Download size={14} />
      <span className="hidden sm:inline">Exportar CSV</span>
    </button>
    <button
      onClick={onOpenBrokerImport}
      title="Importar nota"
      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-muted text-muted-foreground text-sm hover:text-foreground transition-colors"
    >
      <Upload size={14} />
      <span className="hidden sm:inline">Importar nota</span>
    </button>
    <button
      onClick={onOpenAddAsset}
      title="Adicionar ativo"
      className="flex items-center gap-1.5 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
    >
      <Plus size={14} />
      <span className="hidden sm:inline">Adicionar ativo</span>
    </button>
  </div>
)
