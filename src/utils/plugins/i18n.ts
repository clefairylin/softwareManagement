import { App, ref } from 'vue'
import i18nJson from './translation.json'


// 转换 json 文件
const i18nMap: Map<string, Record<string, string>> = new Map()
i18nJson.forEach(t => {
  i18nMap.set(t.key, t)
})

// 语言切换
const translation = ref<Record<string, string>>({})
export const setI18nLanguage = function (lang = 'en') {
  translation.value = i18nMap.get(lang) || i18nMap.get('en') || {}
}

/**
 * 翻译
 * @param key i18n ket
 * @param defaultValue 默认值 
 * @param holder 占位符替换
 * @returns {string}
 */
export function i18n(key: string, defaultValue?: string, holder?: string): string {
  if (!key) return ''
  let result = (translation.value && translation.value[key || '']) || defaultValue || ''
  if (holder) {
    result = result.replace('{key}', holder)
  }
  return result
}
export type i18nFuncType = typeof i18n

export default {
  install: (app: App, lang = 'en') => {
    setI18nLanguage(lang)
    app.config.globalProperties.$t = i18n
    app.config.globalProperties.$getI18n = () => translation.value['key']
    app.config.globalProperties.$setI18n = setI18nLanguage
  }
}
