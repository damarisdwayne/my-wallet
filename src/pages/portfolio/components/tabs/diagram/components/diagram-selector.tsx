import { cn } from '@/lib/utils'
import type { Diagram } from '@/types'

interface DiagramSelectorProps {
  diagrams: Diagram[]
  activeDiagramId: string
  onSelect: (id: string) => void
}

export const DiagramSelector = ({ diagrams, activeDiagramId, onSelect }: DiagramSelectorProps) => (
  <div className="flex flex-wrap items-center gap-2">
    {diagrams.map((d) => (
      <button
        key={d.id}
        onClick={() => onSelect(d.id)}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
          activeDiagramId === d.id
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:text-foreground',
        )}
      >
        {d.name}
      </button>
    ))}
  </div>
)
