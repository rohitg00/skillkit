import type { Context, Next } from "hono";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export function rateLimiter(maxRequests = 60, windowMs = 60_000) {
  const windows = new Map<string, RateLimitEntry>();

  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of windows) {
      if (now > entry.resetAt) {
        windows.delete(key);
      }
    }
  }, windowMs).unref();

  return async (c: Context, next: Next): Promise<Response | void> => {
    const xRealIp = c.req.header("x-real-ip");
    const forwarded = c.req.header("x-forwarded-for");
    const forwardedIp = forwarded
      ? forwarded.split(",").at(-1)?.trim()
      : undefined;
    const ip = xRealIp || forwardedIp || "unknown";
    const now = Date.now();

    let entry = windows.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      windows.set(ip, entry);
    }

    entry.count++;

    c.header("X-RateLimit-Limit", String(maxRequests));
    c.header(
      "X-RateLimit-Remaining",
      String(Math.max(0, maxRequests - entry.count)),
    );
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > maxRequests) {
      return c.json(
        {
          error: "Too many requests",
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        },
        429,
      );
    }

    await next();
  };
}
