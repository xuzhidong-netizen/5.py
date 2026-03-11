<template>
  <div>
    <h2>执行中心</h2>
    <el-card shadow="never">
      <h3>触发执行</h3>
      <el-checkbox-group v-model="selectedCaseIds" class="case-grid">
        <el-checkbox v-for="item in cases" :key="item.id" :label="item.id">{{ item.caseName }}</el-checkbox>
      </el-checkbox-group>
      <el-button type="primary" :disabled="selectedCaseIds.length === 0" @click="trigger">立即执行</el-button>
    </el-card>

    <el-table :data="runs" stripe style="margin-top: 16px" @row-click="openDetail">
      <el-table-column prop="runId" label="Run ID" min-width="220" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="totalCases" label="总数" width="80" />
      <el-table-column prop="passedCases" label="通过" width="80" />
      <el-table-column prop="failedCases" label="失败" width="80" />
      <el-table-column prop="summary" label="摘要" min-width="160" />
    </el-table>

    <el-drawer v-model="detailVisible" title="执行详情" size="45%">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Run ID">{{ detail.summary?.runId }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ detail.summary?.status }}</el-descriptions-item>
        <el-descriptions-item label="总数">{{ detail.summary?.totalCases }}</el-descriptions-item>
        <el-descriptions-item label="通过">{{ detail.summary?.passedCases }}</el-descriptions-item>
      </el-descriptions>
      <el-table :data="detail.details || []" style="margin-top: 12px" stripe>
        <el-table-column prop="caseId" label="Case ID" width="90" />
        <el-table-column prop="caseName" label="名称" min-width="180" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="message" label="消息" min-width="160" />
        <el-table-column prop="durationMs" label="耗时(ms)" width="100" />
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { caseApi, executionApi } from '../api/platform'

const cases = ref([])
const runs = ref([])
const selectedCaseIds = ref([])
const detailVisible = ref(false)
const detail = reactive({ summary: null, details: [] })

async function loadCases() {
  const response = await caseApi.list()
  cases.value = response.data.filter((item) => item.enabled)
}

async function loadRuns() {
  const response = await executionApi.list()
  runs.value = response.data
}

async function trigger() {
  try {
    await executionApi.run({ caseIds: selectedCaseIds.value })
    ElMessage.success('执行完成')
    selectedCaseIds.value = []
    await loadRuns()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function openDetail(row) {
  try {
    const response = await executionApi.detail(row.runId)
    detail.summary = response.data.summary
    detail.details = response.data.details
    detailVisible.value = true
  } catch (error) {
    ElMessage.error(error.message)
  }
}

onMounted(async () => {
  try {
    await Promise.all([loadCases(), loadRuns()])
  } catch (error) {
    ElMessage.error(error.message)
  }
})
</script>

<style scoped>
.case-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
</style>
