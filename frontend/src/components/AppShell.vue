<template>
  <div class="shell-layout">
    <aside class="sidebar">
      <h2>Automation V2</h2>
      <p class="subtitle">Spring Boot + Vue</p>
      <el-menu :default-active="route.path" router>
        <el-menu-item index="/dashboard">首页</el-menu-item>

        <el-sub-menu index="ai-test">
          <template #title>AI测试</template>
          <el-menu-item index="/ai/document">1. 文档</el-menu-item>
          <el-menu-item index="/ai/case">2. 案例</el-menu-item>
          <el-menu-item index="/ai/manage">3. 管理</el-menu-item>
          <el-menu-item index="/ai/execute">4. 执行</el-menu-item>
          <el-menu-item index="/ai/result">5. 结果</el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="other-features">
          <template #title>其他功能</template>
          <el-menu-item index="/other/ai-config">AI测试后台管理</el-menu-item>
          <el-menu-item index="/other/reports">报表中心</el-menu-item>
          <el-menu-item index="/other/logs">日志中心</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/system">系统管理</el-menu-item>
      </el-menu>
    </aside>

    <main class="content">
      <header class="topbar">
        <div>
          <strong>{{ username }}</strong>
          <span class="role">{{ role }}</span>
        </div>
        <el-button type="danger" plain @click="logout">退出登录</el-button>
      </header>
      <section class="page-card">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()

const username = computed(() => store.state.profile?.username || 'unknown')
const role = computed(() => store.state.profile?.role || '-')

function logout() {
  store.dispatch('logout')
  router.push('/login')
}
</script>

<style scoped>
.shell-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 250px 1fr;
}

.sidebar {
  background: #0f172a;
  color: #e2e8f0;
  padding: 24px 16px;
  border-right: 1px solid rgba(148, 163, 184, 0.2);
}

.sidebar h2 {
  margin: 0;
}

.subtitle {
  margin: 6px 0 14px;
  color: #94a3b8;
  font-size: 13px;
}

.content {
  padding: 20px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.role {
  margin-left: 10px;
  color: #6b7280;
  font-size: 13px;
}

.page-card {
  background: var(--card);
  border-radius: 14px;
  min-height: calc(100vh - 110px);
  padding: 20px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
}
</style>
