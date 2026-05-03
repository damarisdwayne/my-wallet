import { useEffect, useState } from 'react'
import { Building2, ChevronLeft, Loader2, Plus, Trash2 } from 'lucide-react'
import { PluggyConnect } from 'react-pluggy-connect'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  deleteConnectedItem,
  fetchAccounts,
  fetchTransactions,
  getConnectToken,
  saveConnectedItem,
  subscribeToConnectedItems,
} from '@/services/pluggy'
import { guessCategory } from '@/services/ofx-import'
import { useAuth } from '@/store/auth'
import type { PluggyAccount, PluggyConnectedItem } from '@/types/pluggy'
import type { ExpenseCategory } from '@/types'
import { categoryColors, categoryLabel } from '../../utils'

interface Row {
  id: string
  date: string
  description: string
  amount: number
  category: ExpenseCategory
  selected: boolean
}

type Step = 'list' | 'accounts' | 'review'

const inputClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface Props {
  selectedMonth: string
  onImport: (
    items: {
      description: string
      amount: number
      category: ExpenseCategory
      date: string
      source: 'manual'
    }[],
  ) => Promise<void>
}

export const OpenFinanceDialog = ({ selectedMonth, onImport }: Props) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('list')
  const [connectedItems, setConnectedItems] = useState<PluggyConnectedItem[]>([])
  const [selectedItem, setSelectedItem] = useState<PluggyConnectedItem | null>(null)
  const [accounts, setAccounts] = useState<PluggyAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [dateFrom, setDateFrom] = useState(`${selectedMonth}-01`)
  const [dateTo, setDateTo] = useState(() => {
    const [y, m] = selectedMonth.split('-').map(Number)
    const last = new Date(y, m, 0).getDate()
    return `${selectedMonth}-${String(last).padStart(2, '0')}`
  })
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [connectToken, setConnectToken] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !user) return
    const unsub = subscribeToConnectedItems(user.uid, setConnectedItems)
    return unsub
  }, [open, user])

  useEffect(() => {
    setDateFrom(`${selectedMonth}-01`)
    const [y, m] = selectedMonth.split('-').map(Number)
    const last = new Date(y, m, 0).getDate()
    setDateTo(`${selectedMonth}-${String(last).padStart(2, '0')}`)
  }, [selectedMonth])

  const handleConnect = async () => {
    setError('')
    try {
      const token = await getConnectToken()
      setOpen(false) // fecha o Dialog para evitar conflito de overlay com o widget
      setConnectToken(token)
    } catch {
      setError('Erro ao iniciar conexão. Tente novamente.')
    }
  }

  const handleConnectSuccess = async (itemData: {
    id: string
    connector: { name: string; imageUrl: string }
    status: string
    lastUpdatedAt: string
  }) => {
    if (!user) return
    await saveConnectedItem(user.uid, {
      itemId: itemData.id,
      connectorName: itemData.connector.name,
      connectorImageUrl: itemData.connector.imageUrl,
      status: itemData.status as PluggyConnectedItem['status'],
      connectedAt: new Date().toISOString(),
      lastUpdatedAt: itemData.lastUpdatedAt,
    })
    setConnectToken(null)
    setOpen(true) // reabre o Dialog com o banco já na lista
  }

  const handleSelectItem = async (item: PluggyConnectedItem) => {
    setSelectedItem(item)
    setLoading(true)
    setError('')
    try {
      const list = await fetchAccounts(item.itemId)
      setAccounts(list)
      setSelectedAccountId(list[0]?.id ?? '')
      setStep('accounts')
    } catch {
      setError('Erro ao buscar contas.')
    } finally {
      setLoading(false)
    }
  }

  const handleFetchTransactions = async () => {
    if (!selectedAccountId) return
    setLoading(true)
    setError('')
    try {
      const data = await fetchTransactions(selectedAccountId, dateFrom, dateTo)
      const debits = data.results.filter((t) => t.type === 'DEBIT')
      setRows(
        debits.map((t) => ({
          id: t.id,
          date: t.date.slice(0, 10),
          description: t.description,
          amount: t.amount,
          category: guessCategory(t.description),
          selected: true,
        })),
      )
      setStep('review')
    } catch {
      setError('Erro ao buscar transações.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    const selected = rows.filter((r) => r.selected)
    if (selected.length === 0) return
    setLoading(true)
    try {
      await onImport(
        selected.map((r) => ({
          description: r.description,
          amount: r.amount,
          category: r.category,
          date: r.date,
          source: 'manual' as const,
        })),
      )
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setStep('list')
    setSelectedItem(null)
    setAccounts([])
    setRows([])
    setError('')
    setConnectToken(null)
  }

  const handleDelete = async (itemId: string) => {
    if (!user) return
    await deleteConnectedItem(user.uid, itemId)
  }

  const selectedCount = rows.filter((r) => r.selected).length
  const toggleRow = (id: string, checked: boolean) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, selected: checked } : r)))
  const toggleAll = (checked: boolean) =>
    setRows((prev) => prev.map((r) => ({ ...r, selected: checked })))
  const setCategory = (id: string, category: ExpenseCategory) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, category } : r)))

  return (
    <>
      {connectToken && (
        <PluggyConnect
          connectToken={connectToken}
          onSuccess={({ item }) => handleConnectSuccess(item)}
          onError={(err) => {
            console.error('[Pluggy onError]', err)
            setError(`Erro: ${JSON.stringify(err)}`)
            setConnectToken(null)
            setOpen(true)
          }}
          onClose={() => {
            setConnectToken(null)
            setOpen(true)
          }}
        />
      )}

      <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : handleClose())}>
        <DialogTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm text-foreground hover:bg-accent transition-colors">
            <Building2 size={15} />
            Open Finance
          </button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-2">
              {step !== 'list' && (
                <button
                  onClick={() => setStep(step === 'review' ? 'accounts' : 'list')}
                  className="p-1 rounded-md hover:bg-accent transition-colors text-muted-foreground"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <DialogTitle>
                {step === 'list' && 'Open Finance'}
                {step === 'accounts' && `${selectedItem?.connectorName} — Selecionar conta`}
                {step === 'review' && 'Revisar transações'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* ── STEP: list ── */}
          {step === 'list' && (
            <div className="space-y-4 py-2">
              {connectedItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Building2 size={32} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum banco conectado ainda.
                    <br />
                    Conecte sua conta para importar transações automaticamente.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {connectedItems.map((item) => (
                    <li
                      key={item.itemId}
                      className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/40 transition-colors"
                    >
                      <button
                        className="flex items-center gap-3 flex-1 text-left"
                        onClick={() => handleSelectItem(item)}
                        disabled={loading}
                      >
                        {item.connectorImageUrl ? (
                          <img
                            src={item.connectorImageUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <Building2 size={20} className="text-muted-foreground" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{item.connectorName}</p>
                          <p className="text-xs text-muted-foreground">
                            Conectado em {new Date(item.connectedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleDelete(item.itemId)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <button
                onClick={handleConnect}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-accent/30 transition-colors"
              >
                <Plus size={15} />
                Conectar banco
              </button>
            </div>
          )}

          {/* ── STEP: accounts ── */}
          {step === 'accounts' && (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Conta
                </label>
                <select
                  className={inputClass}
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.type === 'CREDIT' ? 'Cartão' : 'Conta'} · Saldo{' '}
                      {a.balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    De
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Até
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          {/* ── STEP: review ── */}
          {step === 'review' && (
            <>
              <div className="flex items-center justify-between shrink-0 py-1">
                <p className="text-sm text-muted-foreground">
                  {rows.length} transaç{rows.length === 1 ? 'ão' : 'ões'} —{' '}
                  <span className="text-foreground font-medium">
                    {selectedCount} selecionada{selectedCount !== 1 ? 's' : ''}
                  </span>
                </p>
              </div>

              {rows.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Nenhuma transação de débito encontrada no período.
                </div>
              ) : (
                <div className="overflow-auto flex-1 min-h-0 rounded-md border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted sticky top-0">
                      <tr>
                        <th className="p-2 text-left w-8">
                          <input
                            type="checkbox"
                            checked={selectedCount === rows.length && rows.length > 0}
                            onChange={(e) => toggleAll(e.target.checked)}
                            className="accent-primary"
                          />
                        </th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-24">
                          Data
                        </th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground">
                          Descrição
                        </th>
                        <th className="p-2 text-left text-xs font-medium text-muted-foreground w-36">
                          Categoria
                        </th>
                        <th className="p-2 text-right text-xs font-medium text-muted-foreground w-28">
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-border hover:bg-accent/30 transition-colors"
                        >
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={row.selected}
                              onChange={(e) => toggleRow(row.id, e.target.checked)}
                              className="accent-primary"
                            />
                          </td>
                          <td className="p-2 text-muted-foreground tabular-nums whitespace-nowrap">
                            {row.date.split('-').reverse().join('/')}
                          </td>
                          <td
                            className="p-2 text-foreground max-w-45 truncate"
                            title={row.description}
                          >
                            {row.description}
                          </td>
                          <td className="p-2">
                            <select
                              className={`${inputClass} py-1 text-xs`}
                              value={row.category}
                              onChange={(e) =>
                                setCategory(row.id, e.target.value as ExpenseCategory)
                              }
                            >
                              {Object.entries(categoryLabel).map(([k, label]) => (
                                <option key={k} value={k}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 text-right tabular-nums">
                            <div className="flex items-center justify-end gap-2">
                              <Badge
                                variant={categoryColors[row.category]}
                                className="text-[10px] px-1.5 py-0 hidden sm:inline-flex"
                              >
                                {categoryLabel[row.category]}
                              </Badge>
                              <span className="text-destructive font-medium">
                                -{' '}
                                {row.amount.toLocaleString('pt-BR', {
                                  style: 'currency',
                                  currency: 'BRL',
                                })}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          <DialogFooter className="shrink-0">
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent transition-colors"
            >
              Cancelar
            </button>

            {step === 'accounts' && (
              <button
                onClick={handleFetchTransactions}
                disabled={!selectedAccountId || loading}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Buscar transações
              </button>
            )}

            {step === 'review' && rows.length > 0 && (
              <button
                onClick={handleImport}
                disabled={selectedCount === 0 || loading}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Importando…'
                  : `Importar ${selectedCount} transaç${selectedCount === 1 ? 'ão' : 'ões'}`}
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
