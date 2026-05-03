import { Card, CardContent, CardHeader, Skeleton } from '@/components'

export const ExpensesSkeleton = () => (
  <div className="p-6 space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {(['salary', 'spent', 'left'] as const).map((k) => (
        <Card key={k}>
          <CardHeader>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-36 mt-1" />
            <Skeleton className="h-3 w-20 mt-1" />
          </CardHeader>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-40" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-full rounded-full" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-28">
          {([60, 90, 50, 100, 75, 45, 80] as const).map((h) => (
            <div key={h} className="flex-1 flex flex-col items-center gap-1">
              <Skeleton className="w-full rounded-t" style={{ height: `${h}px` }} />
              <Skeleton className="h-2 w-8" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader>
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {(['a', 'b', 'c', 'd', 'e'] as const).map((k) => (
            <div
              key={k}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
)
