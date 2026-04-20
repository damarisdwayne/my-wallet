import JSZip from 'jszip'
import type { CvmDocument } from '@/types'

const BASE = (import.meta.env.VITE_CVM_PROXY_URL as string | undefined) ?? '/cvm-dados'

const CATEGORIES = ['Fato Relevante', 'Comunicado ao Mercado', 'Relatório Gerencial']

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

let ipeCache: { year: number; docs: CvmDocument[] } | null = null

const parseIpeCsv = (text: string): CvmDocument[] => {
  const lines = text.split('\n')
  return lines
    .slice(1)
    .filter(Boolean)
    .map((line) => {
      const cols = line.split(';')
      return {
        cnpj: cols[0]?.trim() ?? '',
        company: cols[1]?.trim() ?? '',
        cvmCode: cols[2]?.trim() ?? '',
        referenceDate: cols[3]?.trim() ?? '',
        category: cols[4]?.trim() ?? '',
        type: cols[5]?.trim() ?? '',
        subject: cols[7]?.trim() ?? '',
        deliveryDate: cols[8]?.trim() ?? '',
        downloadUrl: cols[12]?.trim() ?? '',
      }
    })
    .filter((d) => d.cnpj && d.downloadUrl)
}

const loadIpe = async (year: number): Promise<CvmDocument[]> => {
  if (ipeCache?.year === year) return ipeCache.docs

  const res = await fetch(`${BASE}/dados/CIA_ABERTA/DOC/IPE/DADOS/ipe_cia_aberta_${year}.zip`)
  if (!res.ok) throw new Error(`CVM IPE ${year}: HTTP ${res.status}`)

  const zip = await JSZip.loadAsync(await res.arrayBuffer())
  const file = Object.values(zip.files)[0]
  const buf = await file.async('arraybuffer')
  const text = new TextDecoder('iso-8859-1').decode(buf)

  const docs = parseIpeCsv(text)
  ipeCache = { year, docs }
  return docs
}

export const fetchCvmDocuments = async (
  assetName: string,
  categories = CATEGORIES,
): Promise<CvmDocument[]> => {
  const year = new Date().getFullYear()
  const allDocs = await loadIpe(year)

  const keywords = normalize(assetName)
    .split(' ')
    .filter((w) => w.length >= 4)

  if (keywords.length === 0) return []

  const results = allDocs.filter((d) => {
    if (!categories.includes(d.category)) return false
    const name = normalize(d.company)
    return keywords.some((kw) => name.includes(kw))
  })

  // Deduplicate: keep only the latest version per protocol
  const seen = new Map<string, CvmDocument>()
  for (const d of results) {
    const key = d.downloadUrl.match(/numProtocolo=(\d+)/)?.[1] ?? d.downloadUrl
    const existing = seen.get(key)
    if (!existing || d.deliveryDate > existing.deliveryDate) seen.set(key, d)
  }

  return [...seen.values()]
    .sort((a, b) => b.deliveryDate.localeCompare(a.deliveryDate))
    .slice(0, 20)
}
