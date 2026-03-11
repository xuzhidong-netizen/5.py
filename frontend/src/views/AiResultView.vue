<template>
  <div>
    <div class="header-row">
      <h2>AI测试 · 结果</h2>
      <el-button :loading="loading" @click="loadRuns">刷新</el-button>
    </div>

    <el-row :gutter="12" class="summary-row">
      <el-col :xs="12" :sm="6">
        <el-card><p>执行总数</p><h3>{{ summary.total }}</h3></el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card><p>通过次数</p><h3>{{ summary.passed }}</h3></el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card><p>失败次数</p><h3>{{ summary.failed }}</h3></el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card><p>通过率</p><h3>{{ passRate }}%</h3></el-card>
      </el-col>
    </el-row>

    <el-table :data="runs" stripe @row-click="openDetail">
      <el-table-column prop="runId" label="Run ID" min-width="230" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'PASSED' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="totalCases" label="总数" width="90" />
      <el-table-column prop="passedCases" label="通过" width="90" />
      <el-table-column prop="failedCases" label="失败" width="90" />
      <el-table-column label="开始时间" min-width="160">
        <template #default="scope">{{ formatTime(scope.row.startedAt) }}</template>
      </el-table-column>
      <el-table-column label="结束时间" min-width="160">
        <template #default="scope">{{ formatTime(scope.row.finishedAt) }}</template>
      </el-table-column>
    </el-table>

    <el-drawer v-model="detailVisible" title="执行结果详情" size="50%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Run ID">{{ detail.summary?.runId }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.summary?.status }}</el-descriptions-item>
        <el-descriptions-item label="总数">{{ detail.summary?.totalCases }}</el-descriptions-item>
        <el-descriptions-item label="通过">{{ detail.summary?.passedCases }}</el-descriptions-item>
      </el-descriptions>

      <el-table :data="detail.details || []" style="margin-top: 12px" stripe>
        <el-table-column prop="caseId" label="Case ID" width="90" />
        <el-table-column prop="caseName" label="案例名称" min-width="180" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="message" label="信息" min-width="180" />
        <el-table-column prop="durationMs" label="耗时(ms)" width="100" />
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { executionApi } from '../api/platform'

const loading = ref(false)
const runs = ref([])
const detailVisible = ref(false)
const detail = reactive({ summary: null, details: [] })

const summary = computed(() => {
  const total = runs.value.length
  const passed = runs.value.filter((item) => item.status === 'PASSED').length
  const failed = runs.value.filter((item) => item.status === 'FAILED').length
  return { total, passed, failed }
})

const passRate = computed(() => {
  if (!summary.value.total) return '0.00'
  return ((summary.value.passed / summary.value.total) * 100).toFixed(2)
})

async function loadRuns() {
  try {
    loading.value = true
    const response = await executionApi.list()
    runs.value = response.data
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

async function openDetail(row) {
  try {
    const response = await executionApi.detail(row.runId)
    detail.summary = response.data.summary
    detail.details = response.data.details || []
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(error.message)
  }
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

onMounted(loadRuns)
</script>

<style scoped>
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.summary-row {
  margin-bottom: 12px;
}

h3 {
  margin: 8px 0 0;
}

p {
  margin: 0;
  color: var(--muted);
}
</style>
