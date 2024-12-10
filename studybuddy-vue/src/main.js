import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Wir werden einen Router hinzufügen

const app = createApp(App)
app.use(router)
app.mount('#app')