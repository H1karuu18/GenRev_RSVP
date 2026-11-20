<template>
  <main class="celebrate-page">
    <section class="celebrate-hero">
      <div class="hero-decoration hero-balloon hero-balloon-left" aria-hidden="true">🎈</div>
      <div class="hero-decoration hero-balloon hero-balloon-right" aria-hidden="true">🎈</div>
      <p class="eyebrow">A little surprise is on the way</p>
      <p class="hero-names">{{ event.parentOne }} <span>&amp;</span> {{ event.parentTwo }}</p>
      <h1>We’re having<br class="mobile-break" /> a baby!</h1>
      <p class="lede">Join us as we celebrate our growing family.</p>
      <a class="scroll-hint" href="#parents-message">Scroll down <span aria-hidden="true">↓</span></a>
    </section>

    <div class="celebrate-content">
      <section id="parents-message" class="message-card reveal-section">
        <p class="eyebrow">A little message from us</p>
        <p class="parents-message">{{ event.parentsMessage }}</p>
        <span class="message-heart" aria-hidden="true">♡</span>
      </section>

      <section class="content-section reveal-section" aria-labelledby="gallery-heading">
        <header class="section-heading">
          <p class="eyebrow">Already so loved</p>
          <h2 id="gallery-heading">A little peek at baby</h2>
        </header>
        <div class="ultrasound-grid">
          <article v-for="(image, index) in event.ultrasoundImages" :key="image.src" class="ultrasound-card">
            <button
              v-if="!missingImages[index]"
              class="ultrasound-image-button"
              type="button"
              :aria-label="`Enlarge ${image.caption}`"
              @click="openLightbox(index)"
            >
              <img :src="image.src" :alt="image.alt" loading="lazy" @error="markImageMissing(index)" />
            </button>
            <div v-else class="ultrasound-placeholder" aria-label="Ultrasound photo placeholder">
              <span aria-hidden="true">♡</span>
              <small>Add an ultrasound photo</small>
            </div>
            <p class="image-caption">{{ image.caption }}</p>
          </article>
        </div>
      </section>

      <section class="event-card reveal-section" aria-labelledby="event-heading">
        <header class="section-heading">
          <p class="eyebrow">Save the date</p>
          <h2 id="event-heading">The celebration</h2>
        </header>
        <dl class="event-details">
          <div><dt>Date</dt><dd>{{ displayDate(event.date) }}</dd></div>
          <div><dt>Time</dt><dd>{{ displayTime(event.time) }}</dd></div>
          <div><dt>Venue</dt><dd>{{ event.venue || 'To be announced' }}</dd></div>
          <div><dt>Address</dt><dd>{{ event.address || 'To be announced' }}</dd></div>
          <div><dt>Dress code</dt><dd>{{ event.dressCode || 'Come as you are' }}</dd></div>
          <div><dt>RSVP by</dt><dd>{{ displayDate(event.rsvpDeadline) }}</dd></div>
        </dl>
        <div class="event-actions">
          <button class="button secondary" type="button" @click="downloadCalendar">Add to calendar</button>
          <a
            class="button secondary"
            :href="directionsUrl"
            target="_blank"
            rel="noopener noreferrer"
            :aria-disabled="!event.address"
            :tabindex="event.address ? 0 : -1"
          >Get directions</a>
        </div>
      </section>

      <section id="rsvp" class="rsvp-section reveal-section" aria-labelledby="rsvp-title">
        <header class="section-heading">
          <p class="eyebrow">We hope you can make it</p>
          <h2 id="rsvp-title">Will you join us?</h2>
          <p class="lede">Let us know — your reply means the world to us.</p>
        </header>
        <RsvpPage />
      </section>
    </div>

    <footer class="celebrate-footer">Made with love, {{ event.parentOne }} &amp; {{ event.parentTwo }} <span aria-hidden="true">💙💗</span></footer>

    <a v-if="showStickyRsvp" class="sticky-rsvp" href="#rsvp">RSVP <span aria-hidden="true">↓</span></a>

    <div v-if="lightboxImage" class="lightbox" role="dialog" aria-modal="true" :aria-label="lightboxImage.alt" @click.self="closeLightbox">
      <button class="lightbox-close" type="button" aria-label="Close enlarged image" @click="closeLightbox">×</button>
      <img :src="lightboxImage.src" :alt="lightboxImage.alt" />
      <p>{{ lightboxImage.caption }}</p>
    </div>
  </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { eventDetails } from '../config/event'
import { fetchEvent } from '../services/api'
import RsvpPage from './RsvpPage.vue'

const event = reactive({ ...eventDetails })
const missingImages = reactive({})
const showStickyRsvp = ref(true)
const activeLightboxIndex = ref(null)
let rsvpObserver
let revealObserver

const lightboxImage = computed(() => {
  const index = activeLightboxIndex.value
  return index === null || missingImages[index] ? null : event.ultrasoundImages[index]
})
const directionsUrl = computed(() => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address || '')}`)

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

function markImageMissing(index) {
  missingImages[index] = true
}

function openLightbox(index) {
  activeLightboxIndex.value = index
}

function closeLightbox() {
  activeLightboxIndex.value = null
}

function handleKeydown(eventKey) {
  if (eventKey.key === 'Escape') closeLightbox()
}

function updateStickyRsvp() {
  const section = document.getElementById('rsvp')
  if (!section) return
  const bounds = section.getBoundingClientRect()
  showStickyRsvp.value = bounds.top > window.innerHeight || bounds.bottom < 0
}

function downloadCalendar() {
  const icsEscape = (value) => String(value || '').replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replace(/\r?\n/g, '\\n')
  const date = (event.date || '').replaceAll('-', '')
  const time = (event.time || '').replaceAll(':', '').slice(0, 4)
  const start = date ? `DTSTART${time ? `:${date}T${time}00` : `;VALUE=DATE:${date}`}` : ''
  const details = [event.venue, event.address].filter(Boolean).join(', ')
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Baby Celebration//Invitation//EN',
    'BEGIN:VEVENT',
    start,
    `SUMMARY:${icsEscape(`Baby ${event.lastName} celebration`)}`,
    details ? `LOCATION:${icsEscape(details)}` : '',
    `DESCRIPTION:${icsEscape('We hope you can join us!')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = 'baby-celebration.ics'
  link.click()
  URL.revokeObjectURL(url)
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
  if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('has-reveal-observer')
    const rsvpSection = document.getElementById('rsvp')
    rsvpObserver = new IntersectionObserver(([entry]) => {
      showStickyRsvp.value = !entry.isIntersecting
    }, { threshold: 0 })
    if (rsvpSection) rsvpObserver.observe(rsvpSection)

    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.reveal-section').forEach((section) => revealObserver.observe(section))
  } else {
    window.addEventListener('scroll', updateStickyRsvp, { passive: true })
    window.addEventListener('resize', updateStickyRsvp)
    updateStickyRsvp()
  }

  try {
    const savedEvent = await fetchEvent()
    Object.assign(event, Object.fromEntries(
      Object.entries(savedEvent).filter(([, value]) => value !== null && value !== undefined && value !== ''),
    ))
  } catch (requestError) {
    console.error('Unable to load saved event details:', requestError)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', updateStickyRsvp)
  window.removeEventListener('resize', updateStickyRsvp)
  document.documentElement.classList.remove('has-reveal-observer')
  rsvpObserver?.disconnect()
  revealObserver?.disconnect()
})
</script>
