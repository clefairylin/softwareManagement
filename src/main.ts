import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/styles'
import { createPinia } from 'pinia'
import i18n from '@/utils/plugins/i18n'
import ElectronStore from 'electron-store'


const electronStore = new ElectronStore()
const language = electronStore.get('languageTemp') as string || 'zh-cn'
createApp(App)
  .use(router)
  .use(createPinia())
  .use(i18n, language)
  .mount('#app')
