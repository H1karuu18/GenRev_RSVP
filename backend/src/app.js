import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rsvpRoutes from './routes/rsvp.js'
import adminRoutes from './routes/admin.js'

const app = express()
const allowedOrigin = (process.env.ALLOWED_ORIGIN || '').trim().replace(/\/+$/, '')

app.use(cors({
  origin(origin, callback) {
    if (!origin || (allowedOrigin && origin.replace(/\/+$/, '') === allowedOrigin)) {
      return callback(null, true)
    }
    return callback(new Error('Origin is not allowed by CORS.'))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '20kb' }))
app.use('/api', rsvpRoutes)
app.use('/api/admin', adminRoutes)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Request body must be valid JSON.' })
  }
  if (error.message === 'Origin is not allowed by CORS.') {
    return res.status(403).json({ error: error.message })
  }
  console.error('Unhandled API error:', error.message)
  return res.status(500).json({ error: 'Internal server error.' })
})

export default app
