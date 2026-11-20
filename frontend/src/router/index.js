import { createRouter, createWebHistory } from 'vue-router'
import RsvpPage from '../pages/RsvpPage.vue'
import ThankYouPage from '../pages/ThankYouPage.vue'
import AdminPage from '../pages/AdminPage.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'rsvp', component: RsvpPage },
    { path: '/thank-you', name: 'thank-you', component: ThankYouPage },
    { path: '/admin', name: 'admin', component: AdminPage },
  ],
})
