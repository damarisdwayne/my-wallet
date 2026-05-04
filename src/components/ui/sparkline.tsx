import { useEffect, useState } from 'react'
import { fetchHistoricalPrices } from '@/services/quotes'
import type { HistoricalPoint } from '@/services/quotes'

type Props = {
  ticker: string
  width?: number
  height?: number
  className?: string
}

export const Sparkline = ({ ticker, width = 64, height = 24, className }: Props) => {
  const [points, setPoints] = useState<HistoricalPoint[]>([])

  useEffect(() => {
    fetchHistoricalPrices(ticker)
      .then(setPoints)
      .catch(() => null)
  }, [ticker])

  if (points.length < 2) return null

  const closes = points.map((p) => p.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1

  const pad = 2
  const coords = closes.map((v, i) => {
    const x = pad + (i / (closes.length - 1)) * (width - pad * 2)
    const y = pad + ((max - v) / range) * (height - pad * 2)
    return `${x},${y}`
  })

  const rising = closes.at(-1)! >= closes[0]
  const color = rising ? 'var(--color-success, #22c55e)' : 'var(--color-destructive, #ef4444)'

  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <polyline
        points={coords.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
