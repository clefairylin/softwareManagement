import { defineStore } from 'pinia'


interface MainStoreState {
  isConnected: boolean
}

export const useMainStore = defineStore('state', {
  state: (): MainStoreState => ({
    isConnected: true,
  }),

  getters: {
    
  },

  actions: {
  }
})
