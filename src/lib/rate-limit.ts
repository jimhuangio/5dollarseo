// In-memory rate limiter (works for single-instance Vercel functions)
// For production scale, swap the store with Upstash Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

interface RateLimitOptions {
  windowMs: number;   // time window in ms
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt };
  }

  if (entry.count >= options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt };
}

// Preset limits
export const LIMITS = {
  // 5 failed lookups per IP per 15 min
  CODE_LOOKUP: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  // 3 account creations per IP per hour
  ACCOUNT_CREATE: { windowMs: 60 * 60 * 1000, maxRequests: 3 },
  // 10 payment attempts per IP per hour
  PAYMENT: { windowMs: 60 * 60 * 1000, maxRequests: 10 },
} as const;
