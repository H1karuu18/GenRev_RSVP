<template>
  <div class="page">
    <header>
      <p class="eyebrow">A little surprise is on the way</p>
      <h1>Boy or Girl?</h1>
      <p class="lede">Join the parents-to-be as we celebrate our growing family.</p>
    </header>

    <section class="event-card" aria-labelledby="event-heading">
      <p class="eyebrow">You're invited</p>
      <h2 id="event-heading">{{ event.parentOne }} &amp; {{ event.parentTwo }}'s Reveal Party</h2>
      <dl class="event-details">
        <div><dt>Date</dt><dd>{{ displayDate(event.date) }}</dd></div>
        <div><dt>Time</dt><dd>{{ displayTime(event.time) }}</dd></div>
        <div><dt>Venue</dt><dd>{{ event.venue }}</dd></div>
        <div><dt>Address</dt><dd>{{ event.address }}</dd></div>
        <div><dt>RSVP by</dt><dd>{{ displayDate(event.rsvpDeadline) }}</dd></div>
        <div><dt>Dress code</dt><dd>{{ event.dressCode }}</dd></div>
      </dl>
    </section>

    <section class="panel" aria-labelledby="rsvp-heading">
      <h2 id="rsvp-heading">Let us know if you can make it</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-grid">
          <label class="field">
            <span class="field-label">Full name <span aria-hidden="true">*</span></span>
            <input v-model.trim="form.fullName" name="fullName" autocomplete="name" maxlength="120" required />
          </label>
          <label class="field">
            <span class="field-label">Email <span aria-hidden="true">*</span></span>
            <input v-model.trim="form.email" name="email" type="email" autocomplete="email" maxlength="254" required />
          </label>
          <label class="field">
            <span class="field-label">Phone (optional)</span>
            <input v-model.trim="form.phone" name="phone" type="tel" autocomplete="tel" maxlength="30" />
          </label>
          <div class="field">
            <span class="field-label">Will you be there? <span aria-hidden="true">*</span></span>
            <div class="choice-row">
              <label class="choice"><input v-model="form.attending" type="radio" name="attending" value="yes" required /> Yes!</label>
              <label class="choice"><input v-model="form.attending" type="radio" name="attending" value="no" required /> Sorry, can't make it</label>
            </div>
          </div>
          <label v-if="form.attending === 'yes'" class="field">
            <span class="field-label">Number of guests, including you <span aria-hidden="true">*</span></span>
            <select v-model.number="form.guestCount" name="guestCount" required>
              <option v-for="count in 10" :key="count" :value="count">{{ count }}</option>
            </select>
          </label>
          <label class="field">
            <span class="field-label">Your team guess</span>
            <select v-model="form.team" name="team">
              <option value="boy">Team Boy 💙</option>
              <option value="girl">Team Girl 💗</option>
              <option value="undecided">Not sure yet</option>
            </select>
          </label>
          <label class="field full-width">
            <span class="field-label">Dietary restrictions or allergies (optional)</span>
            <textarea v-model.trim="form.dietaryNotes" name="dietaryNotes" maxlength="500" rows="3"></textarea>
          </label>
          <label class="field full-width">
            <span class="field-label">Message to the parents (optional)</span>
            <textarea v-model.trim="form.message" name="message" maxlength="1000" rows="3"></textarea>
          </label>
        </div>
        <p v-if="eventError" class="notice" role="status">{{ eventError }}</p>
        <p v-if="error" class="notice" role="alert">{{ error }}</p>
        <button class="button submit-button" type="submit" :disabled="loading">
          {{ loading ? 'Sending your RSVP…' : 'Send RSVP' }}
        </button>
      </form>
    </section>
    <p class="muted" style="margin-top: 1.2rem; text-align: center">Pick a side: Team Pink or Team Blue?</p>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { eventDetails } from '../config/event'
import { fetchEvent, submitRsvp } from '../services/api'

const router = useRouter()
const event = reactive({ ...eventDetails })
const loading = ref(false)
const error = ref('')
const eventError = ref('')
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  attending: '',
  guestCount: 1,
  team: 'undecided',
  dietaryNotes: '',
  message: '',
})

const displayDate = (value) => {
  if (!value) return 'To be announced'
  const date = new Date(`${value}T12:00:00`)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(date)
}

const displayTime = (value) => {
  if (!value) return 'To be announced'
  const [hours, minutes] = value.split(':')
  const date = new Date()
  date.setHours(Number(hours), Number(minutes), 0, 0)
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)
}

onMounted(async () => {
  try {
    const savedEvent = await fetchEvent()
    Object.assign(event, Object.fromEntries(
      Object.entries(savedEvent).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    ))
  } catch (requestError) {
    eventError.value = `Showing placeholder event details. ${requestError.message}`
  }
})

async function handleSubmit() {
  error.value = ''
  if (!form.fullName.trim() || !form.email.trim() || !['yes', 'no'].includes(form.attending)) {
    error.value = 'Enter your name and email, then choose whether you can attend.'
    return
  }
  if (form.attending === 'yes' && (!Number.isInteger(form.guestCount) || form.guestCount < 1 || form.guestCount > 10)) {
    error.value = 'Choose a guest count from 1 to 10.'
    return
  }

  loading.value = true
  try {
    await submitRsvp({ ...form })
    await router.push({ name: 'thank-you' })
  } catch (requestError) {
    error.value = requestError.message || 'We could not submit your RSVP. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
