import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const store = new Vuex.Store({
  state: {
    uplinkQuality: -1,
    uplinkDelay: -1,
    downlinkQuality: -1,
  },
  mutations: {
    updateUplinkQuality(state, payload) {
      state.uplinkQuality = payload
    },
    updateUplinkDelay(state, payload) {
      state.uplinkDelay = payload
    },
    updateDownlinkQuality(state, payload) {
      state.downlinkQuality = payload
    }
  }
})
