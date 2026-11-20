import test from 'node:test'
import assert from 'node:assert/strict'
import { validateRsvp } from '../src/middleware/validateRsvp.js'

const validRsvp = {
  fullName: '  Alex Example  ',
  email: ' ALEX@example.com ',
  attending: 'yes',
  guestCount: 2,
  team: 'boy',
}

test('validates and normalizes a complete attending RSVP', () => {
  assert.deepEqual(validateRsvp(validRsvp), {
    full_name: 'Alex Example',
    email: 'alex@example.com',
    phone: null,
    attending: 'yes',
    guest_count: 2,
    team: 'boy',
    dietary_notes: null,
    message: null,
  })
})

test('sets guest count to zero for a declined RSVP', () => {
  assert.equal(validateRsvp({ ...validRsvp, attending: 'no', guestCount: 3 }).guest_count, 0)
})

test('rejects invalid emails and guest counts', () => {
  assert.throws(() => validateRsvp({ ...validRsvp, email: 'not-an-email' }), /valid email/)
  assert.throws(() => validateRsvp({ ...validRsvp, guestCount: 11 }), /between 1 and 10/)
})
