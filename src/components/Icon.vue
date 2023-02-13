<template>
  <div
    v-if="iconComponent"
    class="vc-icon"
    :style="{
      height: size / 100 + 0.2 + 'rem',
      width: size / 100 + 0.2 + 'rem',
      color: color || (isHover ? hoverColor : '')
    }"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <component
      :is="iconComponent"
      :style="{ fontSize: size / 100 + 'rem' }"
    ></component>
  </div>
</template>

<script setup lang="ts">
import {
  LeftOutlined,
  ReloadOutlined,
  MinusOutlined,
  CloseOutlined,
  SearchOutlined,
  HomeOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SettingOutlined
} from '@ant-design/icons-vue'
import { computed, ref } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    default: 15
  },
  color: {
    type: String,
    default: ''
  },
  hoverColor: {
    type: String,
    default: ''
  }
})

const suppotComponents: Record<string, any> = {
  LeftOutlined,
  ReloadOutlined,
  MinusOutlined,
  CloseOutlined,
  SearchOutlined,
  HomeOutlined,
  AppstoreOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SettingOutlined
}
const iconComponent = computed(() => suppotComponents[props.name])

const isHover = ref(false)
</script>

<style lang="scss" scoped>
.vc-icon {
  -webkit-app-region: no-drag;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #464444;
}
.vc-icon + .vc-icon {
  margin-left: 0.1rem;
}
</style>
