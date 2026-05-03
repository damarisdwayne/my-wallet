import type { VercelRequest, VercelResponse } from '@vercel/node'
import { pluggyFetch } from './_client'

// GET /api/pluggy/accounts?itemId=xxx
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') return res.status(405).end()
  const { itemId } = req.query
  if (!itemId || typeof itemId !== 'string')
    return res.status(400).json({ error: 'itemId required' })

  try {
    const data = await pluggyFetch(`/accounts?itemId=${itemId}`)
    return res.json(data)
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
