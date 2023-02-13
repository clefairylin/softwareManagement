<template>
  <SiderMenu />
  <div class="layout-content">
    <HeadMenu />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import HeadMenu from '@/components/HeadMenu.vue'
import SiderMenu from './components/SiderMenu.vue'
import useEmitter from '@/shared/useEmitter'
import { onBeforeMount } from '@vue/runtime-core'

const emitter = useEmitter()

onBeforeMount(() => {
  function setFontSize() {
    const sizeByWidth = 100 * (window.innerWidth / 980)
    const sizeByHeight = 100 * (window.innerHeight / 650)
    document.documentElement.style.fontSize =
      Math.floor(Math.min(sizeByWidth, sizeByHeight)) + 'px'
  }
  setFontSize()
  window.onresize = function () {
    setFontSize()
    emitter.emit('windowResize')
  }
})
</script>

<style lang="scss" scoped>
.layout-content {
  flex-grow: 1;
}
</style>

<style lang="scss">
#app {
  font-size: 0.14rem;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @include wh(100vw, 100vh);
  display: flex;
}
</style>
