<template>
  <el-card shadow="never">
    <h3>{{ title }}</h3>

    <el-descriptions v-if="primitiveEntries.length" :column="2" border>
      <el-descriptions-item v-for="item in primitiveEntries" :key="item[0]" :label="item[0]">
        {{ item[1] === null ? '-' : item[1] }}
      </el-descriptions-item>
    </el-descriptions>
    <el-empty v-else description="暂无基础指标" />

    <div v-for="item in objectEntries" :key="item[0]" class="section-block">
      <h4>{{ item[0] }}</h4>
      <pre class="json-block">{{ JSON.stringify(item[1], null, 2) }}</pre>
    </div>

    <div v-for="item in listEntries" :key="item[0]" class="section-block">
      <h4>{{ item[0] }}</h4>
      <pre class="json-block">{{ JSON.stringify(item[1], null, 2) }}</pre>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  payload: {
    type: Object,
    required: true
  }
})

const primitiveEntries = computed(() => {
  return Object.entries(props.payload || {}).filter(([, value]) => {
    return ['string', 'number', 'boolean'].includes(typeof value) || value === null
  })
})

const objectEntries = computed(() => {
  return Object.entries(props.payload || {}).filter(([, value]) => {
    return value && typeof value === 'object' && !Array.isArray(value)
  })
})

const listEntries = computed(() => {
  return Object.entries(props.payload || {}).filter(([, value]) => Array.isArray(value))
})
</script>

<style scoped>
h3 {
  margin: 0 0 10px;
}

.section-block {
  margin-top: 12px;
}

.section-block h4 {
  margin: 0 0 8px;
}

.json-block {
  margin: 0;
  background: #f5f7fa;
  padding: 10px;
  border-radius: 8px;
  overflow: auto;
}
</style>
