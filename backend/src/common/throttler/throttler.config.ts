import type { ConfigService } from '@nestjs/config';

// Normalizes the request body email so that casing/whitespace variants share a
// single bucket. Falls back to the client IP when no usable email is present,
// and is always paired with the IP-based `default` throttler so arbitrary email
// values can never be used to bypass the IP limit.
export function normalizeEmailTracker(req: Record<string, unknown>): string {
  const body = req.body as { email?: unknown } | undefined;
  const email = body?.email;
  if (typeof email === 'string') {
    const normalized = email.trim().toLowerCase();
    if (normalized.length > 0) {
      return normalized;
    }
  }
  return String(req.ip);
}

export function buildThrottlerOptions(config: ConfigService) {
  const ttl = config.get<number>('RATE_LIMIT_TTL') ?? 60_000;
  const limit = config.get<number>('RATE_LIMIT_LIMIT') ?? 100;

  return {
    throttlers: [
      { ttl, limit },
      { name: 'email', ttl, limit, getTracker: normalizeEmailTracker },
    ],
  };
}
