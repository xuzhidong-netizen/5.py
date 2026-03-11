<template>
  <div>
    <div class="toolbar">
      <h2>待采纳案例</h2>
      <div class="actions">
        <el-input v-model="keyword" placeholder="搜索案例名称 / 接口路径" clearable style="width: 240px" />
        <el-button type="success" :disabled="selectedIds.length === 0" @click="batchPublish">批量采纳入库</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="batchDelete">批量删除</el-button>
        <el-button type="primary" @click="openCreate">新增草稿</el-button>
      </div>
    </div>

    <el-table :data="filteredRows" stripe @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="caseName" label="案例名称" min-width="180" />
      <el-table-column prop="apiName" label="接口名称" min-width="160" />
      <el-table-column prop="apiPath" label="接口路径" min-width="180" />
      <el-table-column prop="requestMethod" label="请求方式" width="110" />
      <el-table-column label="状态" width="100">
        <template #default>
          <el-tag type="info">待采纳</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template #default="scope">{{ formatTime(scope.row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="270">
        <template #default="scope">
          <el-button size="small" type="success" @click="publish(scope.row)">采纳入库</el-button>
          <el-button size="small" @click="openEdit(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑待采纳案例' : '新增待采纳案例'" width="760px">
      <el-form label-position="top" :model="form">
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="案例名称"><el-input v-model="form.caseName" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接口名称"><el-input v-model="form.apiName" /></el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="请求方式">
              <el-select v-model="form.requestMethod" style="width: 100%">
                <el-option v-for="item in methods" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="接口路径"><el-input v-model="form.apiPath" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="请求头(JSON)"><el-input v-model="form.requestHeaders" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="请求参数(JSON)"><el-input v-model="form.requestParams" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="预期结果"><el-input v-model="form.expectedResult" type="textarea" :rows="2" /></el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="校验方式"><el-input v-model="form.assertType" placeholder="如 status_code / json_path" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="期望状态码"><el-input-number v-model="form.expectedStatus" :min="100" :max="599" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { draftCaseApi } from '../api/platform'

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const rows = ref([])
const keyword = ref('')
const selectedIds = ref([])
const dialogVisible = ref(false)
const editingId = ref(null)

const form = reactive({
  caseName: '',
  apiName: '',
  apiPath: '/api/demo',
  requestMethod: 'POST',
  requestHeaders: '{}',
  requestParams: '{}',
  expectedResult: 'HTTP 200 and success=true',
  assertType: 'status_code',
  remark: '',
  expectedStatus: 200,
  enabled: true
})

const filteredRows = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  if (!text) return rows.value
  return rows.value.filter((item) => {
    return [item.caseName, item.apiName, item.apiPath]
      .map((val) => String(val || '').toLowerCase())
      .join('|')
      .includes(text)
  })
})

function resetForm() {
  Object.assign(form, {
    caseName: '',
    apiName: '',
    apiPath: '/api/demo',
    requestMethod: 'POST',
    requestHeaders: '{}',
    requestParams: '{}',
    expectedResult: 'HTTP 200 and success=true',
    assertType: 'status_code',
    remark: '',
    expectedStatus: 200,
    enabled: true
  })
}

function toPayload() {
  return {
    caseName: form.caseName,
    apiName: form.apiName,
    apiPath: form.apiPath,
    requestMethod: form.requestMethod,
    requestHeaders: form.requestHeaders,
    requestParams: form.requestParams,
    expectedResult: form.expectedResult,
    assertType: form.assertType,
    remark: form.remark,
    expectedStatus: form.expectedStatus,
    enabled: true
  }
}

function openCreate() {
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

function openEdit(row) {
  editingId.value = row.id
  Object.assign(form, {
    caseName: row.caseName,
    apiName: row.apiName,
    apiPath: row.apiPath,
    requestMethod: row.requestMethod,
    requestHeaders: row.requestHeaders || '{}',
    requestParams: row.requestParams || '{}',
    expectedResult: row.expectedResult || '',
    assertType: row.assertType || '',
    remark: row.remark || '',
    expectedStatus: row.expectedStatus || 200,
    enabled: true
  })
  dialogVisible.value = true
}

function onSelectionChange(selection) {
  selectedIds.value = selection.map((item) => item.id)
}

async function load() {
  const response = await draftCaseApi.list()
  rows.value = response.data
}

async function submit() {
  try {
    if (editingId.value) {
      await draftCaseApi.update(editingId.value, toPayload())
      ElMessage.success('草稿已更新')
    } else {
      await draftCaseApi.create(toPayload())
      ElMessage.success('草稿已创建')
    }
    dialogVisible.value = false
    await load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function publish(row) {
  try {
    await draftCaseApi.publish(row.id)
    ElMessage.success('采纳入库成功')
    await load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function batchPublish() {
  if (selectedIds.value.length === 0) return
  try {
    for (const id of selectedIds.value) {
      await draftCaseApi.publish(id)
    }
    ElMessage.success(`已采纳 ${selectedIds.value.length} 条案例`)
    selectedIds.value = []
    await load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm('确认删除该待采纳案例吗？', '提示', { type: 'warning' })
    await draftCaseApi.remove(row.id)
    ElMessage.success('删除成功')
    await load()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

async function batchDelete() {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm('确认删除选中的待采纳案例吗？', '提示', { type: 'warning' })
    for (const id of selectedIds.value) {
      await draftCaseApi.remove(id)
    }
    ElMessage.success(`已删除 ${selectedIds.value.length} 条案例`)
    selectedIds.value = []
    await load()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

onMounted(async () => {
  try {
    await load()
  } catch (error) {
    ElMessage.error(error.message)
  }
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
