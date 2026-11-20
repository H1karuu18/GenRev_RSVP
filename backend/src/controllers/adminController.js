import { getRsvpStats, listRsvps } from '../services/rsvpService.js'

export async function fetchRsvps(_req, res) {
  try {
    return res.json({ rsvps: await listRsvps() })
  } catch (error) {
    console.error('Unable to fetch RSVPs:', error.message)
    return res.status(500).json({ error: 'Unable to load RSVP responses.' })
  }
}

export async function fetchStats(_req, res) {
  try {
    return res.json(await getRsvpStats())
  } catch (error) {
    console.error('Unable to fetch RSVP stats:', error.message)
    return res.status(500).json({ error: 'Unable to load RSVP statistics.' })
  }
}

function csvCell(value) {
  let text = String(value ?? '')
  if (/^[=+\-@]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export async function exportRsvps(_req, res) {
  try {
    const rows = await listRsvps()
    const columns = ['full_name', 'email', 'phone', 'attending', 'guest_count', 'team', 'dietary_notes', 'message', 'created_at']
    const csv = [
      columns.map(csvCell).join(','),
      ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(',')),
    ].join('\r\n')
    res.set({
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="gender-reveal-rsvps.csv"',
      'Cache-Control': 'no-store',
    })
    return res.send(csv)
  } catch (error) {
    console.error('Unable to export RSVPs:', error.message)
    return res.status(500).json({ error: 'Unable to export RSVP responses.' })
  }
}
