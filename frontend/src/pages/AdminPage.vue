<template>
  <main class="page">
    <header class="admin-header">
      <div>
        <p class="eyebrow">Private dashboard</p>
        <h1>Guest list</h1>
      </div>
      <RouterLink class="button secondary" to="/celebrate">View invitation</RouterLink>
    </header>

    <section v-if="!password" class="panel">
      <h2>Admin sign in</h2>
      <form @submit.prevent="signIn">
        <label class="field">
          <span class="field-label">Admin password</span>
          <input v-model="passwordInput" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="error" class="notice" role="alert">{{ error }}</p>
        <button class="button submit-button" type="submit" :disabled="loading">
          {{ loading ? 'Checking…' : 'Sign in' }}
        </button>
      </form>
    </section>

    <template v-else>
      <div class="stats-grid">
        <article class="stat-card"><span>Total responses</span><strong>{{ stats.totalResponses }}</strong></article>
        <article class="stat-card"><span>Attending responses</span><strong>{{ stats.totalAttending }}</strong></article>
        <article class="stat-card"><span>Total guests</span><strong>{{ stats.totalGuests }}</strong></article>
        <article class="stat-card"><span>Team Boy 💙</span><strong>{{ stats.teamBoy }}</strong></article>
        <article class="stat-card"><span>Team Girl 💗</span><strong>{{ stats.teamGirl }}</strong></article>
      </div>
      <section class="panel">
        <div class="toolbar">
          <h2>Responses ({{ filteredRsvps.length }})</h2>
          <input v-model="search" class="search-input" type="search" placeholder="Search name, email, or team" aria-label="Search responses" />
          <button class="button secondary" type="button" :disabled="loading" @click="exportCsv">Export CSV</button>
        </div>
        <p v-if="error" class="notice" role="alert">{{ error }}</p>
        <p v-if="loading" class="muted">Loading responses…</p>
        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Attending</th><th>Guests</th><th>Team</th><th>Message</th></tr>
            </thead>
            <tbody>
              <tr v-for="rsvp in filteredRsvps" :key="rsvp.id">
                <td>{{ rsvp.full_name }}</td><td>{{ rsvp.email }}</td><td>{{ rsvp.phone || '—' }}</td><td>{{ rsvp.attending }}</td><td>{{ rsvp.guest_count }}</td>
                <td>{{ teamLabel(rsvp.team) }}</td><td>{{ rsvp.message || '—' }}</td>
              </tr>
              <tr v-if="filteredRsvps.length === 0"><td colspan="7" class="muted">No matching responses.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { fetchAdminRsvps, fetchAdminStats, downloadAdminCsv } from '../services/api'

const passwordInput = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const rsvps = ref([])
const search = ref('')
const stats = ref({ totalResponses: 0, totalAttending: 0, totalGuests: 0, teamBoy: 0, teamGirl: 0 })

const filteredRsvps = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return rsvps.value
  return rsvps.value.filter((rsvp) =>
    [rsvp.full_name, rsvp.email, rsvp.team].some((value) => String(value || '').toLowerCase().includes(query)),
  )
})

function teamLabel(team) {
  return team === 'boy' ? 'Team Boy' : team === 'girl' ? 'Team Girl' : 'Not sure'
}

async function signIn() {
  error.value = ''
  loading.value = true
  try {
    const [responses, totals] = await Promise.all([
      fetchAdminRsvps(passwordInput.value),
      fetchAdminStats(passwordInput.value),
    ])
    rsvps.value = responses.rsvps
    stats.value = totals
    password.value = passwordInput.value
    passwordInput.value = ''
  } catch (requestError) {
    error.value = requestError.message
  } finally {
    loading.value = false
  }
}

async function exportCsv() {
  error.value = ''
  try {
    const blob = await downloadAdminCsv(password.value)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'gender-reveal-rsvps.csv'
    link.click()
    URL.revokeObjectURL(url)
  } catch (requestError) {
    error.value = requestError.message
  }
}
</script>
