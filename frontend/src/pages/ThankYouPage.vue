<template>
  <main class="page confirmation">
    <div class="confetti-burst" aria-hidden="true">
      <span v-for="piece in 16" :key="piece" :style="{ '--piece': piece }"></span>
    </div>
    <p class="eyebrow">Response received</p>
    <h1>Thank you!</h1>
    <div class="panel">
      <div class="confirmation-mark" aria-hidden="true">💙💗</div>
      <p class="lede">Your RSVP is on its way. We can't wait to celebrate with you!</p>
      <RouterLink class="button" to="/celebrate">Back to the invitation</RouterLink>
    </div>
  </main>
</template>
