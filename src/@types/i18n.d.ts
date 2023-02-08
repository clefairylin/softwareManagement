export {}

declare module '@vue/runtime-core' {
  import { i18nFuncType } from '@/utils/plugins/i18n'
  interface ComponentCustomProperties {
    $t: i18nFuncType;
  }
}