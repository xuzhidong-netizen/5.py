<template>
  <div>
    <h2>系统管理</h2>
    <el-row :gutter="12">
      <el-col :xs="24" :md="12">
        <el-card>
          <h3>当前登录信息</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户ID">{{ profile?.id || '-' }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ profile?.username || '-' }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ profile?.role || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card>
          <h3>系统说明</h3>
          <ul class="tips">
            <li>AI测试菜单面向业务操作（文档、案例、管理、执行、结果）。</li>
            <li>其他功能菜单面向平台管理（配置、报表、日志）。</li>
            <li>系统管理页保留用户和权限扩展入口。</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const profile = computed(() => store.state.profile)
</script>

<style scoped>
.tips {
  margin: 0;
  padding-left: 18px;
  line-height: 1.8;
}
</style>
