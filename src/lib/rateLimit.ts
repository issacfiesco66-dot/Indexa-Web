/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses a sliding window counter per IP address.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 });
 *   // In your route handler:
 *   const ip = request.headers.get("x-forwarded-for") || "unknown";
 *   if (!limiter.check(ip)) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
 */

interface RateLimiterOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
}

interface Entry {
  count: number;
  resetAt: number;
}

export function createRateLimiter(opts: RateLimiterOptions) {
  const store = new Map<string, Entry>();

  // Cleanup stale entries every 60s to prevent memory leaks
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 60_000).unref?.();

  return {
    /**
     * Returns true if the request is allowed, false if rate-limited.
     */
    check(key: string): boolean {
      const now = Date.now();
      const entry = store.get(key);

      if (!entry || now > entry.resetAt) {
        store.set(key, { count: 1, resetAt: now + opts.windowMs });
        return true;
      }

      entry.count++;
      if (entry.count > opts.max) {
        return false;
      }
      return true;
    },

    /** Returns remaining requests for the key */
    remaining(key: string): number {
      const entry = store.get(key);
      if (!entry || Date.now() > entry.resetAt) return opts.max;
      return Math.max(0, opts.max - entry.count);
    },
  };
}
