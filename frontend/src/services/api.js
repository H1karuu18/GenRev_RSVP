const apiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}/api${path}`, options)
  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    throw new Error(data?.error || `Request failed (HTTP ${response.status}).`)
  }

  return { response, data }
}

export async function fetchEvent() {
  const { data } = await request('/event')
  return data
}

export async function submitRsvp(form) {
  const { data } = await request('/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form),
  })
  return data
}

export async function fetchAdminRsvps(password) {
  const { data } = await request('/admin/rsvps', {
    headers: { Authorization: `Bearer ${password}` },
  })
  return data
}

export async function fetchAdminStats(password) {
  const { data } = await request('/admin/stats', {
    headers: { Authorization: `Bearer ${password}` },
  })
  return data
}

export async function downloadAdminCsv(password) {
  const { response } = await request('/admin/export', {
    headers: { Authorization: `Bearer ${password}` },
  })
  return response.blob()
}
