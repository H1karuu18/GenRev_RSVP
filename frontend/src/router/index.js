import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../pages/LandingPage.vue'
import CelebratePage from '../pages/CelebratePage.vue'
import RsvpPage from '../pages/RsvpPage.vue'
import ThankYouPage from '../pages/ThankYouPage.vue'
import AdminPage from '../pages/AdminPage.vue'

export default createRouter({
  history: createWebHistory(),
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
  routes: [
    { path: '/', name: 'home', component: LandingPage },
    { path: '/celebrate', name: 'celebrate', component: CelebratePage },
    { path: '/rsvp', redirect: { name: 'celebrate', hash: '#rsvp' } },
    { path: '/thank-you', name: 'thank-you', component: ThankYouPage },
    { path: '/admin', name: 'admin', component: AdminPage },
  ],
})
