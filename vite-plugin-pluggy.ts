import type { Plugin } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const PLUGGY_API = 'https://api.pluggy.ai'

const getApiKey = async (): Promise<string> => {
  const res = await fetch(`${PLUGGY_API}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  })
  if (!res.ok) throw new Error(`Pluggy auth failed: ${res.status}`)
  const { apiKey } = (await res.json()) as { apiKey: string }
  return apiKey
}

const pluggyFetch = async (path: string, init?: RequestInit) => {
  const apiKey = await getApiKey()
  const res = await fetch(`${PLUGGY_API}${path}`, {
    ...init,
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`Pluggy request failed: ${res.status} ${path}`)
  return res.json()
}

const readBody = (req: IncomingMessage): Promise<string> =>
  new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => resolve(data))
  })

const send = (res: ServerResponse, status: number, body: unknown) => {
  const json = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(json)
}

export const pluggyDevPlugin = (): Plugin => ({
  name: 'pluggy-dev',
  configureServer(server) {
    server.middlewares.use('/api/pluggy', async (req, res, next) => {
      const url = new URL(req.url ?? '/', 'http://localhost')
      const route = url.pathname

      try {
        if (route === '/connect-token' && req.method === 'POST') {
          const raw = await readBody(req)
          const body = raw ? (JSON.parse(raw) as { itemId?: string }) : {}
          const payload: Record<string, unknown> = {}
          if (body.itemId) payload.itemId = body.itemId
          const data = await pluggyFetch('/connect_token', {
            method: 'POST',
            body: JSON.stringify(payload),
          })
          return send(res, 200, { accessToken: (data as { accessToken: string }).accessToken })
        }

        if (route === '/accounts' && req.method === 'GET') {
          const itemId = url.searchParams.get('itemId')
          if (!itemId) return send(res, 400, { error: 'itemId required' })
          const data = await pluggyFetch(`/accounts?itemId=${itemId}`)
          return send(res, 200, data)
        }

        if (route === '/transactions' && req.method === 'GET') {
          const params = new URLSearchParams()
          const accountId = url.searchParams.get('accountId')
          if (!accountId) return send(res, 400, { error: 'accountId required' })
          params.set('accountId', accountId)
          if (url.searchParams.get('from')) params.set('from', url.searchParams.get('from')!)
          if (url.searchParams.get('to')) params.set('to', url.searchParams.get('to')!)
          if (url.searchParams.get('page')) params.set('page', url.searchParams.get('page')!)
          const data = await pluggyFetch(`/transactions?${params}`)
          return send(res, 200, data)
        }

        if (route === '/investments' && req.method === 'GET') {
          const itemId = url.searchParams.get('itemId')
          if (!itemId) return send(res, 400, { error: 'itemId required' })
          const data = await pluggyFetch(`/investments?itemId=${itemId}`)
          return send(res, 200, data)
        }

        next()
      } catch (e) {
        send(res, 500, { error: (e as Error).message })
      }
    })
  },
})
