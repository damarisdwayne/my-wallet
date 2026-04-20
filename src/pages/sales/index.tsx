import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Pencil, PlusCircle, ShoppingCart, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardValue } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useSales } from '@/hooks/use-sales'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { SaleCategory, SaleItem } from '@/types'
import {
  emptyBuyForm,
  emptySellForm,
  formatMonthLabel,
  saleCategories,
  todayMonth,
  todayStr,
} from './utils'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

const BuyFormFields = ({
  prefix,
  form,
  onChange,
}: {
  prefix: string
  form: typeof emptyBuyForm
  onChange: (f: typeof emptyBuyForm) => void
}) => (
  <div className="space-y-4">
    <div className="space-y-1.5">
      <label htmlFor={`${prefix}-name`} className="text-sm font-medium text-foreground">
        Nome do item
      </label>
      <input
        id={`${prefix}-name`}
        className={inputClass}
        placeholder="Ex: RTX 4070 Ti"
        value={form.name}
        onChange={(e) => onChange({ ...form, name: e.target.value })}
        autoFocus
      />
    </div>
    <div className="space-y-1.5">
      <label htmlFor={`${prefix}-cat`} className="text-sm font-medium text-foreground">
        Categoria
      </label>
      <select
        id={`${prefix}-cat`}
        className={inputClass}
        value={form.category}
        onChange={(e) => onChange({ ...form, category: e.target.value as SaleCategory })}
      >
        {Object.entries(saleCategories).map(([k, v]) => (
          <option key={k} value={k}>
            {v}
          </option>
        ))}
      </select>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-buy`} className="text-sm font-medium text-foreground">
          Preço de compra (R$)
        </label>
        <input
          id={`${prefix}-buy`}
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
          placeholder="0,00"
          value={form.buyPrice}
          onChange={(e) => onChange({ ...form, buyPrice: e.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={`${prefix}-date`} className="text-sm font-medium text-foreground">
          Data de compra
        </label>
        <input
          id={`${prefix}-date`}
          type="date"
          className={inputClass}
          value={form.boughtAt}
          onChange={(e) => onChange({ ...form, boughtAt: e.target.value })}
        />
      </div>
    </div>
    <div className="space-y-1.5">
      <label htmlFor={`${prefix}-notes`} className="text-sm font-medium text-foreground">
        Observações <span className="text-muted-foreground">(opcional)</span>
      </label>
      <textarea
        id={`${prefix}-notes`}
        className={inputClass}
        rows={2}
        placeholder="Ex: Comprado no Kabum"
        value={form.notes}
        onChange={(e) => onChange({ ...form, notes: e.target.value })}
      />
    </div>
  </div>
)

export const SalesPage = () => {
  const { sales, addSale, updateSale, deleteSale } = useSales()

  const [selectedMonth, setSelectedMonth] = useState(todayMonth)

  // Buy dialog
  const [buyOpen, setBuyOpen] = useState(false)
  const [buyForm, setBuyForm] = useState(emptyBuyForm)
  const [editingItem, setEditingItem] = useState<SaleItem | null>(null)
  const [editBuyOpen, setEditBuyOpen] = useState(false)
  const [editBuyForm, setEditBuyForm] = useState(emptyBuyForm)

  // Sell dialog
  const [sellOpen, setSellOpen] = useState(false)
  const [sellingItem, setSellingItem] = useState<SaleItem | null>(null)
  const [sellForm, setSellForm] = useState(emptySellForm)

  const stock = useMemo(() => sales.filter((s) => !s.soldAt), [sales])

  // All months that have either a purchase or a sale
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

  // Items sold in the selected month (for the sold table)
  const monthlySold = useMemo(
    () =>
      sales
        .filter(
          (s): s is SaleItem & { soldAt: string } => s.soldAt?.startsWith(selectedMonth) ?? false,
        )
        .sort((a, b) => b.soldAt.localeCompare(a.soldAt)),
    [sales, selectedMonth],
  )

  // Cash-basis totals: cost = what was bought this month, revenue = what was sold this month
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

  const maxHistory = Math.max(...monthlyHistory.map((h) => Math.abs(h.profit)), 1)

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

  // ── handlers ────────────────────────────────────────────────

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-foreground">Vendas</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              disabled={!canGoPrev}
              className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium text-foreground w-16 text-center">
              {formatMonthLabel(selectedMonth)}
            </span>
            <button
              onClick={() => canGoNext && setSelectedMonth(availableMonths[currentIndex - 1])}
              disabled={!canGoNext}
              className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-default"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <button
          onClick={() => setBuyOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
        >
          <PlusCircle size={15} />
          Registrar compra
        </button>
      </div>

      {/* Stock */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className="text-primary" />
              <CardTitle>Em estoque</CardTitle>
            </div>
            <span className="text-xs text-muted-foreground">
              {stock.length} {stock.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {stock.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item em estoque. Registre uma compra para começar.
            </p>
          ) : (
            <div className="space-y-2">
              {stock.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="secondary">{saleCategories[item.category]}</Badge>
                    <div className="min-w-0">
                      <span className="text-sm text-foreground">{item.name}</span>
                      {item.notes && (
                        <p className="text-[10px] text-muted-foreground truncate">{item.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(item.buyPrice)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDate(item.boughtAt)}
                      </p>
                    </div>
                    <button
                      onClick={() => openSell(item)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Vender
                    </button>
                    <button
                      onClick={() => openEditBuy(item)}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => deleteSale(item.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Receita</CardTitle>
            <CardValue>{formatCurrency(totals.receita)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Custo</CardTitle>
            <CardValue>{formatCurrency(totals.custo)}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lucro</CardTitle>
            <CardValue className={totals.lucro >= 0 ? 'text-success' : 'text-destructive'}>
              {formatCurrency(totals.lucro)}
            </CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Margem</CardTitle>
            <CardValue>{totals.margem === null ? '—' : `${totals.margem}%`}</CardValue>
          </CardHeader>
        </Card>
      </div>

      {/* Monthly history chart */}
      {monthlyHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Histórico mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-28">
              {monthlyHistory.map((h) => {
                const pct = (Math.abs(h.profit) / maxHistory) * 100
                const isSelected = h.month === selectedMonth
                const isPositive = h.profit >= 0
                return (
                  <button
                    key={h.month}
                    onClick={() => setSelectedMonth(h.month)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    title={formatCurrency(h.profit)}
                  >
                    <span
                      className={`text-[10px] font-medium transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      {formatCurrency(h.profit)}
                    </span>
                    <div
                      className={`w-full rounded-t transition-colors ${
                        isSelected
                          ? isPositive
                            ? 'bg-primary'
                            : 'bg-destructive'
                          : isPositive
                            ? 'bg-primary/30 group-hover:bg-primary/50'
                            : 'bg-destructive/30 group-hover:bg-destructive/50'
                      }`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                    <span
                      className={`text-[10px] transition-colors ${isSelected ? 'text-primary font-medium' : 'text-muted-foreground'}`}
                    >
                      {formatMonthLabel(h.month)}
                    </span>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(categoryBreakdown).map(([cat, { profit, count }]) => (
            <Card key={cat} className="text-center">
              <CardHeader className="p-4">
                <CardTitle>{saleCategories[cat as SaleCategory]}</CardTitle>
                <p
                  className={`text-lg font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}
                >
                  {formatCurrency(profit)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {count} {count === 1 ? 'venda' : 'vendas'}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Sold items table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Vendidos — {formatMonthLabel(selectedMonth)}</CardTitle>
            <span className="text-xs text-muted-foreground">{monthlySold.length} registros</span>
          </div>
        </CardHeader>
        <CardContent>
          {monthlySold.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nenhuma venda registrada neste mês.
            </p>
          ) : (
            <div className="space-y-2">
              {monthlySold.map((item) => {
                const profit = (item.sellPrice ?? 0) - item.buyPrice
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Badge variant="secondary">{saleCategories[item.category]}</Badge>
                      <div className="min-w-0">
                        <span className="text-sm text-foreground">{item.name}</span>
                        {item.notes && (
                          <p className="text-[10px] text-muted-foreground truncate">{item.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-sm">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(item.buyPrice)}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-medium text-foreground">
                          {formatCurrency(item.sellPrice ?? 0)}
                        </span>
                      </div>
                      <Badge variant={profit >= 0 ? 'success' : 'destructive'}>
                        {profit >= 0 ? '+' : ''}
                        {formatCurrency(profit)}
                      </Badge>
                      <button
                        onClick={() => deleteSale(item.id)}
                        className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Register buy dialog */}
      <Dialog open={buyOpen} onOpenChange={setBuyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar compra</DialogTitle>
            <DialogDescription>Adicione um equipamento ao estoque.</DialogDescription>
          </DialogHeader>
          <BuyFormFields prefix="buy" form={buyForm} onChange={setBuyForm} />
          <DialogFooter>
            <button
              onClick={() => setBuyOpen(false)}
              className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleBuy}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              Adicionar ao estoque
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit buy dialog */}
      <Dialog open={editBuyOpen} onOpenChange={setEditBuyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar compra</DialogTitle>
            <DialogDescription>Atualize os dados do equipamento.</DialogDescription>
          </DialogHeader>
          <BuyFormFields prefix="edit" form={editBuyForm} onChange={setEditBuyForm} />
          <DialogFooter>
            <button
              onClick={() => setEditBuyOpen(false)}
              className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleEditBuy}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              Salvar
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sell dialog */}
      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar venda</DialogTitle>
            <DialogDescription>
              {sellingItem && (
                <span>
                  <strong>{sellingItem.name}</strong> · comprado por{' '}
                  {formatCurrency(sellingItem.buyPrice)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Preço de venda (R$)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                placeholder="0,00"
                value={sellForm.sellPrice}
                onChange={(e) => setSellForm((f) => ({ ...f, sellPrice: e.target.value }))}
                autoFocus
              />
              {sellForm.sellPrice && sellingItem && (
                <p className="text-xs text-muted-foreground">
                  Lucro:{' '}
                  <span
                    className={
                      Number(sellForm.sellPrice) - sellingItem.buyPrice >= 0
                        ? 'text-success font-medium'
                        : 'text-destructive font-medium'
                    }
                  >
                    {formatCurrency(Number(sellForm.sellPrice) - sellingItem.buyPrice)}
                  </span>
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Data de venda</label>
              <input
                type="date"
                className={inputClass}
                value={sellForm.soldAt}
                onChange={(e) => setSellForm((f) => ({ ...f, soldAt: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setSellOpen(false)}
              className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSell}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
            >
              Confirmar venda
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
