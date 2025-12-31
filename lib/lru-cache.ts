type CacheEntry<T> = {
  value: T
  expiresAt: number
}

export class LruCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>()

  constructor(private readonly maxEntries = 100) {}

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return null
    }
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value
  }

  set(key: string, value: T, ttlMs: number) {
    if (ttlMs <= 0) return
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
    if (this.store.size <= this.maxEntries) return
    const oldestKey = this.store.keys().next().value
    if (oldestKey) {
      this.store.delete(oldestKey)
    }
  }
}
