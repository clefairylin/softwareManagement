<template>
  <div class="vc-tool-bar">
    <div class="tool-button" @click="ipcMainMinimize">
      <span class="button-minimize"></span>
    </div>
    <div v-if="isMaximized" class="tool-button" @click="ipcMainMaximizeTogger">
      <span class="button-unmaxmin"></span>
    </div>
    <div v-else class="tool-button" @click="ipcMainMaximizeTogger">
      <span class="button-maxmin"></span>
    </div>
    <div class="tool-button" @click="ipcMainClose">
      <span class="button-close"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import useEmitter from '@/shared/useEmitter'
import useProcessCommunicate from '@/shared/useProcessCommunicate'
import { onBeforeMount, onBeforeUnmount, ref } from 'vue'

const isMaximized = ref(false)
const emitter = useEmitter()
const {
  ipcMainMinimize,
  getMainMaximizedValue,
  ipcMainMaximizeTogger,
  ipcMainClose
} = useProcessCommunicate()

onBeforeMount(() => {
  emitter.on('windowResize', async () => {
    const isMaximizedValue = await getMainMaximizedValue()
    isMaximized.value = isMaximizedValue
  })
})

onBeforeUnmount(() => {
  emitter.off('windowResize')
})
</script>

<style lang="scss" scoped>
.vc-tool-bar {
  height: 0.5rem;
  background-color: #8c939d;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  -webkit-app-region: drag;

  .tool-button {
    @include wh(0.4rem);
    margin-right: 0.24rem;
    cursor: pointer;
    -webkit-app-region: no-drag;
    @include background-hover-active(#a19f9f, #d90000);

    span {
      display: inline-block;
      @include wh(100%);
      @include background-center(cover);
    }
  }

  @each $type in minimize, maxmin, unmaxmin, close {
    .button-#{$type} {
      background-image: url('~@assets/menuBar/#{$type}.png');
    }
  }
}
</style>
