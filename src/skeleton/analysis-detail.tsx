import { Skeleton } from '@/components'

const IndicatorSkeleton = () => (
  <div className="rounded-lg border border-border p-3 space-y-2">
    <Skeleton className="h-3 w-16" />
    <Skeleton className="h-5 w-12" />
    <Skeleton className="h-2 w-20" />
  </div>
)

export const AnalysisDetailSkeleton = () => (
  <div className="space-y-6">
    {/* Top bar */}
    <div className="flex items-center gap-3">
      <Skeleton className="h-5 w-16" />
      <Skeleton className="h-6 w-14" />
      <Skeleton className="h-4 w-32 hidden sm:block" />
      <div className="ml-auto">
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>

    {/* Price */}
    <Skeleton className="h-8 w-28" />

    {/* Valuation chips */}
    <div className="flex gap-3 flex-wrap">
      <Skeleton className="h-16 w-[48%] rounded-lg" />
      <Skeleton className="h-16 w-[48%] rounded-lg" />
    </div>

    {/* Company info section */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-3 w-12" />
      </div>
      <div className="rounded-lg border border-border p-4 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <div className="pt-3 border-t border-border space-y-2">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </div>

    {/* Indicators section */}
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <IndicatorSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
)
