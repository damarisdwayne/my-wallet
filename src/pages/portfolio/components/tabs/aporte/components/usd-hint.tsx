import { cn, formatUsdCurrency } from '@/lib/utils'
import { MASK, usePrivacy } from '@/store/privacy'

interface UsdHintProps {
  brl: number
  usdRate: number
  className?: string
}

export const UsdHint = ({ brl, usdRate, className }: UsdHintProps) => {
  const { hideValues } = usePrivacy()
  if (usdRate <= 0) return null
  return (
    <span className={cn('text-xs text-muted-foreground', className)}>
      {hideValues ? MASK : formatUsdCurrency(brl / usdRate)}
    </span>
  )
}
