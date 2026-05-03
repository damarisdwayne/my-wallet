import { Card, CardContent, CardHeader, Skeleton } from '@/components'

const tabs = ['Visão Geral', 'Metas', 'Aporte', 'Movimentações', 'Importações', 'Análises']

export const PortfolioSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="relative flex gap-1 pb-px border-b border-border">
      {tabs.map((tab) => (
        <div key={tab} className="px-4 py-2">
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="flex gap-2">
          {(['a', 'b', 'c', 'd'] as const).map((k) => (
            <Skeleton key={k} className="h-6 w-16 rounded-full" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(['a', 'b', 'c', 'd'] as const).map((k) => (
          <Card key={k}>
            <CardHeader className="p-4 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-2 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex gap-4 pb-2 border-b border-border">
              {(['a', 'b', 'c', 'd', 'e', 'f'] as const).map((k) => (
                <Skeleton key={k} className="h-3 w-12" />
              ))}
            </div>
            {(['a', 'b', 'c', 'd', 'e', 'f', 'g'] as const).map((k) => (
              <div
                key={k}
                className="flex items-center gap-4 py-2 border-b border-border last:border-0"
              >
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-14 ml-auto" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
)
