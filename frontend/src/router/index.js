import { createRouter, createWebHistory } from 'vue-router'
import store from '../store'
import AppShell from '../components/AppShell.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import AiDocumentView from '../views/AiDocumentView.vue'
import AiCaseGeneratorView from '../views/AiCaseGeneratorView.vue'
import AiManageView from '../views/AiManageView.vue'
import ExecutionsView from '../views/ExecutionsView.vue'
import AiResultView from '../views/AiResultView.vue'
import OtherAiConfigView from '../views/OtherAiConfigView.vue'
import OtherReportCenterView from '../views/OtherReportCenterView.vue'
import OtherLogCenterView from '../views/OtherLogCenterView.vue'
import SystemManageView from '../views/SystemManageView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { public: true }
  },
  {
    path: '/',
    component: AppShell,
    children: [
      { path: '', redirect: '/dashboard' },
      { path: '/dashboard', name: 'dashboard', component: DashboardView },

      { path: '/ai', redirect: '/ai/document' },
      { path: '/ai/document', name: 'ai-document', component: AiDocumentView },
      { path: '/ai/case', name: 'ai-case', component: AiCaseGeneratorView },
      { path: '/ai/manage', name: 'ai-manage', component: AiManageView },
      { path: '/ai/execute', name: 'ai-execute', component: ExecutionsView },
      { path: '/ai/result', name: 'ai-result', component: AiResultView },

      { path: '/other', redirect: '/other/ai-config' },
      { path: '/other/ai-config', name: 'other-ai-config', component: OtherAiConfigView },
      { path: '/other/reports', name: 'other-reports', component: OtherReportCenterView },
      { path: '/other/logs', name: 'other-logs', component: OtherLogCenterView },

      { path: '/system', name: 'system-manage', component: SystemManageView },

      // Legacy route compatibility
      { path: '/cases', redirect: '/ai/manage' },
      { path: '/cases/draft', redirect: '/ai/manage' },
      { path: '/cases/published', redirect: '/ai/manage' },
      { path: '/executions', redirect: '/ai/execute' }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.public) {
    return true
  }

  if (!store.getters.isAuthenticated) {
    return { name: 'login' }
  }

  if (!store.state.profile && !store.state.loadingProfile) {
    try {
      await store.dispatch('loadProfile')
    } catch {
      store.dispatch('logout')
      return { name: 'login' }
    }
  }

  return true
})

export default router
