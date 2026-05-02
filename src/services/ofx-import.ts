import type { ExpenseCategory } from '@/types'

export interface OFXTransaction {
  fitId: string
  date: string // YYYY-MM-DD
  amount: number // absolute value
  description: string
  isDebit: boolean
  isExpense: boolean // false = investment/transfer, should be hidden by default
}

const EXCLUDE_PREFIXES = [
  'aplicacao',
  'aplicação',
  'resgate',
  'credito b3',
  'crédito b3',
  'debito b3',
  'débito b3',
  'credito evento b3',
  'debito renda fixa',
  'débito renda fixa',
  'debito iof conta global',
  'debito conta global',
  'débito conta global',
  'transferencia recebida',
  'transferência recebida',
  'pix recebido',
]

const extractOwnerName = (content: string): string => {
  const m = content.match(/<ACCTOWNER>\s*([^\r\n<]+)/i)
  return m ? m[1].trim().toLowerCase() : ''
}

const isExpenseTransaction = (description: string, ownerName: string): boolean => {
  const lower = description.toLowerCase()
  if (EXCLUDE_PREFIXES.some((p) => lower.startsWith(p))) return false
  // exclude PIX sent to self
  if (ownerName && lower.startsWith('pix enviado') && lower.includes(ownerName)) return false
  return true
}

const parseOFXDate = (raw: string): string => {
  // strip timezone offset like [-3:BRT] or [+0:GMT]
  const s = raw.replace(/\[.*\]/, '').trim()
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

const extractValue = (block: string, tag: string): string => {
  // matches both <TAG>value and <TAG>value</TAG> forms
  const m = block.match(new RegExp(`<${tag}>[\\s]*([^<\\r\\n]+)`, 'i'))
  return m ? m[1].trim() : ''
}

const parseXML = (content: string, ownerName: string): OFXTransaction[] => {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/xml')
    if (doc.querySelector('parsererror')) return []

    const txs: OFXTransaction[] = []
    doc.querySelectorAll('STMTTRN').forEach((el) => {
      const type = el.querySelector('TRNTYPE')?.textContent?.trim() ?? ''
      const dtposted = el.querySelector('DTPOSTED')?.textContent?.trim() ?? ''
      const trnamt = el.querySelector('TRNAMT')?.textContent?.trim() ?? '0'
      const fitid = el.querySelector('FITID')?.textContent?.trim() ?? ''
      const memo =
        el.querySelector('MEMO')?.textContent?.trim() ||
        el.querySelector('NAME')?.textContent?.trim() ||
        ''
      if (!dtposted) return
      const numAmt = parseFloat(trnamt.replace(',', '.'))
      txs.push({
        fitId: fitid || `${dtposted}-${trnamt}`,
        date: parseOFXDate(dtposted),
        amount: Math.abs(numAmt),
        description: memo,
        isDebit: numAmt < 0 || type.toUpperCase() === 'DEBIT',
        isExpense: isExpenseTransaction(memo, ownerName),
      })
    })
    return txs
  } catch {
    return []
  }
}

const parseSGML = (content: string, ownerName: string): OFXTransaction[] => {
  const txs: OFXTransaction[] = []
  const parts = content.split(/<STMTTRN>/i)
  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].split(/<\/STMTTRN>/i)[0]
    const type = extractValue(block, 'TRNTYPE')
    const dtposted = extractValue(block, 'DTPOSTED')
    const trnamt = extractValue(block, 'TRNAMT')
    const fitid = extractValue(block, 'FITID')
    const memo = extractValue(block, 'MEMO') || extractValue(block, 'NAME')
    if (!dtposted || !trnamt) continue
    const numAmt = parseFloat(trnamt.replace(',', '.'))
    txs.push({
      fitId: fitid || `${dtposted}-${trnamt}-${i}`,
      date: parseOFXDate(dtposted),
      amount: Math.abs(numAmt),
      description: memo,
      isDebit: numAmt < 0 || type.toUpperCase() === 'DEBIT',
      isExpense: isExpenseTransaction(memo, ownerName),
    })
  }
  return txs
}

export const parseOFX = (content: string): OFXTransaction[] => {
  const ownerName = extractOwnerName(content)

  // Try XML first (handles files with closing tags, <?xml header, etc.)
  const xmlTxs = parseXML(content, ownerName)
  if (xmlTxs.length > 0) return xmlTxs.filter((t) => t.amount > 0)

  // Fallback: SGML (most Brazilian banks)
  const sgmlTxs = parseSGML(content, ownerName)
  return sgmlTxs.filter((t) => t.amount > 0)
}

/* ── Auto-categorization ── */

const RULES: Array<{ keywords: string[]; category: ExpenseCategory }> = [
  {
    keywords: [
      'mercado',
      'supermercado',
      'padaria',
      'açougue',
      'hortifruti',
      'restaurante',
      'lanchonete',
      'pizza',
      'burger',
      'mcdonald',
      'kfc',
      'ifood',
      'rappi',
      'uber eats',
      'delivery',
      'panificadora',
    ],
    category: 'food',
  },
  {
    keywords: [
      'uber',
      '99pop',
      '99 ',
      'combustivel',
      'combustível',
      'posto',
      'gasolina',
      'etanol',
      'estacionamento',
      'transporte',
      'metrô',
      'metro',
      'ônibus',
      'onibus',
      'taxi',
      'táxi',
      'bilhete',
      'pedágio',
      'pedagio',
      'shell',
      'ipiranga',
      'br distribuidora',
    ],
    category: 'transport',
  },
  {
    keywords: [
      'farmácia',
      'farmacia',
      'drogaria',
      'droga',
      'clinica',
      'clínica',
      'hospital',
      'médico',
      'medico',
      'dentista',
      'laboratório',
      'laboratorio',
      'unimed',
      'amil',
      'sulamerica',
      'bradesco saude',
      'hapvida',
    ],
    category: 'health',
  },
  {
    keywords: [
      'netflix',
      'spotify',
      'amazon prime',
      'disney',
      'hbo',
      'apple',
      'google one',
      'youtube',
      'globoplay',
      'paramount',
      'crunchyroll',
      'xbox',
      'playstation',
      'steam',
      'assinatura',
    ],
    category: 'subscriptions',
  },
  {
    keywords: [
      'aluguel',
      'condominio',
      'condomínio',
      'iptu',
      'energia',
      ' luz ',
      ' água ',
      ' agua ',
      ' gás ',
      ' gas ',
      'internet',
      'telefone',
      'tim ',
      'claro ',
      'vivo ',
      'oi ',
      'net ',
      'enel',
      'cemig',
      'sabesp',
      'copasa',
    ],
    category: 'housing',
  },
  {
    keywords: [
      'escola',
      'faculdade',
      'universidade',
      'curso',
      'aula',
      'livro',
      'udemy',
      'alura',
      'coursera',
      'material escolar',
    ],
    category: 'education',
  },
  {
    keywords: [
      'cinema',
      'teatro',
      'show',
      'ingresso',
      'evento',
      'parque',
      'bar ',
      'balada',
      'clube',
      'ticketmaster',
      'eventim',
    ],
    category: 'entertainment',
  },
  {
    keywords: [
      'roupa',
      'vestuário',
      'vestuario',
      'calçado',
      'calcado',
      'sapato',
      'tênis',
      'tenis',
      'camisa',
      'zara',
      'renner',
      'c&a',
      'riachuelo',
      'marisa',
    ],
    category: 'clothing',
  },
  {
    keywords: ['investimento', 'corretora', 'xp ', 'rico ', 'clear ', 'nuinvest'],
    category: 'investments',
  },
]

export const guessCategory = (description: string): ExpenseCategory => {
  const lower = description.toLowerCase()
  for (const { keywords, category } of RULES) {
    if (keywords.some((k) => lower.includes(k))) return category
  }
  return 'other'
}
