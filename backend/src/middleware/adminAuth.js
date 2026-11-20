import { timingSafeEqual } from 'node:crypto'

export function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_PASSWORD || ''
  const supplied = req.get('authorization')?.replace(/^Bearer\s+/i, '') || ''
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)

  if (!expected || expectedBuffer.length !== suppliedBuffer.length || !timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    return res.status(401).json({ error: 'Invalid admin password.' })
  }
  return next()
}
