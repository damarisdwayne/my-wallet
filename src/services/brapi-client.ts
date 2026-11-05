// brapi allows a single in-flight request per token on the current plan
// (x-brapi-concurrency-limit: 1). Parallel calls come back as 429, so every
// authenticated request goes through this queue, one at a time.
const MAX_RETRIES = 3
const DEFAULT_RETRY_MS = 1000

let queue: Promise<unknown> = Promise.resolve()

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const retryDelay = (res: Response) => {
  const seconds = Number(res.headers.get('retry-after'))
  return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : DEFAULT_RETRY_MS
}

const fetchWithRetry = async (url: string): Promise<Response> => {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url)
    if (res.status !== 429 || attempt >= MAX_RETRIES) return res
    await wait(retryDelay(res))
  }
}

export const brapiFetch = (url: string): Promise<Response> => {
  const run = queue.then(() => fetchWithRetry(url))
  queue = run.catch(() => undefined)
  return run
}
