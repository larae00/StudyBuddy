import { createRouter, createWebHistory } from 'vue-router'
import Hauptseite from '../components/Hauptseite.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path:'/Hauptseite',
      name:'Hauptseite',
      component: Hauptseite,
    },
  ],
})

export default router
