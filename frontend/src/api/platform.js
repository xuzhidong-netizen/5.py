import http from './http'

export const authApi = {
  login(payload) {
    return http.post('/api/v1/auth/login', payload)
  },
  register(payload) {
    return http.post('/api/v1/auth/register', payload)
  },
  me() {
    return http.get('/api/v1/auth/me')
  }
}

export const dashboardApi = {
  summary() {
    return http.get('/api/v1/dashboard')
  }
}

export const caseApi = {
  list() {
    return http.get('/api/v1/cases')
  },
  create(payload) {
    return http.post('/api/v1/cases', payload)
  },
  update(id, payload) {
    return http.put(`/api/v1/cases/${id}`, payload)
  },
  remove(id) {
    return http.delete(`/api/v1/cases/${id}`)
  }
}

export const draftCaseApi = {
  list() {
    return http.get('/api/case/draft/list')
  },
  create(payload) {
    return http.post('/api/case/draft', payload)
  },
  update(id, payload) {
    return http.put(`/api/case/draft/${id}`, payload)
  },
  publish(id) {
    return http.put(`/api/case/draft/${id}/publish`)
  },
  remove(id) {
    return http.delete(`/api/case/draft/${id}`)
  }
}

export const publishedCaseApi = {
  list() {
    return http.get('/api/case/published/list')
  },
  create(payload) {
    return http.post('/api/case/published', payload)
  },
  update(id, payload) {
    return http.put(`/api/case/published/${id}`, payload)
  },
  remove(id) {
    return http.delete(`/api/case/published/${id}`)
  },
  batchRemove(payload) {
    return http.put('/api/case/published/delete/batch', payload)
  },
  cancelPublish(id, payload = {}) {
    return http.put(`/api/case/published/${id}/cancel-publish`, payload)
  },
  batchCancelPublish(payload) {
    return http.put('/api/case/published/cancel-publish/batch', payload)
  }
}

export const executionApi = {
  run(payload) {
    return http.post('/api/v1/executions', payload)
  },
  list() {
    return http.get('/api/v1/executions')
  },
  detail(runId) {
    return http.get(`/api/v1/executions/${runId}`)
  }
}

export const aiApi = {
  generateDocs(payload) {
    return http.post('/api/v1/ai/generate-docs', payload)
  },
  generateCases(payload) {
    return http.post('/api/v1/ai/generate-cases', payload)
  }
}

export const otherAiConfigApi = {
  list(type) {
    return http.get(`/api/v1/other/ai-config/${type}`)
  },
  create(type, payload) {
    return http.post(`/api/v1/other/ai-config/${type}`, payload)
  },
  update(type, id, payload) {
    return http.put(`/api/v1/other/ai-config/${type}/${id}`, payload)
  },
  remove(type, id) {
    return http.delete(`/api/v1/other/ai-config/${type}/${id}`)
  }
}

export const otherReportApi = {
  document() {
    return http.get('/api/v1/other/reports/document')
  },
  caseGeneration() {
    return http.get('/api/v1/other/reports/case-generation')
  },
  caseStorage() {
    return http.get('/api/v1/other/reports/case-storage')
  },
  execution() {
    return http.get('/api/v1/other/reports/execution')
  },
  resultTrend() {
    return http.get('/api/v1/other/reports/result-trend')
  }
}

export const otherLogApi = {
  operations(limit = 100) {
    return http.get('/api/v1/other/logs/operations', { params: { limit } })
  },
  apiCalls(limit = 100) {
    return http.get('/api/v1/other/logs/api-calls', { params: { limit } })
  },
  aiGenerations(limit = 100) {
    return http.get('/api/v1/other/logs/ai-generations', { params: { limit } })
  },
  executions(limit = 100) {
    return http.get('/api/v1/other/logs/executions', { params: { limit } })
  },
  exceptions(limit = 100) {
    return http.get('/api/v1/other/logs/exceptions', { params: { limit } })
  }
}
