import type { B3ParseResult } from './b3-import'

export interface ImportParser {
  parse(buffer: ArrayBuffer): Promise<B3ParseResult>
}
