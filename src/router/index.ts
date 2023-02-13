import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '@/views/home/HomeView.vue'
import TreasureView from '@/views/treasure/TreasureView.vue'
import DownloadView from '@/views/download/DownloadView.vue'
import UninstallView from '@/views/uninstall/UninstallView.vue'
import SettingView from '@/views/setting/SettingView.vue'

export enum routeEnum {
  HOME = '/',
  TREASURE = '/treasure',
  DOWNLOAD = '/download',
  UNINSTALL = '/uninstall',
  SETTING = '/setting'
}

const routes: Array<RouteRecordRaw> = [
  {
    path: routeEnum.HOME,
    name: 'home',
    component: HomeView
  },
  {
    path: routeEnum.TREASURE,
    name: 'treasure',
    component: TreasureView
  },
  {
    path: routeEnum.UNINSTALL,
    name: 'unisntall',
    component: UninstallView
  },
  {
    path: routeEnum.DOWNLOAD,
    name: 'download',
    component: DownloadView
  },
  {
    path: routeEnum.SETTING,
    name: 'setting',
    component: SettingView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
