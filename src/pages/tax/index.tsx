import { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { subscribeToAllDividends } from '@/services/dividends'
import { subscribeToAssets } from '@/services/assets'
import { subscribeToTrades } from '@/services/trades'
import { fetchPtaxRate, fetchTickerSets } from '@/services/quotes'
import type { TickerSets } from '@/services/quotes'
import { useAuth } from '@/store/auth'
import { useFundamentals } from '@/hooks/use-fundamentals'
import {
  availableYears,
  calcMonthlyRV,
  calcRealizedGains,
  calcRendimentosExterior,
  calcRendimentosIsentos,
  calcRendimentosTributaveis,
} from '@/lib/ir-calc'
import type { Asset, Dividend, Trade } from '@/types'
import type { Tab } from './constants'
import {
  AssetsSection,
  ExemptIncomeSection,
  ForeignIncomeSection,
  GuideSection,
  PageHeader,
  SummaryCards,
  TabBar,
  VariableIncomeSection,
  WithholdingSection,
} from './components'

export const TaxPage = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [dividends, setDividends] = useState<Dividend[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('bens')
  const [usdRate, setUsdRate] = useState(0)
  const [tickerSets, setTickerSets] = useState<TickerSets | undefined>()
  const { fiiInfo, stockInfo } = useFundamentals(user?.uid ?? null)

  useEffect(() => {
    fetchPtaxRate()
      .then(setUsdRate)
      .catch(() => setUsdRate(0))
    fetchTickerSets()
      .then(setTickerSets)
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!user) return
    const unsubs = [
      subscribeToAssets(user.uid, setAssets),
      subscribeToTrades(user.uid, setTrades),
      subscribeToAllDividends(user.uid, setDividends),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const years = useMemo(() => availableYears(trades, dividends), [trades, dividends])
  const currentYear = new Date().getFullYear()
  // Abre no último ano-base fechado (ano-calendário anterior) — é a declaração que se entrega agora;
  // o ano corrente ainda está em andamento.
  const [selectedYear, setSelectedYear] = useState<number>(currentYear - 1)
  const effectiveYear = years.includes(selectedYear) ? selectedYear : (years[0] ?? currentYear)

  const totalIrJcp = useMemo(
    () => calcRendimentosTributaveis(dividends, effectiveYear).reduce((s, i) => s + i.ir, 0),
    [dividends, effectiveYear],
  )

  const totalIsento = useMemo(
    () => calcRendimentosIsentos(dividends, effectiveYear).reduce((s, i) => s + i.amount, 0),
    [dividends, effectiveYear],
  )

  const totalExterior = useMemo(
    () =>
      calcRendimentosExterior(dividends, effectiveYear, usdRate).reduce((s, i) => s + i.gross, 0),
    [dividends, effectiveYear, usdRate],
  )

  const gains = useMemo(
    () => calcRealizedGains(trades, effectiveYear, assets, tickerSets),
    [trades, effectiveYear, assets, tickerSets],
  )
  const monthlyRV = useMemo(() => calcMonthlyRV(gains, effectiveYear), [gains, effectiveYear])
  const totalDARF = useMemo(() => monthlyRV.reduce((s, m) => s + m.irDue, 0), [monthlyRV])

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <PageHeader
        effectiveYear={effectiveYear}
        years={years}
        currentYear={currentYear}
        onSelectYear={setSelectedYear}
      />

      <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
        <Info size={18} className="text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-foreground leading-relaxed">
          <span className="font-semibold">
            Confira com o relatório oficial da B3 antes de declarar.
          </span>{' '}
          Os números abaixo são calculados a partir dos seus lançamentos — sempre confronte com a
          fonte oficial. Em{' '}
          <a
            href="https://www.investidor.b3.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
          >
            investidor.b3.com.br
          </a>
          , acesse{' '}
          <span className="font-medium text-foreground">Relatórios → Relatório Consolidado</span> e
          selecione o ano. Ele reúne posição em custódia, proventos recebidos e IR retido no ano —
          use para bater com este resumo.
        </p>
      </div>

      <SummaryCards
        totalIsento={totalIsento}
        totalExterior={totalExterior}
        totalIrJcp={totalIrJcp}
        totalDARF={totalDARF}
      />

      <TabBar activeTab={activeTab} onSelect={setActiveTab} />

      {activeTab === 'bens' && (
        <AssetsSection
          year={effectiveYear}
          trades={trades}
          assets={assets}
          sets={tickerSets}
          fiiInfoMap={fiiInfo}
          stockInfoMap={stockInfo}
        />
      )}
      {activeTab === 'isentos' && (
        <ExemptIncomeSection year={effectiveYear} dividends={dividends} />
      )}
      {activeTab === 'tributavel' && (
        <WithholdingSection year={effectiveYear} dividends={dividends} />
      )}
      {activeTab === 'exterior' && (
        <ForeignIncomeSection year={effectiveYear} dividends={dividends} usdRate={usdRate} />
      )}
      {activeTab === 'rv' && (
        <VariableIncomeSection
          year={effectiveYear}
          trades={trades}
          assets={assets}
          sets={tickerSets}
        />
      )}
      {activeTab === 'guia' && <GuideSection />}

      <p className="text-xs text-muted-foreground text-center pb-2">
        Este relatório é gerado automaticamente a partir dos dados cadastrados. Sempre revise com
        seu contador antes de enviar a declaração.
      </p>
    </div>
  )
}
