<template>
  <section class="panel rsvp-panel" aria-labelledby="rsvp-heading">
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
            <option value="undecided">Not sure</option>
          </select>
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
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { submitRsvp } from '../services/api'

const router = useRouter()
const loading = ref(false)
const error = ref('')
const form = reactive({
  fullName: '',
  email: '',
  phone: '',
  attending: '',
  guestCount: 1,
  team: 'undecided',
  message: '',
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
    await submitRsvp({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      attending: form.attending,
      guestCount: form.guestCount,
      team: form.team,
      message: form.message,
    })
    await router.push({ name: 'thank-you' })
  } catch (requestError) {
    error.value = requestError.message || 'We could not submit your RSVP. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
