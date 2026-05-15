import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { setApiKeyProvider } from './services/api.js'
import { useSettingsStore } from './stores/settings.js'
import { seedDemoData } from './utils/demoData.js'
import './styles/base.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
app.mount('#app')

setApiKeyProvider(() => {
  const settings = useSettingsStore()
  return settings.lmStudioApiKey
})

seedDemoData()
