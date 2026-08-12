/**
 * Shared in-memory rate limiter for sensitive endpoints.
 *
 * Kept deliberately simple (per-process Map) because Render runs a single
 * instance and the app is an MVP. Swap for a Redis-backed limiter if the
 * service ever scales horizontally.
 */
const requestTracker = new Map();

const createRateLimiter = ({ windowMs, maxRequests, keyResolver }) => (req, res, next) => {
  const now = Date.now();
  const key = keyResolver(req);
  const entry = requestTracker.get(key);

  if (!entry || now > entry.expiresAt) {
    requestTracker.set(key, {
      count: 1,
      expiresAt: now + windowMs
    });
    return next();
  }

  if (entry.count >= maxRequests) {
    return res.status(429).json({
      error: "Too many requests. Please wait a moment and try again."
    });
  }

  entry.count += 1;
  return next();
};

module.exports = {
  createRateLimiter
};
