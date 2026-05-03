import type { VercelRequest, VercelResponse } from '@vercel/node'
import { pluggyFetch } from './_client'

// POST /api/pluggy/connect-token
// body: { itemId?: string }  — pass itemId to reconnect an existing item
export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const body: Record<string, unknown> = {}
    if (req.body?.itemId) body.itemId = req.body.itemId

    const data = await pluggyFetch('/connect_token', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    return res.json({ accessToken: data.accessToken })
  } catch (e) {
    return res.status(500).json({ error: (e as Error).message })
  }
}
