import { Card, CardHeader, CardTitle, CardValue } from '@/components'

type StatCardProps = {
  title: string
  value: string
  sub?: string
  subPositive?: boolean
  note?: string
  icon: React.ReactNode
  loading?: boolean
  valueClass?: string
}

export const StatCard = ({
  title,
  value,
  sub,
  subPositive,
  note,
  icon,
  loading,
  valueClass,
}: StatCardProps) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </div>
      {loading ? (
        <div className="h-7 w-32 rounded bg-muted animate-pulse mt-1" />
      ) : (
        <CardValue className={valueClass}>{value}</CardValue>
      )}
      {sub && !loading && (
        <p
          className={`text-xs font-medium ${
            subPositive === undefined
              ? 'text-muted-foreground'
              : subPositive
                ? 'text-success'
                : 'text-destructive'
          }`}
        >
          {sub}
        </p>
      )}
      {note && !loading && <p className="text-xs text-muted-foreground">{note}</p>}
    </CardHeader>
  </Card>
)
