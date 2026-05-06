import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h2 className="text-base font-semibold text-foreground border-b border-border pb-1">{title}</h2>
    {children}
  </div>
)

export const Indicator = ({
  name,
  formula,
  ideal,
  description,
  alert,
}: {
  name: string
  formula?: string
  ideal: string
  description: string
  alert?: string
}) => (
  <Card className="p-4 space-y-2">
    <div className="flex items-start justify-between gap-2">
      <span className="font-semibold text-sm text-foreground">{name}</span>
      <Badge variant="secondary" className="text-xs shrink-0">
        Ideal: {ideal}
      </Badge>
    </div>
    {formula && (
      <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
        {formula}
      </p>
    )}
    <p className="text-sm text-muted-foreground">{description}</p>
    {alert && (
      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
        ⚠️ {alert}
      </p>
    )}
  </Card>
)
