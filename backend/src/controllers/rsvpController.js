import { createRsvp, getEventSettings } from '../services/rsvpService.js'
import { validateRsvp } from '../middleware/validateRsvp.js'

export async function submitRsvp(req, res) {
  let rsvp
  try {
    rsvp = validateRsvp(req.body)
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }

  try {
    await createRsvp(rsvp)
    return res.status(201).json({ success: true, message: 'RSVP submitted successfully.' })
  } catch (error) {
    console.error('Unable to save RSVP:', error.message)
    return res.status(error.status || 500).json({
      error: error.status ? error.message : 'Unable to save your RSVP. Please try again.',
    })
  }
}

export async function fetchEvent(_req, res) {
  try {
    return res.json(await getEventSettings())
  } catch (error) {
    console.error('Unable to fetch event details:', error.message)
    return res.status(500).json({ error: 'Unable to load event details.' })
  }
}
