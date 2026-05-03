import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Asset } from '@/types'
import type { TesouroBond } from '@/services/tesouro'
import {
  CalcActions,
  CurrencyInput,
  DateInput,
  Field,
  PercentInput,
} from '../../shared'
import type { BondType } from '../types'
import { BOND_OPTIONS } from '../constants'

interface BondFormProps {
  bondType: BondType
  amount: string
  spreadBuy: string
  spreadNow: string
  ipcaRef: string
  buyDate: string
  maturityDate: string
  autoFilledDate: string | null
  bondsLoading: boolean
  bondsError: string | null
  portfolioLoading: boolean
  portfolioTesouro: Asset[]
  groupedBonds: Record<string, TesouroBond[]>
  selectedKey: string
  selectedPortfolioId: string
  onBondSelect: (key: string) => void
  onPortfolioSelect: (id: string) => void
  onAmountChange: (v: string) => void
  onSpreadBuyChange: (v: string) => void
  onSpreadNowChange: (v: string) => void
  onIpcaRefChange: (v: string) => void
  onBuyDateChange: (v: string) => void
  onMaturityDateChange: (v: string) => void
  onBondTypeChange: (v: BondType) => void
  onCalc: () => void
  onClear: () => void
}

export const BondForm = ({
  bondType,
  amount,
  spreadBuy,
  spreadNow,
  ipcaRef,
  buyDate,
  maturityDate,
  autoFilledDate,
  bondsLoading,
  bondsError,
  portfolioLoading,
  portfolioTesouro,
  groupedBonds,
  selectedKey,
  selectedPortfolioId,
  onBondSelect,
  onPortfolioSelect,
  onAmountChange,
  onSpreadBuyChange,
  onSpreadNowChange,
  onIpcaRefChange,
  onBuyDateChange,
  onMaturityDateChange,
  onBondTypeChange,
  onCalc,
  onClear,
}: BondFormProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base font-semibold text-foreground">
        Marcação a Mercado — Tesouro Direto
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-5">
      <Field label="Meus títulos no portfólio">
        <select
          value={selectedPortfolioId}
          onChange={(e) => onPortfolioSelect(e.target.value)}
          disabled={portfolioLoading || portfolioTesouro.length === 0}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          {!portfolioLoading && portfolioTesouro.length === 0 ? (
            <option value="">Nenhum título Tesouro Direto encontrado no portfólio</option>
          ) : (
            <>
              <option value="">— selecione para preencher automaticamente —</option>
              {portfolioTesouro.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.ticker}
                </option>
              ))}
            </>
          )}
        </select>
      </Field>

      <Field label="Selecionar título">
        <select
          value={selectedKey}
          onChange={(e) => onBondSelect(e.target.value)}
          disabled={bondsLoading}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        >
          <option value="">
            {bondsLoading
              ? 'Carregando títulos...'
              : bondsError
                ? 'Erro ao carregar títulos'
                : '— preencha manualmente ou selecione um título —'}
          </option>
          {Object.entries(groupedBonds).map(([tipo, list]) => (
            <optgroup key={tipo} label={tipo}>
              {list.map((b) => (
                <option key={b.ticker} value={b.ticker}>
                  {b.vencimento} — taxa venda: {b.taxaVenda.toFixed(2)}%
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        {autoFilledDate && (
          <p className="text-xs text-muted-foreground mt-1">
            Taxas e vencimento auto-preenchidos · referência: {autoFilledDate}
          </p>
        )}
        {bondsError && <p className="text-xs text-destructive mt-1">{bondsError}</p>}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CurrencyInput
          id="td-amount"
          label="Preço de compra (PU)"
          value={amount}
          onChange={onAmountChange}
          placeholder="2870.00"
        />
        <PercentInput
          id="td-spread-buy"
          label={
            bondType === 'ipca' ? 'IPCA+ de compra (spread % a.a.)' : 'Taxa de compra (% a.a.)'
          }
          value={spreadBuy}
          onChange={onSpreadBuyChange}
          placeholder={bondType === 'ipca' ? 'ex: 6.50' : 'ex: 13.50'}
          showPrefix={false}
          selectValue={bondType}
          selectOptions={BOND_OPTIONS}
          onSelectChange={(v) => onBondTypeChange(v as BondType)}
        />
        {bondType === 'ipca' && (
          <PercentInput
            id="td-ipca"
            label="IPCA de referência (% a.a.)"
            value={ipcaRef}
            onChange={onIpcaRefChange}
            placeholder="ex: 5.50"
          />
        )}
        <PercentInput
          id="td-spread-now"
          label={
            bondType === 'ipca'
              ? 'IPCA+ atual do mercado (spread % a.a.)'
              : 'Taxa atual do mercado (% a.a.)'
          }
          value={spreadNow}
          onChange={onSpreadNowChange}
          placeholder={bondType === 'ipca' ? 'ex: 7.20' : 'ex: 12.80'}
        />
        <DateInput
          id="td-buy-date"
          label="Data de compra"
          value={buyDate}
          onChange={onBuyDateChange}
        />
        <DateInput
          id="td-maturity-date"
          label="Data de vencimento"
          value={maturityDate}
          onChange={onMaturityDateChange}
        />
      </div>

      <CalcActions onCalc={onCalc} onClear={onClear} />
    </CardContent>
  </Card>
)
