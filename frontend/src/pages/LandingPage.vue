<template>
  <main class="landing-page">
    <div class="landing-decoration balloon balloon-one" aria-hidden="true">🎈</div>
    <div class="landing-decoration balloon balloon-two" aria-hidden="true">🎈</div>
    <div class="landing-decoration sparkle sparkle-one" aria-hidden="true">✦</div>
    <div class="landing-decoration sparkle sparkle-two" aria-hidden="true">✧</div>
    <div class="landing-confetti" aria-hidden="true"></div>
    <section class="landing-card">
      <p class="eyebrow">A little one is on the way</p>
      <p class="landing-kicker">With love, {{ event.parentOne }} &amp; {{ event.parentTwo }}</p>
      <h1>Baby {{ event.lastName }}<br />is on the way!</h1>
      <p class="lede">A tiny celebration for our biggest adventure yet.</p>
      <div class="landing-actions">
        <RouterLink class="button landing-primary" to="/celebrate">Open Invitation <span aria-hidden="true">→</span></RouterLink>
        <RouterLink class="button landing-secondary" to="/celebrate#rsvp">RSVP Now</RouterLink>
      </div>
      <p class="landing-footnote">We can’t wait to celebrate with you 💙💗</p>
    </section>
  </main>
</template>

<script setup>
import { eventDetails as event } from '../config/event'
</script>
