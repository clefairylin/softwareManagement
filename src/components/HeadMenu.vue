<template>
  <div class="vc-head-menu">
    <div class="tool-left">
      <Icon
        v-if="isTreasureView"
        name="LeftOutlined"
        :hoverColor="iconHoverBackgroudColor"
        @click=""
      />
      <Icon
        name="ReloadOutlined"
        :hoverColor="iconHoverBackgroudColor"
        @click=""
      />
      <a-input
        class="head-search"
        v-model:value="searchInput"
        placeholder="search"
        size="small"
        @pressEnter="handleSearch"
      >
        <template #suffix>
          <Icon name="SearchOutlined" />
        </template>
      </a-input>
    </div>
    <div class="tool-right">
      <Icon
        name="SettingOutlined"
        :hoverColor="iconHoverBackgroudColor"
        @click.stop=""
      />
      <Icon
        name="MinusOutlined"
        :hoverColor="iconHoverBackgroudColor"
        @click.stop="ipcMainMinimize"
      />
      <Icon
        name="CloseOutlined"
        :hoverColor="iconHoverBackgroudColor"
        @click.stop="ipcMainClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { routeEnum } from '@/router'
import useProcessCommunicate from '@/shared/useProcessCommunicate'

const iconHoverBackgroudColor = '#a89e9e'
const route = useRoute()
const { ipcMainMinimize, ipcMainClose } = useProcessCommunicate()

const isTreasureView = computed(() => route.path === routeEnum.TREASURE)

const searchInput = ref('')
function handleSearch() {
  console.log(searchInput.value)
}
</script>

<style lang="scss" scoped>
.vc-head-menu {
  height: 0.4rem;
  padding: 0 0.1rem;
  background-color: #c7f3ff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  -webkit-app-region: drag;
  .tool-left {
    display: flex;
    align-items: center;
    .ant-input-affix-wrapper {
      height: 0.25rem;
      -webkit-app-region: no-drag;
    }
    .head-search {
      margin-left: 0.1rem;
    }
  }
  .tool-right {
    display: flex;
  }
}
</style>
