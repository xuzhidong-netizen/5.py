<template>
  <div>
    <h2>AI测试 · 文档</h2>
    <el-row :gutter="16">
      <el-col :xs="24" :md="12">
        <el-card>
          <el-form label-position="top" :model="form">
            <el-form-item label="接口名称"><el-input v-model="form.apiName" /></el-form-item>
            <el-form-item label="接口路径"><el-input v-model="form.apiPath" /></el-form-item>
            <el-form-item label="请求方法"><el-input v-model="form.method" /></el-form-item>
            <el-form-item label="请求Schema(JSON)">
              <el-input v-model="form.requestSchema" type="textarea" :rows="5" />
            </el-form-item>
            <el-form-item label="响应Schema(JSON)">
              <el-input v-model="form.responseSchema" type="textarea" :rows="5" />
            </el-form-item>
            <el-button type="primary" :loading="loading" @click="generate">生成文档</el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card>
          <div class="result-header">
            <h3>生成结果</h3>
            <el-tag v-if="result.aiEngine" type="success">引擎: {{ result.aiEngine }}</el-tag>
          </div>
          <el-form label-position="top">
            <el-form-item label="Markdown 文档">
              <el-input :model-value="result.markdown" type="textarea" :rows="10" readonly />
            </el-form-item>
            <el-form-item label="OpenAPI 片段">
              <el-input :model-value="result.openapi" type="textarea" :rows="8" readonly />
            </el-form-item>
          </el-form>
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
const form = reactive({
  apiName: '下单接口',
  apiPath: '/api/order/create',
  method: 'POST',
  requestSchema: '{"type":"object","properties":{"amount":{"type":"number"}}}',
  responseSchema: '{"type":"object","properties":{"success":{"type":"boolean"}}}'
})

const result = reactive({
  markdown: '',
  openapi: '',
  aiEngine: ''
})

async function generate() {
  try {
    loading.value = true
    const response = await aiApi.generateDocs(form)
    result.markdown = response.data.markdown || ''
    result.openapi = response.data.openapi || ''
    result.aiEngine = response.data.aiEngine || ''
    ElMessage.success('文档生成完成')
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
