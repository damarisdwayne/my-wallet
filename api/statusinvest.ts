export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const type = url.searchParams.get('type') ?? 'acao'
  const start = url.searchParams.get('start') ?? ''
  const end = url.searchParams.get('end') ?? ''
  const category = type === 'fii' ? 2 : 1

  const upstream = await fetch(
    `https://statusinvest.com.br/${type}/getearnings?Start=${start}&End=${end}&category=${category}`,
    {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://statusinvest.com.br/acoes/proventos',
        Accept: 'application/json, text/javascript, */*; q=0.01',
      },
    },
  ).catch(() => null)

  if (!upstream?.ok) return new Response('upstream error', { status: 502 })

  const data = await upstream.text()
  return new Response(data, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
