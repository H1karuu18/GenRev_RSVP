import { Router } from 'express'
import { exportRsvps, fetchRsvps, fetchStats } from '../controllers/adminController.js'
import { requireAdmin } from '../middleware/adminAuth.js'

const router = Router()
router.use(requireAdmin)
router.get('/rsvps', fetchRsvps)
router.get('/stats', fetchStats)
router.get('/export', exportRsvps)
export default router
