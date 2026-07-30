const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_MESSAGES = 3;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitByIp = new Map<string, RateLimitEntry>();

export function checkMessageRateLimit(ip: string, now: number) {
  for (const [key, entry] of rateLimitByIp) {
    if (entry.resetAt <= now) rateLimitByIp.delete(key);
  }

  const current = rateLimitByIp.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitByIp.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= RATE_LIMIT_MAX_MESSAGES) {
    return {
      allowed: false,
      retryAfter: Math.ceil((current.resetAt - now) / 1000),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
}

export function resetMessageRateLimitForTests() {
  rateLimitByIp.clear();
}

