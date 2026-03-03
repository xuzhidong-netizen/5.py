# 自动化测试平台

一个可直接运行的自动化测试平台，内置：

- 测试套件管理
- HTTP 接口测试用例管理
- 断言配置（状态码、响应内容、JSON 路径断言、耗时）
- 手动执行与执行历史
- 定时调度执行
- 可视化控制台
- Docker 部署
- GitHub Actions 持续集成
- GitHub Pages 静态演示版
- GHCR 镜像自动发布
- Render / Railway 云端部署配置

## 技术栈

- 后端：FastAPI
- 存储：SQLite + SQLAlchemy
- 调度：APScheduler
- 前端：内置静态控制台（HTML/CSS/Vanilla JS）

## 启动

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
uvicorn app.main:app --reload
```

打开 [http://127.0.0.1:8000](http://127.0.0.1:8000)。

## Docker

```bash
docker compose up --build
```

默认数据文件会持久化到 `./data/autotest.db`。

## 发布

### GitHub Actions

仓库已内置三个工作流：

- `CI`: 运行测试
- `Pages`: 将 `docs/` 发布到 `5.py` 自己的 GitHub Pages
- `Docker Publish`: 将镜像发布到 `ghcr.io/xuzhidong-netizen/autotest-platform`

### GitHub Pages

静态版源码位于 `docs/`，适合展示平台 UI，也支持连接真实 API。

建议在 GitHub 仓库设置中将 Pages Source 设为 `GitHub Actions`。

如果静态站要连接云端后端，请在后端环境变量中配置 `CORS_ORIGINS`。

### 云端部署

仓库内已包含：

- `Dockerfile`
- `docker-compose.yml`
- `render.yaml`
- `railway.json`

如果你配置了仓库 Secrets：

- `RENDER_API_KEY`
- `RENDER_SERVICE_ID`

则 `Render Deploy` 工作流会在推送到 `main` 后自动触发部署。

## 核心能力

### 1. 测试套件

每个套件支持独立 `Base URL`，可维护多条测试用例。

### 2. 测试用例

每个用例支持配置：

- HTTP Method
- 路径
- Header / Query / Body
- 期望状态码
- 期望响应包含文本
- JSON 断言列表
- 最大响应时间

JSON 断言格式示例：

```json
[
  {"path": "data.user.id", "operator": "eq", "expected": 1},
  {"path": "success", "operator": "eq", "expected": true}
]
```

支持的操作符：

- `eq`
- `ne`
- `contains`
- `gt`
- `gte`
- `lt`
- `lte`

### 3. 定时调度

支持两种调度模式：

- 按分钟间隔执行
- Cron 表达式执行

### 4. 执行历史

平台会记录：

- 套件执行状态
- 每条用例的请求信息
- 响应状态
- 耗时
- 失败原因

## API 概览

- `GET /api/dashboard`
- `GET /api/suites`
- `POST /api/suites`
- `GET /api/suites/{suite_id}`
- `POST /api/cases`
- `PUT /api/cases/{case_id}`
- `POST /api/runs/suite/{suite_id}`
- `GET /api/runs`
- `GET /api/runs/{run_id}`
- `GET /api/schedules`
- `POST /api/schedules`
- `PUT /api/schedules/{schedule_id}`

## 默认演示数据

首次启动时会自动写入一个“平台自检”演示套件，默认请求 `http://127.0.0.1:8000/health`。因此建议按默认 `8000` 端口启动。可以通过环境变量关闭：

```bash
AUTO_SEED_DEMO=false
```

## 测试

```bash
pytest
```
