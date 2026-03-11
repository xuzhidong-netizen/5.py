import axios from 'axios'

const apiBaseKey = 'platform_api_base'

function normalizeBaseUrl(rawValue) {
  const value = String(rawValue || '').trim()
  if (!value) return ''
  return value.replace(/\/+$/, '')
}

export function isGithubPagesHost() {
  if (typeof window === 'undefined') return false
  return window.location.hostname.endsWith('github.io')
}

export function getApiBase() {
  if (typeof window !== 'undefined') {
    const runtimeBase = localStorage.getItem(apiBaseKey)
    if (runtimeBase) {
      return normalizeBaseUrl(runtimeBase)
    }
  }
  return normalizeBaseUrl(import.meta.env.VITE_API_BASE || '')
}

export function setApiBase(baseUrl) {
  if (typeof window === 'undefined') return
  const normalized = normalizeBaseUrl(baseUrl)
  if (normalized) {
    localStorage.setItem(apiBaseKey, normalized)
  } else {
    localStorage.removeItem(apiBaseKey)
  }
}

const http = axios.create({
  timeout: 10000
})

http.interceptors.request.use((config) => {
  const apiBase = getApiBase()
  config.baseURL = apiBase

  const requestUrl = String(config.url || '')
  if (!apiBase && isGithubPagesHost() && requestUrl.startsWith('/api')) {
    return Promise.reject(new Error('未配置后端 API 地址。请先在登录页填写“后端 API 地址”，例如 https://your-backend.example.com'))
  }

  const token = localStorage.getItem('platform_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    let message = error.response?.data?.message || error.message || '请求失败'
    if (status === 405 && isGithubPagesHost() && !getApiBase()) {
      message = '当前地址是静态站点，不能直接处理 API 请求。请在登录页配置后端 API 地址后重试。'
    }
    return Promise.reject(new Error(message))
  }
)

export default http
