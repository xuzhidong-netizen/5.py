# 自动化测试平台 V2（Spring Boot + Vue）

本仓库已重构为前后端分离架构：

- 前端：`frontend`（Vue 3 + Vue Router + Vuex + Axios + Element Plus）
- 后端：`backend`（Spring Boot 3 + Spring Security + JWT + JPA + Swagger）
- 数据库：MySQL（默认）

线上地址（当前 Pages 演示）：[https://xuzhidong-netizen.github.io/5.py/](https://xuzhidong-netizen.github.io/5.py/)

## 1. 重构目标

- 架构解耦：前后端独立开发、独立部署
- 模块化：按业务模块拆分后端代码，提升可维护性
- 安全性：引入 JWT 认证与权限控制
- 测试闭环：补齐后端集成测试与前端单元测试基线

## 2. 目录结构

```text
.
├── backend/                     # Spring Boot API 服务
│   ├── src/main/java/com/autotest/platform
│   │   ├── auth/               # 注册、登录、JWT、用户
│   │   ├── casecenter/         # 测试用例管理
│   │   ├── execution/          # 执行中心
│   │   ├── dashboard/          # 概览统计
│   │   ├── aitest/             # AI 文档/用例生成（模块化入口）
│   │   ├── config/             # Security、OpenAPI、初始化
│   │   └── common/             # 公共响应与异常处理
│   └── src/test/               # Spring Boot 集成测试
├── frontend/                    # Vue 前端
│   ├── src/api                 # Axios API 封装
│   ├── src/store               # Vuex 全局状态
│   ├── src/router              # 路由与权限守卫
│   ├── src/views               # 业务页面
│   └── tests/                  # 前端测试
├── docker-compose.yml          # 前后端分离 + MySQL + Redis
└── ...                         # legacy 目录（旧实现保留）
```

## 3. 本地启动

### 3.1 启动后端

```bash
cd backend
mvn spring-boot:run
```

默认地址：`http://localhost:8080`

Swagger：`http://localhost:8080/swagger-ui/index.html`

默认种子管理员：

- 用户名：`admin`
- 密码：`admin123`

### 3.2 启动前端

```bash
cd frontend
npm install
npm run dev
```

默认地址：`http://localhost:5173`

## 4. 容器化部署

```bash
docker compose up --build
```

服务端口：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:8080`
- MySQL：`localhost:3306`
- Redis：`localhost:6379`

## 5. 核心 API（V2）

- 认证：
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/auth/me`
- 概览：
  - `GET /api/v1/dashboard`
- 用例管理：
  - `GET /api/v1/cases`
  - `POST /api/v1/cases`
  - `PUT /api/v1/cases/{id}`
  - `DELETE /api/v1/cases/{id}`
- 执行中心：
  - `POST /api/v1/executions`
  - `GET /api/v1/executions`
  - `GET /api/v1/executions/{runId}`
- AI 模块：
  - `POST /api/v1/ai/generate-docs`
  - `POST /api/v1/ai/generate-cases`

## 6. 测试

后端：

```bash
cd backend
mvn test
```

前端：

```bash
cd frontend
npm test
```

## 7. 优化建议（下一阶段）

1. 引入 Redis 缓存热点概览与执行结果。
2. 为执行中心增加异步任务队列（如 Spring @Async / MQ）。
3. 增加接口压测流水线（JMeter/Gatling）并纳入 CI。
4. 将 AI 模块接入真实 LLM Provider，并增加审计日志。

## 8. 兼容说明

旧实现（Python FastAPI、旧 Java 页面、`docs` 静态页）仍在仓库中，已标记为 legacy 参考，不作为 V2 主运行路径。
