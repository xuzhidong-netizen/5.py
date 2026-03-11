<template>
  <div class="login-wrap">
    <div class="hero">
      <h1>自动化测试平台 V2</h1>
      <p>前后端分离架构，支持 JWT 鉴权、模块化测试与执行中心。</p>
    </div>
    <el-card class="login-card" shadow="never">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="登录" name="login">
          <el-form :model="loginForm" label-position="top" @submit.prevent>
            <el-form-item label="用户名">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
            <el-button type="primary" :loading="submitting" @click="handleLogin">登录</el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form :model="registerForm" label-position="top" @submit.prevent>
            <el-form-item label="用户名">
              <el-input v-model="registerForm.username" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="registerForm.password" type="password" show-password />
            </el-form-item>
            <el-button type="success" :loading="submitting" @click="handleRegister">注册</el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const activeTab = ref('login')
const submitting = ref(false)
const loginForm = reactive({ username: 'admin', password: 'admin123' })
const registerForm = reactive({ username: '', password: '' })

const store = useStore()
const router = useRouter()

async function handleLogin() {
  submitting.value = true
  try {
    await store.dispatch('login', loginForm)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    submitting.value = false
  }
}

async function handleRegister() {
  submitting.value = true
  try {
    await store.dispatch('register', registerForm)
    ElMessage.success('注册成功，请登录')
    activeTab.value = 'login'
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.2fr 1fr;
}

.hero {
  padding: 100px 80px;
  background: linear-gradient(140deg, #0f766e 0%, #155e75 55%, #1d4ed8 100%);
  color: #e2f8f7;
}

.hero h1 {
  font-size: 42px;
  margin-bottom: 16px;
}

.hero p {
  font-size: 18px;
  max-width: 520px;
  line-height: 1.7;
}

.login-card {
  margin: auto;
  width: min(420px, 86%);
  border-radius: 14px;
}

@media (max-width: 960px) {
  .login-wrap {
    grid-template-columns: 1fr;
  }

  .hero {
    padding: 38px 24px;
  }
}
</style>
