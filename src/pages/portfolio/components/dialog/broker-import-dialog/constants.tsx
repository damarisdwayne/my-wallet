import type { B3ParseResult } from '@/services/b3-import'
import { parseB3Excel } from '@/services/b3-import'
import { parseInterPdf } from '@/services/inter-import'

export interface Broker {
  id: string
  label: string
  description: string
  instructions: React.ReactNode
  fileAccept: string
  fileHint: string
  parse: (buffer: ArrayBuffer) => Promise<B3ParseResult>
}

export const BROKERS: Broker[] = [
  {
    id: 'b3',
    label: 'B3',
    description: 'Extrato de Negociação',
    instructions: (
      <p className="text-sm text-muted-foreground">
        Acesse{' '}
        <a
          href="https://www.investidor.b3.com.br"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          investidor.b3.com.br
        </a>{' '}
        → <span className="font-medium text-foreground">Extratos</span> →{' '}
        <span className="font-medium text-foreground">Negociação</span> →{' '}
        <span className="font-medium text-foreground">Baixar → Excel</span>. O app calculará sua
        posição atual e preço médio automaticamente.
      </p>
    ),
    fileAccept: '.xlsx,.xls',
    fileHint: 'Excel (.xlsx) — Extrato de Negociação da B3',
    parse: async (buf) => parseB3Excel(buf),
  },
  {
    id: 'inter',
    label: 'Inter Co Securities',
    description: 'Transaction Confirmation (EUA)',
    instructions: (
      <p className="text-sm text-muted-foreground">
        No app da Inter, acesse{' '}
        <span className="font-medium text-foreground">
          Investimentos → Notas de corretagem Ações EUA
        </span>{' '}
        e exporte a <span className="font-medium text-foreground">nota de corretagem em PDF</span>.
        Quantidades e PM serão calculados automaticamente.
      </p>
    ),
    fileAccept: '.pdf',
    fileHint: 'PDF — Transaction Confirmation da Inter Co Securities',
    parse: async (buf) => parseInterPdf(buf),
  },
]
