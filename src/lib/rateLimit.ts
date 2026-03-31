const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 60_000);

/**
 * In-memory rate limiter using sliding window.
 * @param key - Unique identifier (e.g. IP address or userId)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Window duration in milliseconds
 * @throws Error if rate limit exceeded
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): void {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return;
  }

  if (entry.count >= maxRequests) {
    const waitSeconds = Math.ceil((entry.resetTime - now) / 1000);
    throw new Error(
      `Muitas requisições. Tente novamente em ${waitSeconds} segundo${waitSeconds !== 1 ? "s" : ""}.`
    );
  }

  entry.count++;
}
