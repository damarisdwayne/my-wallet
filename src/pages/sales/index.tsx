import { useMemo, useState } from 'react'
import { SalesSkeleton } from '@/skeleton'
import { useSales } from '@/hooks/use-sales'
import type { SaleItem } from '@/types'
import { emptyBuyForm, emptySellForm, todayMonth, todayStr } from './utils'
import {
  BuyDialog,
  CategoryBreakdown,
  MonthlyChart,
  PageHeader,
  SellDialog,
  SoldList,
  StockList,
  SummaryCards,
} from './components'

export const SalesPage = () => {
  const { sales, loading, addSale, updateSale, deleteSale } = useSales()

  const [selectedMonth, setSelectedMonth] = useState(todayMonth)

  const [buyOpen, setBuyOpen] = useState(false)
  const [buyForm, setBuyForm] = useState(emptyBuyForm)
  const [editingItem, setEditingItem] = useState<SaleItem | null>(null)
  const [editBuyOpen, setEditBuyOpen] = useState(false)
  const [editBuyForm, setEditBuyForm] = useState(emptyBuyForm)

  const [sellOpen, setSellOpen] = useState(false)
  const [sellingItem, setSellingItem] = useState<SaleItem | null>(null)
  const [sellForm, setSellForm] = useState(emptySellForm)

  const stock = useMemo(() => sales.filter((s) => !s.soldAt), [sales])

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    for (const s of sales) {
      months.add(s.boughtAt.slice(0, 7))
      if (s.soldAt) months.add(s.soldAt.slice(0, 7))
    }
    return [...months].sort((a, b) => b.localeCompare(a))
  }, [sales])

  const currentIndex = availableMonths.indexOf(selectedMonth)
  const canGoPrev =
    currentIndex === -1 ? availableMonths.length > 0 : currentIndex < availableMonths.length - 1
  const canGoNext = currentIndex > 0

  const prevMonth = () => {
    if (currentIndex === -1 && availableMonths.length > 0) setSelectedMonth(availableMonths[0])
    else if (canGoPrev) setSelectedMonth(availableMonths[currentIndex + 1])
  }

  const monthlySold = useMemo(
    () =>
      sales
        .filter(
          (s): s is SaleItem & { soldAt: string } => s.soldAt?.startsWith(selectedMonth) ?? false,
        )
        .sort((a, b) => b.soldAt.localeCompare(a.soldAt)),
    [sales, selectedMonth],
  )

  const totals = useMemo(() => {
    const receita = monthlySold.reduce((s, i) => s + (i.sellPrice ?? 0), 0)
    const custo = sales
      .filter((s) => s.boughtAt.startsWith(selectedMonth))
      .reduce((s, i) => s + i.buyPrice, 0)
    const lucro = receita - custo
    const margem = receita > 0 ? ((lucro / receita) * 100).toFixed(1) : null
    return { receita, custo, lucro, margem }
  }, [sales, monthlySold, selectedMonth])

  const monthlyHistory = useMemo(() => {
    const months = [...availableMonths].reverse().slice(-7)
    return months.map((m) => {
      const receita = sales
        .filter((s) => s.soldAt?.startsWith(m))
        .reduce((s, i) => s + (i.sellPrice ?? 0), 0)
      const custo = sales
        .filter((s) => s.boughtAt.startsWith(m))
        .reduce((s, i) => s + i.buyPrice, 0)
      return { month: m, profit: receita - custo }
    })
  }, [sales, availableMonths])

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { profit: number; count: number }> = {}
    for (const item of monthlySold) {
      const profit = (item.sellPrice ?? 0) - item.buyPrice
      if (!map[item.category]) map[item.category] = { profit: 0, count: 0 }
      map[item.category].profit += profit
      map[item.category].count += 1
    }
    return map
  }, [monthlySold])

  if (loading) return <SalesSkeleton />

  const handleBuy = async () => {
    const buyPrice = Number.parseFloat(String(buyForm.buyPrice).replace(',', '.'))
    if (!buyForm.name.trim() || Number.isNaN(buyPrice) || buyPrice <= 0) return
    await addSale({
      name: buyForm.name.trim(),
      category: buyForm.category,
      buyPrice,
      boughtAt: buyForm.boughtAt,
      ...(buyForm.notes.trim() ? { notes: buyForm.notes.trim() } : {}),
    })
    setBuyForm(emptyBuyForm)
    setBuyOpen(false)
  }

  const openEditBuy = (item: SaleItem) => {
    setEditingItem(item)
    setEditBuyForm({
      name: item.name,
      category: item.category,
      buyPrice: String(item.buyPrice),
      boughtAt: item.boughtAt,
      notes: item.notes ?? '',
    })
    setEditBuyOpen(true)
  }

  const handleEditBuy = async () => {
    if (!editingItem) return
    const buyPrice = Number.parseFloat(String(editBuyForm.buyPrice).replace(',', '.'))
    if (!editBuyForm.name.trim() || Number.isNaN(buyPrice) || buyPrice <= 0) return
    await updateSale(editingItem.id, {
      name: editBuyForm.name.trim(),
      category: editBuyForm.category,
      buyPrice,
      boughtAt: editBuyForm.boughtAt,
      notes: editBuyForm.notes.trim() || undefined,
    })
    setEditBuyOpen(false)
    setEditingItem(null)
  }

  const openSell = (item: SaleItem) => {
    setSellingItem(item)
    setSellForm({ sellPrice: '', soldAt: todayStr })
    setSellOpen(true)
  }

  const handleSell = async () => {
    if (!sellingItem) return
    const sellPrice = Number.parseFloat(String(sellForm.sellPrice).replace(',', '.'))
    if (Number.isNaN(sellPrice) || sellPrice <= 0) return
    await updateSale(sellingItem.id, { sellPrice, soldAt: sellForm.soldAt })
    setSellOpen(false)
    setSellingItem(null)
  }

  const maxHistory = Math.max(...monthlyHistory.map((h) => Math.abs(h.profit)), 1)

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        selectedMonth={selectedMonth}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrev={prevMonth}
        onNext={() => canGoNext && setSelectedMonth(availableMonths[currentIndex - 1])}
        onRegisterBuy={() => setBuyOpen(true)}
      />

      <StockList stock={stock} onSell={openSell} onEdit={openEditBuy} onDelete={deleteSale} />

      <SummaryCards
        receita={totals.receita}
        custo={totals.custo}
        lucro={totals.lucro}
        margem={totals.margem}
      />

      {monthlyHistory.length > 0 && (
        <MonthlyChart
          data={monthlyHistory}
          selectedMonth={selectedMonth}
          maxValue={maxHistory}
          onSelectMonth={setSelectedMonth}
        />
      )}

      {Object.keys(categoryBreakdown).length > 0 && (
        <CategoryBreakdown breakdown={categoryBreakdown} />
      )}

      <SoldList items={monthlySold} selectedMonth={selectedMonth} onDelete={deleteSale} />

      <BuyDialog
        open={buyOpen}
        title="Registrar compra"
        description="Adicione um equipamento ao estoque."
        submitLabel="Adicionar ao estoque"
        form={buyForm}
        onChange={setBuyForm}
        onClose={() => setBuyOpen(false)}
        onSubmit={handleBuy}
      />

      <BuyDialog
        open={editBuyOpen}
        title="Editar compra"
        description="Atualize os dados do equipamento."
        submitLabel="Salvar"
        form={editBuyForm}
        onChange={setEditBuyForm}
        onClose={() => {
          setEditBuyOpen(false)
          setEditingItem(null)
        }}
        onSubmit={handleEditBuy}
      />

      <SellDialog
        open={sellOpen}
        item={sellingItem}
        form={sellForm}
        onChange={setSellForm}
        onClose={() => setSellOpen(false)}
        onSubmit={handleSell}
      />
    </div>
  )
}
