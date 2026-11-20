const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
const teams = new Set(['boy', 'girl', 'undecided'])

function cleanString(value, field, maxLength, required = false) {
  if (value === undefined || value === null) {
    if (required) throw new Error(`${field} is required.`)
    return null
  }
  if (typeof value !== 'string') throw new Error(`${field} must be text.`)
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, '').trim()
  if (required && !cleaned) throw new Error(`${field} is required.`)
  if (cleaned.length > maxLength) throw new Error(`${field} must be ${maxLength} characters or fewer.`)
  return cleaned || null
}

export function validateRsvp(body) {
  const fullName = cleanString(body?.fullName, 'Full name', 120, true)
  const email = cleanString(body?.email, 'Email', 254, true)?.toLowerCase()
  if (!emailPattern.test(email)) throw new Error('Enter a valid email address.')

  const phone = cleanString(body?.phone, 'Phone', 30)
  if (!['yes', 'no'].includes(body?.attending)) throw new Error('Choose yes or no for attendance.')
  const attending = body.attending
  let guestCount = 0
  if (attending === 'yes') {
    guestCount = Number(body.guestCount)
    if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10) {
      throw new Error('Guest count must be between 1 and 10.')
    }
  }

  const team = body?.team || 'undecided'
  if (!teams.has(team)) throw new Error('Choose Team Boy, Team Girl, or Not sure.')

  return {
    full_name: fullName,
    email,
    phone,
    attending,
    guest_count: guestCount,
    team,
    dietary_notes: cleanString(body?.dietaryNotes, 'Dietary restrictions', 500),
    message: cleanString(body?.message, 'Message', 1000),
  }
}
