<template>
  <div>
    <div class="toolbar">
      <h2>其他功能 · 日志中心</h2>
      <div>
        <el-input-number v-model="limit" :min="10" :max="500" :step="10" style="margin-right: 8px" />
        <el-button :loading="loading" @click="loadLogs">刷新日志</el-button>
      </div>
    </div>

    <el-tabs v-model="activeTab" @tab-change="loadLogs">
      <el-tab-pane label="操作日志" name="operations" />
      <el-tab-pane label="接口调用日志" name="apiCalls" />
      <el-tab-pane label="AI生成日志" name="aiGenerations" />
      <el-tab-pane label="执行日志" name="executions" />
      <el-tab-pane label="异常日志" name="exceptions" />
    </el-tabs>

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column
        v-for="key in columns"
        :key="key"
        :prop="key"
        :label="key"
        min-width="140"
        show-overflow-tooltip
      />
    </el-table>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { otherLogApi } from '../api/platform'

const activeTab = ref('operations')
const rows = ref([])
const loading = ref(false)
const limit = ref(100)

const columns = computed(() => {
  const first = rows.value[0]
  if (!first) {
    return ['message']
  }
  return Object.keys(first)
    .filter((key) => typeof first[key] !== 'object')
    .slice(0, 12)
})

async function loadLogs() {
  try {
    loading.value = true

    if (activeTab.value === 'operations') {
      rows.value = (await otherLogApi.operations(limit.value)).data || []
      return
    }
    if (activeTab.value === 'apiCalls') {
      rows.value = (await otherLogApi.apiCalls(limit.value)).data || []
      return
    }
    if (activeTab.value === 'aiGenerations') {
      rows.value = (await otherLogApi.aiGenerations(limit.value)).data || []
      return
    }
    if (activeTab.value === 'executions') {
      rows.value = (await otherLogApi.executions(limit.value)).data || []
      return
    }

    rows.value = (await otherLogApi.exceptions(limit.value)).data || []
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

onMounted(loadLogs)
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
