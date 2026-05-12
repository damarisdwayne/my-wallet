import { useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import {
  addWatchlistAsset,
  addWatchlistGroup,
  deleteWatchlistAsset,
  deleteWatchlistGroup,
  subscribeToWatchlistAssets,
  subscribeToWatchlistGroups,
  updateWatchlistAsset,
  updateWatchlistGroup,
} from '@/services/watchlist'
import type { AssetType, WatchlistAsset, WatchlistField, WatchlistGroup, WatchlistVerdict } from '@/types'
import { toast } from 'sonner'

export const useWatchlist = (uid: string | null) => {
  const [groups, setGroups] = useState<WatchlistGroup[]>([])
  const [assets, setAssets] = useState<WatchlistAsset[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!uid) return
    const unsubGroups = subscribeToWatchlistGroups(uid, setGroups)
    const unsubAssets = subscribeToWatchlistAssets(uid, (data) => {
      setAssets(data)
      setLoaded(true)
    })
    return () => {
      unsubGroups()
      unsubAssets()
    }
  }, [uid])

  const createGroup = async (name: string, description?: string) => {
    if (!uid) return
    const group: WatchlistGroup = {
      id: nanoid(),
      name,
      description,
      createdAt: new Date().toISOString(),
      order: groups.length,
      fields: [],
    }
    try {
      await addWatchlistGroup(uid, group)
    } catch {
      toast.error('Erro ao criar categoria')
    }
  }

  const editGroup = async (groupId: string, data: Partial<WatchlistGroup>) => {
    if (!uid) return
    try {
      await updateWatchlistGroup(uid, groupId, data)
    } catch {
      toast.error('Erro ao editar categoria')
    }
  }

  const updateGroupFields = (groupId: string, fields: WatchlistField[]) =>
    editGroup(groupId, { fields })

  const removeGroup = async (groupId: string) => {
    if (!uid) return
    const assetIds = assets.filter((a) => a.groupId === groupId).map((a) => a.id)
    try {
      await deleteWatchlistGroup(uid, groupId, assetIds)
    } catch {
      toast.error('Erro ao excluir categoria')
    }
  }

  const addAsset = async (groupId: string, ticker: string, name: string, type: AssetType) => {
    if (!uid) return
    const asset: WatchlistAsset = {
      id: nanoid(),
      groupId,
      ticker: ticker.toUpperCase(),
      name,
      type,
      notes: '',
      verdict: 'none',
      createdAt: new Date().toISOString(),
      fieldValues: {},
    }
    try {
      await addWatchlistAsset(uid, asset)
    } catch {
      toast.error('Erro ao adicionar ativo')
    }
  }

  const editAsset = async (assetId: string, data: Partial<WatchlistAsset>) => {
    if (!uid) return
    try {
      await updateWatchlistAsset(uid, assetId, data)
    } catch {
      toast.error('Erro ao editar ativo')
    }
  }

  const removeAsset = async (assetId: string) => {
    if (!uid) return
    try {
      await deleteWatchlistAsset(uid, assetId)
    } catch {
      toast.error('Erro ao excluir ativo')
    }
  }

  const setVerdict = (assetId: string, verdict: WatchlistVerdict) =>
    editAsset(assetId, { verdict })

  const setFieldValue = (assetId: string, fieldId: string, value: string) => {
    const asset = assets.find((a) => a.id === assetId)
    if (!asset) return
    return editAsset(assetId, { fieldValues: { ...asset.fieldValues, [fieldId]: value } })
  }

  return {
    groups,
    assets,
    loaded,
    createGroup,
    editGroup,
    updateGroupFields,
    removeGroup,
    addAsset,
    editAsset,
    removeAsset,
    setVerdict,
    setFieldValue,
  }
}
