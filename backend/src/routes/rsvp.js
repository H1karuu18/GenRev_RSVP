import { Router } from 'express'
import { fetchEvent, submitRsvp } from '../controllers/rsvpController.js'
import { rsvpRateLimit } from '../middleware/rateLimit.js'

const router = Router()
router.get('/event', fetchEvent)
router.post('/rsvp', rsvpRateLimit, submitRsvp)
export default router
