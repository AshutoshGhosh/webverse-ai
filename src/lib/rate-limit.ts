// Lightweight in-memory sliding-window rate limiter.
//
// This is a per-instance limiter (state lives in module memory), which is
// sufficient for a single-node deployment or a demo and gives real protection
// against a client hammering the expensive AI endpoints. For a multi-instance
// production deployment, swap the Map for a shared store (e.g. Upstash Redis /
// @upstash/ratelimit) behind the same `rateLimit()` signature.

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Allows `limit` requests per `windowMs` for a given key (typically a user id
 * namespaced by route, e.g. `analyze:<uid>`). Returns whether the call is
 * allowed plus retry metadata for a 429 response.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, retryAfterSeconds: 0 };
}

// Opportunistically evict stale buckets so the Map can't grow unbounded.
export function sweepRateLimitBuckets(now = Date.now()): void {
  for (const [key, win] of buckets) {
    if (now >= win.resetAt) buckets.delete(key);
  }
}
