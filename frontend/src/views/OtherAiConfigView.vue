<template>
  <div>
    <div class="toolbar">
      <h2>其他功能 · AI测试后台管理</h2>
      <el-button type="primary" @click="openCreate">新增配置</el-button>
    </div>

    <el-tabs v-model="activeType" @tab-change="loadRows">
      <el-tab-pane v-for="item in configTypes" :key="item.value" :name="item.value" :label="item.label" />
    </el-tabs>

    <el-table :data="rows" stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="配置名称" min-width="180" />
      <el-table-column prop="configKey" label="配置编码" min-width="160" />
      <el-table-column prop="scope" label="适用范围" min-width="160" />
      <el-table-column label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.enabled ? 'success' : 'info'">
            {{ scope.row.enabled ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="180">
        <template #default="scope">{{ formatTime(scope.row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="170">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑配置' : '新增配置'" width="760px">
      <el-form label-position="top" :model="form">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="配置名称"><el-input v-model="form.name" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="配置编码"><el-input v-model="form.configKey" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="适用范围"><el-input v-model="form.scope" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用"><el-switch v-model="form.enabled" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="配置内容(JSON或文本)">
          <el-input v-model="form.content" type="textarea" :rows="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { otherAiConfigApi } from '../api/platform'

const configTypes = [
  { label: '文档模板管理', value: 'TEMPLATE' },
  { label: '案例生成配置', value: 'CASE_GENERATION' },
  { label: '参数规则管理', value: 'PARAM_RULE' },
  { label: '执行策略管理', value: 'EXECUTE_STRATEGY' },
  { label: '结果清理策略', value: 'RESULT_CLEANUP' },
  { label: '模型配置管理', value: 'MODEL_CONFIG' }
]

const activeType = ref('TEMPLATE')
const loading = ref(false)
const saving = ref(false)
const rows = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)

const form = reactive({
  name: '',
  configKey: '',
  scope: '',
  content: '{}',
  enabled: true
})

function resetForm() {
  form.name = ''
  form.configKey = ''
  form.scope = ''
  form.content = '{}'
  form.enabled = true
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

async function loadRows() {
  try {
    loading.value = true
    const response = await otherAiConfigApi.list(activeType.value)
    rows.value = response.data || []
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  form.name = row.name
  form.configKey = row.configKey
  form.scope = row.scope
  form.content = row.content || '{}'
  form.enabled = !!row.enabled
  dialogVisible.value = true
}

async function submit() {
  const payload = {
    name: form.name,
    configKey: form.configKey,
    scope: form.scope,
    content: form.content,
    enabled: form.enabled
  }

  try {
    saving.value = true
    if (editingId.value) {
      await otherAiConfigApi.update(activeType.value, editingId.value, payload)
      ElMessage.success('配置更新成功')
    } else {
      await otherAiConfigApi.create(activeType.value, payload)
      ElMessage.success('配置新增成功')
    }
    dialogVisible.value = false
    await loadRows()
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确认删除配置「${row.name}」吗？`, '删除确认', { type: 'warning' })
    await otherAiConfigApi.remove(activeType.value, row.id)
    ElMessage.success('删除成功')
    await loadRows()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

onMounted(loadRows)
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
</style>
