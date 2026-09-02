const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

export const relativeSince = (from: number | null, to: number): string => {
  if (!from) return 'desde a última atualização'
  const diff = to - from
  if (diff < MINUTE) return 'desde poucos segundos atrás'
  if (diff < HOUR) {
    const min = Math.round(diff / MINUTE)
    return `desde ${min} ${min === 1 ? 'minuto' : 'minutos'} atrás`
  }
  if (diff < DAY) {
    const hours = Math.round(diff / HOUR)
    return `desde ${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`
  }
  const days = Math.round(diff / DAY)
  return `desde ${days} ${days === 1 ? 'dia' : 'dias'} atrás`
}
