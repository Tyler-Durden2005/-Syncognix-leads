/**
 * Small in-memory cache with expiry and a size cap (oldest entries evicted
 * first). It lives per server process and resets on restart — fine for V1;
 * replace with a shared store (e.g. a Supabase table) for production.
 */
export class TtlCache<T> {
  private readonly entries = new Map<string, { value: T; expiresAt: number }>()

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number
  ) {}

  get(key: string): T | null {
    const entry = this.entries.get(key)
    if (!entry) return null
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key)
      return null
    }
    return entry.value
  }

  /** Stores a value; `ttlMs` overrides the default expiry for this entry. */
  set(key: string, value: T, ttlMs = this.ttlMs) {
    this.entries.delete(key)
    // Map keeps insertion order, so the first key is the oldest entry.
    if (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value
      if (oldest !== undefined) this.entries.delete(oldest)
    }
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs })
  }
}
