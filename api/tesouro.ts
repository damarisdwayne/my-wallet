const CSV_URL =
  'https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv'

export const config = { runtime: 'edge' }

export default async function handler(): Promise<Response> {
  try {
    const upstream = await fetch(CSV_URL)
    if (!upstream.ok) return new Response('upstream error', { status: 502 })
    const text = await upstream.text()
    return new Response(text, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch {
    return new Response('error fetching tesouro data', { status: 500 })
  }
}
