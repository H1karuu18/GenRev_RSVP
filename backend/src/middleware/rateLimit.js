const windowMs = 15 * 60 * 1000
const maxRequests = 10
const requests = new Map()

export function rsvpRateLimit(req, res, next) {
  const now = Date.now()
  const key = req.ip
  const current = requests.get(key)
  const entry = !current || now - current.startedAt >= windowMs
    ? { startedAt: now, count: 0 }
    : current

  entry.count += 1
  requests.set(key, entry)
  if (requests.size > 1000) {
    for (const [ip, record] of requests) {
      if (now - record.startedAt >= windowMs) requests.delete(ip)
    }
  }

  if (entry.count > maxRequests) {
    res.set('Retry-After', String(Math.ceil((entry.startedAt + windowMs - now) / 1000)))
    return res.status(429).json({ error: 'Too many RSVP attempts. Please try again later.' })
  }
  return next()
}
