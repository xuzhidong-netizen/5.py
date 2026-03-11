<template>
  <div>
    <div class="toolbar">
      <h2>其他功能 · 报表中心</h2>
      <el-button :loading="loading" @click="loadAll">刷新报表</el-button>
    </div>

    <el-tabs v-model="activeTab">
      <el-tab-pane label="文档生成报表" name="document">
        <ReportContent title="文档生成报表" :payload="reports.document" />
      </el-tab-pane>
      <el-tab-pane label="案例生成报表" name="caseGeneration">
        <ReportContent title="案例生成报表" :payload="reports.caseGeneration" />
      </el-tab-pane>
      <el-tab-pane label="案例入库报表" name="caseStorage">
        <ReportContent title="案例入库报表" :payload="reports.caseStorage" />
      </el-tab-pane>
      <el-tab-pane label="执行统计报表" name="execution">
        <ReportContent title="执行统计报表" :payload="reports.execution" />
      </el-tab-pane>
      <el-tab-pane label="结果趋势报表" name="resultTrend">
        <ReportContent title="结果趋势报表" :payload="reports.resultTrend" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { otherReportApi } from '../api/platform'
import ReportContent from '../components/ReportContent.vue'

const activeTab = ref('document')
const loading = ref(false)

const reports = reactive({
  document: {},
  caseGeneration: {},
  caseStorage: {},
  execution: {},
  resultTrend: {}
})

async function loadAll() {
  try {
    loading.value = true
    const [
      documentRes,
      caseGenerationRes,
      caseStorageRes,
      executionRes,
      trendRes
    ] = await Promise.all([
      otherReportApi.document(),
      otherReportApi.caseGeneration(),
      otherReportApi.caseStorage(),
      otherReportApi.execution(),
      otherReportApi.resultTrend()
    ])

    reports.document = documentRes.data || {}
    reports.caseGeneration = caseGenerationRes.data || {}
    reports.caseStorage = caseStorageRes.data || {}
    reports.execution = executionRes.data || {}
    reports.resultTrend = trendRes.data || {}
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
</style>
