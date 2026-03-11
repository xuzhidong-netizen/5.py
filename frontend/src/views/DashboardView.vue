<template>
  <div>
    <h2>平台概览</h2>
    <el-row :gutter="12">
      <el-col v-for="card in cards" :key="card.label" :xs="12" :sm="8" :md="6">
        <el-card shadow="hover" class="metric-card">
          <p class="metric-label">{{ card.label }}</p>
          <h3>{{ card.value }}</h3>
        </el-card>
      </el-col>
    </el-row>
    <el-alert
      v-if="summary.latestRunId"
      class="mt"
      type="success"
      :closable="false"
      :title="`最近执行任务：${summary.latestRunId}`"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { dashboardApi } from '../api/platform'

const summary = reactive({
  totalCases: 0,
  enabledCases: 0,
  totalExecutions: 0,
  passedExecutions: 0,
  failedExecutions: 0,
  latestRunId: ''
})

const cards = computed(() => [
  { label: '测试用例总数', value: summary.totalCases },
  { label: '启用用例', value: summary.enabledCases },
  { label: '执行总次数', value: summary.totalExecutions },
  { label: '执行通过', value: summary.passedExecutions },
  { label: '执行失败', value: summary.failedExecutions }
])

async function load() {
  try {
    const response = await dashboardApi.summary()
    Object.assign(summary, response.data)
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(load)
</script>

<style scoped>
.metric-card {
  margin-bottom: 12px;
}

.metric-label {
  color: var(--muted);
  margin: 0;
}

h3 {
  margin: 6px 0 0;
  font-size: 28px;
}

.mt {
  margin-top: 12px;
}
</style>
