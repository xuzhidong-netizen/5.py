<template>
  <div>
    <h2>AI测试 · 管理</h2>
    <el-alert
      type="info"
      :closable="false"
      title="该页面聚合待采纳与已入库案例管理能力，完成 AI 生成案例的人工复核与入库。"
      style="margin-bottom: 12px"
    />

    <el-tabs v-model="activeTab">
      <el-tab-pane label="待采纳案例" name="draft">
        <DraftCasesView />
      </el-tab-pane>
      <el-tab-pane label="已入库案例" name="published">
        <PublishedCasesView />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DraftCasesView from './DraftCasesView.vue'
import PublishedCasesView from './PublishedCasesView.vue'

const activeTab = ref('draft')
</script>
