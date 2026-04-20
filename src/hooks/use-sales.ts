import { useEffect, useState } from 'react'
import {
  addSale as addSaleService,
  deleteSale as deleteSaleService,
  subscribeToAllSales,
  updateSale as updateSaleService,
} from '@/services/sales'
import { useAuth } from '@/store/auth'
import type { SaleItem } from '@/types'

export const useSales = () => {
  const { user } = useAuth()
  const [sales, setSales] = useState<SaleItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    return subscribeToAllSales(user.uid, (data) => {
      setSales(data)
      setLoading(false)
    })
  }, [user])

  const addSale = (item: Omit<SaleItem, 'id'>) => {
    if (!user) return Promise.resolve()
    return addSaleService(user.uid, item)
  }

  const updateSale = (id: string, data: Partial<Omit<SaleItem, 'id'>>) => {
    if (!user) return Promise.resolve()
    return updateSaleService(user.uid, id, data)
  }

  const deleteSale = (id: string) => {
    if (!user) return Promise.resolve()
    return deleteSaleService(user.uid, id)
  }

  return { sales, loading, addSale, updateSale, deleteSale }
}
