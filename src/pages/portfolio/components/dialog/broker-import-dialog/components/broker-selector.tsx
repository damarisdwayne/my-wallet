import type { Broker } from '../constants'

interface BrokerSelectorProps {
  brokers: Broker[]
  onSelect: (broker: Broker) => void
}

export const BrokerSelector = ({ brokers, onSelect }: BrokerSelectorProps) => (
  <div className="space-y-2 py-2">
    <p className="text-sm text-muted-foreground">Selecione a corretora:</p>
    <div className="grid grid-cols-2 gap-3">
      {brokers.map((b) => (
        <button
          key={b.id}
          onClick={() => onSelect(b)}
          className="flex flex-col items-start gap-1 rounded-lg border border-border p-4 text-left hover:border-primary/60 hover:bg-muted/40 transition-colors"
        >
          <span className="font-semibold text-foreground text-sm">{b.label}</span>
          <span className="text-xs text-muted-foreground">{b.description}</span>
        </button>
      ))}
    </div>
  </div>
)
