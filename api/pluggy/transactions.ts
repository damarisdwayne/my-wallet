import type { VercelRequest, VercelResponse } from '@vercel/node'
import { pluggyFetch } from './_client'

// GET /api/pluggy/transactions?accountId=xxx&from=YYYY-MM-DD&to=YYYY-MM-DD&page=1
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return res.status(405).end()
  const { accountId, from, to, page = '1' } = req.query
  if (!accountId || typeof accountId !== 'string')
    return res.status(400).json({ error: 'accountId required' })

  try {
    const params = new URLSearchParams({ accountId, page: String(page) })
    if (from) params.set('from', String(from))
    if (to) params.set('to', String(to))

    const data = await pluggyFetch(`/transactions?${params}`)
    return res.json(data)
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
