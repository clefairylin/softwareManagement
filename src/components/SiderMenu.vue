<template>
  <div class="vc-sider-menu">
    <div class="logo-wrap" @click="handleLogoClick">
      <img
        src="@/assets/logo.png"
        :class="['logo', isRotate ? 'logo-rotate' : '']"
        alt=""
      />
    </div>
    <div class="view-guide">
      <div
        v-for="view in views"
        :key="view.name"
        class="view-item"
        :class="route.path === view.path ? 'view-item-active' : ''"
        @click="handleViewClick(view)"
      >
        <Icon
          :name="view.icon"
          :size="26"
          :color="route.path === view.path ? '#4d6deb' : ''"
        />
        <span>{{ view.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { routeEnum } from '@/router'
import { useRoute, useRouter } from 'vue-router'

interface ViewData {
  id: string
  name: string
  path: string
  icon: string
}

const views: ViewData[] = [
  { id: 'home', name: '首页', path: routeEnum.HOME, icon: 'HomeOutlined' },
  {
    id: 'treasure',
    name: '宝库',
    path: routeEnum.TREASURE,
    icon: 'AppstoreOutlined'
  },
  {
    id: 'uninstall',
    name: '卸载',
    path: routeEnum.UNINSTALL,
    icon: 'DeleteOutlined'
  },
  {
    id: 'download',
    name: '下载',
    path: routeEnum.DOWNLOAD,
    icon: 'DownloadOutlined'
  },
  {
    id: 'setting',
    name: '设置',
    path: routeEnum.SETTING,
    icon: 'SettingOutlined'
  }
]

const route = useRoute()
const router = useRouter()
function handleViewClick(view: ViewData) {
  if (route.path !== view.path) {
    console.log('switch to', view.id)
    router.push(view.path)
  }
}

const isRotate = ref(false)
let rotateTimer: NodeJS.Timeout | null = null
function handleLogoClick() {
  if (rotateTimer === null && !isRotate.value) {
    isRotate.value = true
    rotateTimer = setTimeout(() => {
      isRotate.value = false
      rotateTimer = null
    }, 500)
  }
}
</script>

<style lang="scss" scoped>
$activeColor: #4d6deb;
$hoverBackgroundColor: #ebf6fe;
$activeBackgroundColor: #e0f1ff;
.vc-sider-menu {
  width: 0.8rem;
  background: linear-gradient(to bottom, #eafeff, #fff, #eafeff);
  .logo-wrap {
    height: 0.7rem;
    @include flex-column(center, center);
    .logo {
      width: 0.4rem;
    }
    .logo-rotate {
      transform: rotate(360deg);
      transition: all 0.5s;
    }
    &:hover {
      background-color: $hoverBackgroundColor;
    }
  }
  .view-guide {
    height: calc(100% - 0.7rem);
    @include flex-column(center, center);
    .view-item {
      width: 100%;
      flex-grow: 1;
      padding: 0.1rem;
      @include flex-column(center, center);
      &:hover {
        background-color: $hoverBackgroundColor;
      }
    }
    .view-item-active {
      color: $activeColor;
      background-color: $activeBackgroundColor;
      &:hover {
        background-color: $activeBackgroundColor;
      }
    }
  }
}
</style>
