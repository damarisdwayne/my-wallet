import { useState } from 'react'
import type { Asset, FixedIncomeType, PortfolioCategory, RateType } from '@/types'
import { Field, buildFiName, isTesourotType } from '../utils'
import {
  inputClass,
  todayStr,
  FIXED_INCOME_TYPES,
  RATE_TYPES,
  TESOURO_RATE_TYPE,
} from '../constants'

export const FixedIncomeForm = ({
  categories,
  onSave,
}: {
  categories: PortfolioCategory[]
  onSave: (asset: Partial<Asset>) => void
}) => {
  const fiCatId =
    categories.find(
      (c) => c.assetTypes.includes('fixed_income') || c.assetTypes.includes('tesouro'),
    )?.id ?? ''
  const [form, setForm] = useState({
    fixedIncomeType: 'CDB' as FixedIncomeType,
    institution: '',
    issuer: '',
    rateType: 'pos_cdi' as RateType,
    indexerRate: '100',
    prefixedRate: '',
    totalInvested: '',
    quantity: '',
    avgPrice: '',
    maturityYear: '',
    operationDate: todayStr,
    maturityDate: '',
    categoryId: fiCatId,
  })

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))

  const isTesouro = isTesourotType(form.fixedIncomeType)

  const handleTypeChange = (t: string) => {
    const ft = t as FixedIncomeType
    const autoRate = TESOURO_RATE_TYPE[ft]
    setForm((p) => ({ ...p, fixedIncomeType: ft, ...(autoRate ? { rateType: autoRate } : {}) }))
  }

  const rateLabel: Record<RateType, string> = {
    prefixado: 'Taxa a.a. (%)',
    pos_cdi: '% do CDI',
    ipca_plus: 'IPCA + (% a.a.)',
    igpm_plus: 'IGP-M + (% a.a.)',
    pos_selic: '% da SELIC',
  }

  const showRateField = !isTesouro || form.rateType !== 'pos_selic'

  const canSave = isTesouro
    ? Number.parseFloat(form.quantity) > 0 && Number.parseFloat(form.avgPrice) > 0
    : Number.parseFloat(form.totalInvested) > 0

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Tipo">
          <select
            className={inputClass}
            value={form.fixedIncomeType}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            {FIXED_INCOME_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </Field>
        {isTesouro ? (
          <Field label="Ano de vencimento">
            <input
              className={inputClass}
              placeholder="2029"
              maxLength={4}
              value={form.maturityYear}
              onChange={(e) => set('maturityYear', e.target.value)}
            />
          </Field>
        ) : (
          <Field label="Instituição">
            <input
              className={inputClass}
              placeholder="Nubank, Inter..."
              value={form.institution}
              onChange={(e) => set('institution', e.target.value)}
            />
          </Field>
        )}
      </div>

      {isTesouro ? (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Quantidade de títulos">
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder="3.69"
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
            />
          </Field>
          <Field label="Preço unitário (R$)">
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder="3285.55"
              value={form.avgPrice}
              onChange={(e) => set('avgPrice', e.target.value)}
            />
          </Field>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Total investido (R$)">
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder="5000.00"
              value={form.totalInvested}
              onChange={(e) => set('totalInvested', e.target.value)}
            />
          </Field>
          <Field label="Emissor (opcional)">
            <input
              className={inputClass}
              placeholder="Banco XYZ"
              value={form.issuer}
              onChange={(e) => set('issuer', e.target.value)}
            />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {!isTesouro && (
          <Field label="Tipo de Taxa">
            <select
              className={inputClass}
              value={form.rateType}
              onChange={(e) => set('rateType', e.target.value)}
            >
              {RATE_TYPES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        )}
        {showRateField && (
          <Field
            label={
              isTesouro
                ? form.rateType === 'prefixado'
                  ? 'Taxa prefixada (% a.a.)'
                  : 'Spread (% a.a.)'
                : rateLabel[form.rateType]
            }
          >
            <input
              className={inputClass}
              type="number"
              min={0}
              step={0.01}
              placeholder={form.rateType === 'pos_cdi' ? '110' : '12.5'}
              value={form.rateType === 'prefixado' ? form.prefixedRate : form.indexerRate}
              onChange={(e) =>
                set(form.rateType === 'prefixado' ? 'prefixedRate' : 'indexerRate', e.target.value)
              }
            />
          </Field>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Field label="Data de aplicação">
          <input
            className={inputClass}
            type="date"
            value={form.operationDate}
            onChange={(e) => set('operationDate', e.target.value)}
          />
        </Field>
        {!isTesouro && (
          <Field label="Vencimento">
            <input
              className={inputClass}
              type="date"
              value={form.maturityDate}
              onChange={(e) => set('maturityDate', e.target.value)}
            />
          </Field>
        )}
      </div>

      <Field label="Categoria">
        <select
          className={inputClass}
          value={form.categoryId}
          onChange={(e) => set('categoryId', e.target.value)}
        >
          <option value="">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>

      <button
        onClick={() => {
          if (!canSave) return
          if (isTesouro) {
            const qty = Number.parseFloat(form.quantity)
            const pu = Number.parseFloat(form.avgPrice)
            const year = form.maturityYear.trim()
            const yearSuffix = year ? ` ${year}` : ''
            const ticker = `${form.fixedIncomeType.toUpperCase()}${yearSuffix}`
            const tesouroCatId =
              categories.find((c) => c.assetTypes.includes('tesouro'))?.id ?? fiCatId
            onSave({
              ticker,
              name: ticker,
              type: 'tesouro',
              categoryId: tesouroCatId,
              quantity: qty,
              avgPrice: pu,
              currentPrice: pu,
              targetPercent: 0,
              fixedIncomeType: form.fixedIncomeType,
              rateType: form.rateType,
              indexerRate:
                form.rateType === 'prefixado'
                  ? undefined
                  : Number.parseFloat(form.indexerRate) || undefined,
              prefixedRate:
                form.rateType === 'prefixado'
                  ? Number.parseFloat(form.prefixedRate) || undefined
                  : undefined,
              operationDate: form.operationDate || undefined,
            })
          } else {
            const invested = Number.parseFloat(form.totalInvested)
            const suffix = form.institution ? `-${form.institution.slice(0, 8).toUpperCase()}` : ''
            const shortName = `${form.fixedIncomeType}${suffix}`
            onSave({
              ticker: buildFiName(form),
              name: shortName,
              type: 'fixed_income',
              categoryId: form.categoryId,
              quantity: 1,
              avgPrice: invested,
              currentPrice: invested,
              targetPercent: 0,
              institution: form.institution || undefined,
              fixedIncomeType: form.fixedIncomeType,
              rateType: form.rateType,
              indexerRate:
                form.rateType === 'prefixado'
                  ? undefined
                  : Number.parseFloat(form.indexerRate) || undefined,
              prefixedRate:
                form.rateType === 'prefixado'
                  ? Number.parseFloat(form.prefixedRate) || undefined
                  : undefined,
              maturityDate: form.maturityDate || undefined,
              operationDate: form.operationDate || undefined,
              issuer: form.issuer || undefined,
            })
          }
        }}
        disabled={!canSave}
        className="w-full py-2 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
      >
        Adicionar
      </button>
    </div>
  )
}
