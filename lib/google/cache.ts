type CacheEntry<T> = { data: T; expiresAt: number }

const cache = new Map<string, CacheEntry<unknown>>()
const TTL_MS = 5 * 60 * 1000

export function getCached<T>(key: string): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

export function setCached<T>(key: string, data: T) {
  cache.set(key, { data, expiresAt: Date.now() + TTL_MS })
}

export function clearCache(keyPrefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(keyPrefix)) cache.delete(key)
  }
}
