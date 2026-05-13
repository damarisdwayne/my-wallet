import { formatCurrency } from '@/lib/utils'
import type { Asset, RateType } from '@/types'

const RATE_TYPE_LABEL: Record<RateType, string> = {
  prefixado: 'Prefixado',
  pos_cdi: 'Pós-fixado CDI',
  ipca_plus: 'IPCA+',
  igpm_plus: 'IGP-M+',
  pos_selic: 'Pós-fixado Selic',
}

const formatRate = (asset: Asset): string => {
  switch (asset.rateType) {
    case 'prefixado':
      return asset.prefixedRate != null ? `${asset.prefixedRate.toFixed(2)}% a.a.` : '—'
    case 'pos_cdi':
      return asset.indexerRate != null ? `${asset.indexerRate.toFixed(0)}% do CDI` : '—'
    case 'ipca_plus':
      return asset.indexerRate != null ? `IPCA + ${asset.indexerRate.toFixed(2)}% a.a.` : '—'
    case 'igpm_plus':
      return asset.indexerRate != null ? `IGP-M + ${asset.indexerRate.toFixed(2)}% a.a.` : '—'
    case 'pos_selic':
      return asset.indexerRate != null ? `${asset.indexerRate.toFixed(0)}% da Selic` : '—'
    default:
      return '—'
  }
}

const formatDate = (date: string | undefined): string => {
  if (!date) return '—'
  const d = new Date(date.length === 10 ? `${date}T00:00:00` : date)
  return d.toLocaleDateString('pt-BR')
}

export const FixedIncomeSection = ({ asset }: { asset: Asset }) => {
  const isTesouro = asset.type === 'tesouro'

  const fields: { label: string; value: string }[] = [
    { label: 'Tipo', value: asset.fixedIncomeType ?? '—' },
    { label: 'Indexador', value: asset.rateType ? RATE_TYPE_LABEL[asset.rateType] : '—' },
    { label: 'Taxa', value: formatRate(asset) },
    {
      label: isTesouro ? 'Emissor' : 'Instituição',
      value: (isTesouro ? asset.issuer : asset.institution) ?? '—',
    },
    ...(!isTesouro && asset.issuer ? [{ label: 'Emissor', value: asset.issuer }] : []),
    { label: 'Contratação', value: formatDate(asset.operationDate) },
    { label: 'Vencimento', value: formatDate(asset.maturityDate) },
    {
      label: 'Valor investido',
      value: asset.avgPrice > 0 ? formatCurrency(asset.avgPrice * asset.quantity) : '—',
    },
    {
      label: 'Valor atual',
      value: asset.currentPrice > 0 ? formatCurrency(asset.currentPrice * asset.quantity) : '—',
    },
  ].filter((f) => f.value !== '—')

  if (fields.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-center">
        <p className="text-xs text-muted-foreground">Nenhuma informação registrada.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border p-4 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
      {fields.map((f) => (
        <div key={f.label} className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
            {f.label}
          </p>
          <p className="text-sm font-medium text-foreground">{f.value}</p>
        </div>
      ))}
    </div>
  )
}
