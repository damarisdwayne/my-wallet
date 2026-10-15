import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Input = ({ className, type, ...props }: ComponentProps<'input'>) => (
  <input
    type={type}
    className={cn(
      'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
)
