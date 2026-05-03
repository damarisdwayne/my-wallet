const PLUGGY_API = 'https://api.pluggy.ai'

export const getApiKey = async (): Promise<string> => {
  const res = await fetch(`${PLUGGY_API}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: process.env.PLUGGY_CLIENT_ID,
      clientSecret: process.env.PLUGGY_CLIENT_SECRET,
    }),
  })
  if (!res.ok) throw new Error(`Pluggy auth failed: ${res.status}`)
  const { apiKey } = await res.json()
  return apiKey
}

export const pluggyFetch = async (path: string, init?: RequestInit) => {
  const apiKey = await getApiKey()
  const res = await fetch(`${PLUGGY_API}${path}`, {
    ...init,
    headers: { 'X-API-KEY': apiKey, 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) throw new Error(`Pluggy request failed: ${res.status} ${path}`)
  return res.json()
}
