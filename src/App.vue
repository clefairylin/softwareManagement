<template>
  <MenuBar />
  <router-view />
</template>

<script setup lang="ts">
import MenuBar from '@/components/MenuBar.vue'
import useEmitter from '@/shared/useEmitter'
import { onBeforeMount } from '@vue/runtime-core'

const emitter = useEmitter()

onBeforeMount(() => {
  function setFontSize() {
    const sizeByWidth = 100 * (window.innerWidth / 1920)
    const sizeByHeight = 100 * (window.innerHeight / 1080)
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

<style lang="scss">
#app {
  font-size: 0.22rem;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @include wh(100vw, 100vh);
}
</style>
