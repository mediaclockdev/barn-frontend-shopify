/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach with configurable limits.
 *
 * Usage:
 *   import { rateLimit } from "@/src/lib/rate-limit";
 *   const limiter = rateLimit({ interval: 60_000, uniqueTokenPerInterval: 500 });
 *
 *   // In your route handler:
 *   const ip = req.headers.get("x-forwarded-for") || "anonymous";
 *   const { success } = await limiter.check(10, ip); // 10 requests per interval
 *   if (!success) return NextResponse.json({ message: "Too many requests" }, { status: 429 });
 */

const rateLimitMap = new Map();

/**
 * @param {{ interval?: number, uniqueTokenPerInterval?: number }} [options]
 */
export function rateLimit(options = {}) {
  const interval = options.interval ?? 60_000;
  const uniqueTokenPerInterval = options.uniqueTokenPerInterval ?? 500;
  return {
    /**
     * Check if the token (usually IP) is within the allowed limit.
     * @param {number} limit - Max number of requests per interval
     * @param {string} token - Unique identifier (IP address)
     * @returns {{ success: boolean, remaining: number }}
     */
    check(limit, token) {
      const now = Date.now();
      const tokenKey = token;

      const tokenData = rateLimitMap.get(tokenKey) || { count: 0, lastReset: now };

      // Reset count if outside the window
      if (now - tokenData.lastReset > interval) {
        tokenData.count = 0;
        tokenData.lastReset = now;
      }

      tokenData.count += 1;
      rateLimitMap.set(tokenKey, tokenData);

      // Cleanup old entries if map gets too large
      if (rateLimitMap.size > uniqueTokenPerInterval) {
        const entriesToDelete = rateLimitMap.size - uniqueTokenPerInterval;
        const iterator = rateLimitMap.keys();
        for (let i = 0; i < entriesToDelete; i++) {
          rateLimitMap.delete(iterator.next().value);
        }
      }

      const success = tokenData.count <= limit;
      const remaining = Math.max(0, limit - tokenData.count);

      return { success, remaining };
    },
  };
}
