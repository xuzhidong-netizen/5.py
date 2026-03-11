import { createStore } from 'vuex'
import { authApi } from '../api/platform'

const tokenKey = 'platform_token'

export default createStore({
  state: {
    token: localStorage.getItem(tokenKey) || '',
    profile: null,
    loadingProfile: false
  },
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem(tokenKey, token)
      } else {
        localStorage.removeItem(tokenKey)
      }
    },
    setProfile(state, profile) {
      state.profile = profile
    },
    setLoadingProfile(state, loading) {
      state.loadingProfile = loading
    }
  },
  actions: {
    async login({ commit }, payload) {
      const response = await authApi.login(payload)
      commit('setToken', response.data.token)
      commit('setProfile', {
        username: response.data.username,
        role: response.data.role
      })
      return response.data
    },
    async register(_, payload) {
      return authApi.register(payload)
    },
    async loadProfile({ commit, state }) {
      if (!state.token) return null
      commit('setLoadingProfile', true)
      try {
        const response = await authApi.me()
        commit('setProfile', response.data)
        return response.data
      } finally {
        commit('setLoadingProfile', false)
      }
    },
    logout({ commit }) {
      commit('setToken', '')
      commit('setProfile', null)
    }
  }
})
