import { useEffect, useState } from 'react'
import { addAsset as addAssetService, subscribeToAssets } from '@/services/assets'
import { saveAnswers as saveAnswersService, subscribeToAnswers } from '@/services/answers'
import { saveCategory as saveCategoryService, subscribeToCategories } from '@/services/categories'
import { saveDiagram as saveDiagramService, subscribeToDiagrams } from '@/services/diagrams'
import { useAuth } from '@/store/auth'
import type { Asset, AssetAnswers, Diagram, PortfolioCategory } from '@/types'

export const usePortfolio = () => {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [categories, setCategories] = useState<PortfolioCategory[]>([])
  const [diagrams, setDiagrams] = useState<Diagram[]>([])
  const [answers, setAnswers] = useState<Record<string, AssetAnswers>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let resolved = 0
    const onLoad = () => {
      resolved++
      if (resolved === 4) setLoading(false)
    }
    const unsubs = [
      subscribeToAssets(user.uid, (data) => {
        setAssets(data)
        onLoad()
      }),
      subscribeToCategories(user.uid, (data) => {
        setCategories(data)
        onLoad()
      }),
      subscribeToDiagrams(user.uid, (data) => {
        setDiagrams(data)
        onLoad()
      }),
      subscribeToAnswers(user.uid, (data) => {
        setAnswers(data)
        onLoad()
      }),
    ]
    return () => unsubs.forEach((u) => u())
  }, [user])

  const addAsset = (asset: Asset) => {
    if (!user) return Promise.resolve()
    return addAssetService(user.uid, asset)
  }

  const saveCategory = (cat: PortfolioCategory) => {
    if (!user) return Promise.resolve()
    return saveCategoryService(user.uid, cat)
  }

  const saveDiagram = (diagram: Diagram) => {
    if (!user) return Promise.resolve()
    return saveDiagramService(user.uid, diagram)
  }

  const saveAnswers = (assetId: string, assetAnswers: AssetAnswers) => {
    if (!user) return Promise.resolve()
    return saveAnswersService(user.uid, assetId, assetAnswers)
  }

  return {
    loading,
    assets,
    categories,
    diagrams,
    answers,
    addAsset,
    saveCategory,
    saveDiagram,
    saveAnswers,
  }
}
