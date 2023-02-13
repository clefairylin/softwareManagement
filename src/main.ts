import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import router from './router'
import '@/styles'
import { createPinia } from 'pinia'
import i18n from '@/utils/plugins/i18n'
import ElectronStore from 'electron-store'
import Icon from '@/components/Icon.vue'

const electronStore = new ElectronStore()
const language = (electronStore.get('languageTemp') as string) || 'zh-cn'
createApp(App)
  .use(Antd)
  .use(router)
  .use(createPinia())
  .use(i18n, language)
  .component('Icon', Icon)
  .mount('#app')
