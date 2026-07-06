import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type MethodKind = 'manual' | 'import' | 'auto'

const kindLabel: Record<MethodKind, string> = {
  manual: 'Manual',
  import: 'Importação',
  auto: 'Automático',
}

const kindStyle: Record<MethodKind, string> = {
  manual:
    'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-900',
  import:
    'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300 border-violet-200 dark:border-violet-900',
  auto: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border-green-200 dark:border-green-900',
}

export const GuideSection = ({
  title,
  intro,
  children,
}: {
  title: string
  intro?: string
  children: React.ReactNode
}) => (
  <div className="space-y-3">
    <div className="border-b border-border pb-1">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {intro && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{intro}</p>}
    </div>
    <div className="grid gap-3 sm:grid-cols-2">{children}</div>
  </div>
)

export const MethodCard = ({
  kind,
  title,
  where,
  description,
  details,
  note,
}: {
  kind: MethodKind
  title: string
  where?: string
  description: string
  details?: string[]
  note?: string
}) => (
  <Card className="p-4 space-y-2 h-full">
    <div className="flex items-start justify-between gap-2">
      <span className="font-semibold text-sm text-foreground">{title}</span>
      <Badge variant="outline" className={cn('text-xs shrink-0', kindStyle[kind])}>
        {kindLabel[kind]}
      </Badge>
    </div>
    {where && (
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">Onde:</span> {where}
      </p>
    )}
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    {details && details.length > 0 && (
      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
        {details.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
    )}
    {note && (
      <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded">
        ⚠️ {note}
      </p>
    )}
  </Card>
)
