/**
 * Simple in-memory LRU cache for query responses.
 * In production swap to Redis via ioredis for multi-instance support.
 */

interface CacheEntry {
  value: string
  expiresAt: number
}

const store = new Map<string, CacheEntry>()
const MAX_ENTRIES = 200
const DEFAULT_TTL = 60 * 5 * 1000 // 5 minutes

export function getCached(key: string): string | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value
}

export function setCached(key: string, value: string, ttl = DEFAULT_TTL): void {
  // Evict oldest entry when full
  if (store.size >= MAX_ENTRIES) {
    const oldestKey = store.keys().next().value
    if (oldestKey) store.delete(oldestKey)
  }
  store.set(key, { value, expiresAt: Date.now() + ttl })
}

export function clearCache(): void {
  store.clear()
}

export function cacheKey(...parts: string[]): string {
  return parts.join(':').toLowerCase().replace(/\s+/g, '_')
}
