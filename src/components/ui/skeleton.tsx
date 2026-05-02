import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export const Skeleton = ({ className, style }: { className?: string; style?: CSSProperties }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} style={style} />
)
