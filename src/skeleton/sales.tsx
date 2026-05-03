import { Card, CardContent, CardHeader, Skeleton } from '@/components'

export const SalesSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-8 w-36" />
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(['a', 'b', 'c'] as const).map((k) => (
            <div
              key={k}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(['revenue', 'cost', 'profit'] as const).map((k) => (
        <Card key={k}>
          <CardHeader>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32 mt-1" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-24">
          {([50, 80, 40, 100, 65, 45, 75] as const).map((h) => (
            <div key={h} className="flex-1 flex flex-col items-center gap-1">
              <Skeleton className="w-full rounded-t" style={{ height: `${h}px` }} />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)
