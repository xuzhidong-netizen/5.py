<template>
  <div>
    <div class="toolbar">
      <h2>已入库案例</h2>
      <div class="actions">
        <el-input v-model="keyword" placeholder="搜索案例名称 / 接口名称 / 路径" clearable style="width: 280px" />
        <el-button type="warning" :disabled="selectedIds.length === 0" @click="batchCancelPublish">批量取消入库</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="batchDelete">批量删除</el-button>
        <el-button type="primary" @click="openCreate">新增案例</el-button>
      </div>
    </div>

    <el-table :data="filteredRows" stripe @selection-change="onSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="caseName" label="案例名称" min-width="180" />
      <el-table-column prop="apiName" label="接口名称" min-width="160" />
      <el-table-column prop="requestMethod" label="请求方式" width="100" />
      <el-table-column label="状态" width="100">
        <template #default>
          <el-tag type="success">已入库</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" width="180">
        <template #default="scope">{{ formatTime(scope.row.updatedAt) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="290">
        <template #default="scope">
          <el-button size="small" @click="openEdit(scope.row)">修改</el-button>
          <el-button size="small" type="danger" @click="remove(scope.row)">删除</el-button>
          <el-button size="small" type="warning" @click="cancelPublish(scope.row)">取消入库</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="editingId ? '修改已入库案例' : '新增已入库案例'" width="760px">
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
            <el-form-item label="请求地址"><el-input v-model="form.apiPath" /></el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="请求头(JSON)"><el-input v-model="form.requestHeaders" type="textarea" :rows="2" /></el-form-item>
        <el-form-item label="请求参数(JSON)"><el-input v-model="form.requestParams" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="预期结果"><el-input v-model="form.expectedResult" type="textarea" :rows="2" /></el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="校验方式"><el-input v-model="form.assertType" /></el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="返回码校验"><el-input-number v-model="form.expectedStatus" :min="100" :max="599" /></el-form-item>
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
import { publishedCaseApi } from '../api/platform'

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const rows = ref([])
const selectedIds = ref([])
const keyword = ref('')
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

function formatTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', { hour12: false })
}

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

function onSelectionChange(selection) {
  selectedIds.value = selection.map((item) => item.id)
}

async function load() {
  const response = await publishedCaseApi.list()
  rows.value = response.data
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

async function submit() {
  try {
    if (editingId.value) {
      await publishedCaseApi.update(editingId.value, toPayload())
      ElMessage.success('修改成功')
    } else {
      await publishedCaseApi.create(toPayload())
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    await load()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm('确认删除该已入库案例吗？删除后不可恢复。', '删除确认', {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消'
    })
    await publishedCaseApi.remove(row.id)
    ElMessage.success('删除成功')
    await load()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

async function cancelPublish(row) {
  try {
    await publishedCaseApi.cancelPublish(row.id)
    ElMessage.success('已取消入库，案例已退回待采纳')
    await load()
  } catch (error) {
    if (String(error.message).includes('是否继续')) {
      try {
        await ElMessageBox.confirm(error.message, '确认取消入库', {
          type: 'warning',
          confirmButtonText: '继续取消入库',
          cancelButtonText: '取消'
        })
        await publishedCaseApi.cancelPublish(row.id, { force: true })
        ElMessage.success('已取消入库，案例已退回待采纳')
        await load()
      } catch (confirmError) {
        if (confirmError !== 'cancel') {
          ElMessage.error(confirmError.message)
        }
      }
      return
    }
    ElMessage.error(error.message)
  }
}

async function batchDelete() {
  if (selectedIds.value.length === 0) return
  try {
    await ElMessageBox.confirm('确认删除选中的已入库案例吗？删除后不可恢复。', '批量删除确认', {
      type: 'warning'
    })
    const result = await publishedCaseApi.batchRemove({ ids: selectedIds.value })
    if (result.data.warnings?.length) {
      ElMessage.warning(`已删除 ${result.data.affectedCount} 条，部分跳过`)
    } else {
      ElMessage.success(`已删除 ${result.data.affectedCount} 条案例`)
    }
    selectedIds.value = []
    await load()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
}

async function batchCancelPublish() {
  if (selectedIds.value.length === 0) return
  try {
    const result = await publishedCaseApi.batchCancelPublish({ ids: selectedIds.value })
    if (result.data.warnings?.length) {
      const warningMessage = result.data.warnings.join('\n')
      if (warningMessage.includes('是否继续')) {
        await ElMessageBox.confirm(
          '选中案例中有已关联执行计划的记录。确认继续取消入库吗？',
          '批量取消入库确认',
          { type: 'warning' }
        )
        const forced = await publishedCaseApi.batchCancelPublish({ ids: selectedIds.value, force: true })
        ElMessage.success(`已取消入库 ${forced.data.affectedCount} 条`)
      } else {
        ElMessage.warning(`已取消入库 ${result.data.affectedCount} 条，部分跳过`)
      }
    } else {
      ElMessage.success(`已取消入库 ${result.data.affectedCount} 条`)
    }
    selectedIds.value = []
    await load()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message)
    }
  }
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
