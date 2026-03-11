<template>
  <div>
    <h2>AI测试 · 案例</h2>
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card>
          <el-form label-position="top" :model="form">
            <el-form-item label="接口名称"><el-input v-model="form.apiName" /></el-form-item>
            <el-form-item label="接口路径"><el-input v-model="form.apiPath" /></el-form-item>
            <el-form-item label="请求方法"><el-input v-model="form.method" /></el-form-item>
            <el-form-item label="业务规则">
              <el-input v-model="form.businessRule" type="textarea" :rows="6" />
            </el-form-item>
            <el-button type="success" :loading="loading" @click="generate">生成测试案例</el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card>
          <div class="result-header">
            <h3>生成案例</h3>
            <el-tag v-if="aiEngine" type="success">引擎: {{ aiEngine }}</el-tag>
          </div>
          <el-table :data="rows" stripe>
            <el-table-column type="index" label="#" width="60" />
            <el-table-column prop="name" label="案例内容" min-width="300" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { aiApi } from '../api/platform'

const loading = ref(false)
const aiEngine = ref('')
const rows = ref([])

const form = reactive({
  apiName: '下单接口',
  apiPath: '/api/order/create',
  method: 'POST',
  businessRule: '覆盖正常场景、参数边界场景和异常场景'
})

async function generate() {
  try {
    loading.value = true
    const response = await aiApi.generateCases(form)
    aiEngine.value = response.data.aiEngine || ''
    rows.value = (response.data.cases || []).map((name) => ({ name }))
    ElMessage.success(`生成 ${rows.value.length} 条案例`)
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

h3 {
  margin: 0;
}
</style>
