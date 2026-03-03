const metricsEl = document.querySelector("#metrics");
const suiteListEl = document.querySelector("#suiteList");
const caseListEl = document.querySelector("#caseList");
const runListEl = document.querySelector("#runList");
const scheduleListEl = document.querySelector("#scheduleList");
const runDetailEl = document.querySelector("#runDetail");
const webRunDetailEl = document.querySelector("#webRunDetail");
const suiteForm = document.querySelector("#suiteForm");
const caseForm = document.querySelector("#caseForm");
const scheduleForm = document.querySelector("#scheduleForm");
const webProjectForm = document.querySelector("#webProjectForm");
const caseSuiteSelect = document.querySelector("#caseSuiteSelect");
const scheduleSuiteSelect = document.querySelector("#scheduleSuiteSelect");
const triggerTypeSelect = document.querySelector("#triggerTypeSelect");
const intervalInput = document.querySelector("#intervalInput");
const cronInput = document.querySelector("#cronInput");
const toolCatalogEl = document.querySelector("#toolCatalog");
const webProjectListEl = document.querySelector("#webProjectList");
const webRunListEl = document.querySelector("#webRunList");

let suites = [];
let webProjects = [];
let selectedSuiteId = null;

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || "请求失败");
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function parseMaybeJson(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function renderMetrics(data) {
  const items = [
    ["测试套件", data.suites],
    ["测试用例", data.cases],
    ["执行记录", data.runs],
    ["调度任务", data.schedules],
    ["Web 项目", data.web_projects],
    ["Web 执行", data.web_runs],
    ["通过率", `${data.pass_rate}%`],
  ];
  metricsEl.innerHTML = items
    .map(
      ([label, value]) => `
        <div class="metric-card">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `
    )
    .join("");
}

function renderToolCatalog(tools) {
  toolCatalogEl.innerHTML = tools
    .map(
      (tool) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>${tool.category_label}</h3>
              <p>${tool.summary}</p>
            </div>
            <span class="badge ${tool.installed ? "success" : "failed"}">${tool.installed ? "installed" : "missing"}</span>
          </div>
          <div class="meta">
            <span>工具：${tool.tool_name}</span>
            <span>安装：${tool.install_hint}</span>
          </div>
          <div class="actions">
            <a class="button secondary link-button" href="${tool.docs_url}" target="_blank" rel="noreferrer">官方文档</a>
          </div>
        </div>
      `
    )
    .join("");
}

function suiteOptionsMarkup() {
  if (!suites.length) {
    return `<option value="">暂无套件</option>`;
  }
  return suites
    .map(
      (suite) => `<option value="${suite.id}" ${suite.id === selectedSuiteId ? "selected" : ""}>${suite.name}</option>`
    )
    .join("");
}

function renderSuites() {
  caseSuiteSelect.innerHTML = suiteOptionsMarkup();
  scheduleSuiteSelect.innerHTML = suiteOptionsMarkup();
  suiteListEl.innerHTML = suites
    .map(
      (suite) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>${suite.name}</h3>
              <p>${suite.description || "暂无描述"}</p>
            </div>
            <span class="badge running">ID ${suite.id}</span>
          </div>
          <div class="meta">
            <span>${suite.base_url}</span>
          </div>
          <div class="actions">
            <button class="button secondary" data-action="select-suite" data-suite-id="${suite.id}">查看用例</button>
            <button class="button primary" data-action="run-suite" data-suite-id="${suite.id}">执行套件</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderCases(cases) {
  if (!cases.length) {
    caseListEl.innerHTML = `<div class="item"><p>当前套件还没有测试用例。</p></div>`;
    return;
  }
  caseListEl.innerHTML = cases
    .map(
      (item) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>${item.name}</h3>
              <p>${item.description || "暂无描述"}</p>
            </div>
            <span class="badge ${item.enabled ? "success" : "failed"}">${item.method}</span>
          </div>
          <div class="meta">
            <span>Path: ${item.path}</span>
            <span>状态码: ${item.expected_status}</span>
            <span>超时: ${item.max_response_time_ms || "-"} ms</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderRuns(runs) {
  runListEl.innerHTML = runs
    .map(
      (run) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>Run #${run.id}</h3>
              <p>${run.summary || "等待执行"}</p>
            </div>
            <span class="badge ${run.status}">${run.status}</span>
          </div>
          <div class="meta">
            <span>Suite: ${run.suite_id}</span>
            <span>通过: ${run.passed_cases}/${run.total_cases}</span>
            <span>触发方式: ${run.triggered_by}</span>
          </div>
          <div class="actions">
            <button class="button secondary" data-action="view-run" data-run-id="${run.id}">查看详情</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderSchedules(schedules) {
  if (!schedules.length) {
    scheduleListEl.innerHTML = `<div class="item"><p>暂无调度任务。</p></div>`;
    return;
  }
  scheduleListEl.innerHTML = schedules
    .map(
      (item) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>${item.name}</h3>
              <p>${item.trigger_type === "interval" ? `每 ${item.interval_minutes} 分钟执行` : item.cron_expression}</p>
            </div>
            <span class="badge ${item.enabled ? "success" : "failed"}">${item.enabled ? "enabled" : "disabled"}</span>
          </div>
          <div class="meta">
            <span>Suite: ${item.suite_id}</span>
            <span>最近执行: ${item.last_run_at || "-"}</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderWebProjects() {
  if (!webProjects.length) {
    webProjectListEl.innerHTML = `<div class="item"><p>暂无 Web 金融测试项目。</p></div>`;
    return;
  }
  webProjectListEl.innerHTML = webProjects
    .map(
      (project) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>${project.name}</h3>
              <p>${project.description || "金融 Web 多类型测试编排项目"}</p>
            </div>
            <span class="badge running">${project.enabled_categories.length} 类</span>
          </div>
          <div class="meta">
            <span>目标：${project.target_url}</span>
            <span>代码目录：${project.workspace_path || "未配置"}</span>
            <span>路径数：${Object.keys(project.finance_paths || {}).length}</span>
            <span>脚手架：${project.scaffold_path}</span>
          </div>
          <div class="actions actions-wrap">
            <button class="button secondary" data-action="scaffold-web" data-project-id="${project.id}">生成脚手架</button>
            <button class="button primary" data-action="run-web-all" data-project-id="${project.id}">全量执行</button>
            <button class="button secondary" data-action="run-web-kind" data-kind="unit" data-project-id="${project.id}">单元</button>
            <button class="button secondary" data-action="run-web-kind" data-kind="integration" data-project-id="${project.id}">集成</button>
            <button class="button secondary" data-action="run-web-kind" data-kind="functional" data-project-id="${project.id}">功能</button>
            <button class="button secondary" data-action="run-web-kind" data-kind="stability" data-project-id="${project.id}">稳定性</button>
            <button class="button secondary" data-action="run-web-kind" data-kind="security" data-project-id="${project.id}">安全</button>
          </div>
        </div>
      `
    )
    .join("");
}

function renderWebRuns(runs) {
  if (!runs.length) {
    webRunListEl.innerHTML = `<div class="item"><p>暂无 Web 测试执行记录。</p></div>`;
    return;
  }
  webRunListEl.innerHTML = runs
    .map(
      (run) => `
        <div class="item">
          <div class="item-head">
            <div>
              <h3>Web Run #${run.id}</h3>
              <p>${run.summary || "等待执行"}</p>
            </div>
            <span class="badge ${run.status}">${run.status}</span>
          </div>
          <div class="meta">
            <span>项目：${run.project_id}</span>
            <span>通过：${run.passed_categories}/${run.total_categories}</span>
            <span>触发方式：${run.triggered_by}</span>
          </div>
          <div class="actions">
            <button class="button secondary" data-action="view-web-run" data-run-id="${run.id}">查看详情</button>
          </div>
        </div>
      `
    )
    .join("");
}

async function loadDashboard() {
  const data = await api("/api/dashboard");
  renderMetrics(data);
}

async function loadSuites() {
  suites = await api("/api/suites");
  if (!selectedSuiteId && suites.length) {
    selectedSuiteId = suites[0].id;
  }
  renderSuites();
}

async function loadSuiteDetail() {
  if (!selectedSuiteId) {
    renderCases([]);
    return;
  }
  const suite = await api(`/api/suites/${selectedSuiteId}`);
  renderCases(suite.cases);
}

async function loadRuns() {
  const runs = await api("/api/runs");
  renderRuns(runs);
}

async function loadSchedules() {
  const schedules = await api("/api/schedules");
  renderSchedules(schedules);
}

async function loadToolCatalog() {
  const tools = await api("/api/tool-catalog");
  renderToolCatalog(tools);
}

async function loadWebProjects() {
  webProjects = await api("/api/web-projects");
  renderWebProjects();
}

async function loadWebRuns() {
  const runs = await api("/api/web-runs");
  renderWebRuns(runs);
}

async function refreshAll() {
  await loadSuites();
  await Promise.all([
    loadDashboard(),
    loadSuiteDetail(),
    loadRuns(),
    loadSchedules(),
    loadToolCatalog(),
    loadWebProjects(),
    loadWebRuns(),
  ]);
}

suiteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(suiteForm);
  await api("/api/suites", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData.entries())),
  });
  suiteForm.reset();
  await refreshAll();
});

caseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(caseForm);
  const payload = {
    suite_id: Number(formData.get("suite_id")),
    name: formData.get("name"),
    description: "",
    method: formData.get("method"),
    path: formData.get("path"),
    headers: parseMaybeJson(formData.get("headers")) || {},
    query_params: parseMaybeJson(formData.get("query_params")) || {},
    body: parseMaybeJson(formData.get("body")),
    expected_status: Number(formData.get("expected_status") || 200),
    expected_body_contains: formData.get("expected_body_contains") || null,
    expected_json_assertions: parseMaybeJson(formData.get("expected_json_assertions")) || [],
    max_response_time_ms: formData.get("max_response_time_ms")
      ? Number(formData.get("max_response_time_ms"))
      : null,
    enabled: true,
    sort_order: 0,
  };
  await api("/api/cases", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  selectedSuiteId = payload.suite_id;
  caseForm.reset();
  await refreshAll();
});

scheduleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(scheduleForm);
  const payload = {
    suite_id: Number(formData.get("suite_id")),
    name: formData.get("name"),
    trigger_type: formData.get("trigger_type"),
    interval_minutes: formData.get("interval_minutes")
      ? Number(formData.get("interval_minutes"))
      : null,
    cron_expression: formData.get("cron_expression") || null,
    enabled: true,
  };
  await api("/api/schedules", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  scheduleForm.reset();
  intervalInput.disabled = false;
  cronInput.disabled = true;
  await refreshAll();
});

webProjectForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(webProjectForm);
  const payload = {
    name: formData.get("name"),
    description: "",
    target_url: formData.get("target_url"),
    workspace_path: formData.get("workspace_path") || null,
    finance_paths: parseMaybeJson(formData.get("finance_paths")) || {
      login: "/login",
      quotes: "/quotes",
      portfolio: "/portfolio",
      trade: "/trade",
      transfer: "/transfer",
      statements: "/statements",
    },
    selector_assertions: parseMaybeJson(formData.get("selector_assertions")) || {},
    enabled_categories: ["unit", "integration", "functional", "stability", "security"],
    virtual_users: Number(formData.get("virtual_users") || 20),
    spawn_rate: Number(formData.get("spawn_rate") || 4),
    duration: formData.get("duration") || "2m",
  };
  await api("/api/web-projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  webProjectForm.reset();
  await refreshAll();
});

document.querySelector("#refreshDashboard").addEventListener("click", refreshAll);

triggerTypeSelect.addEventListener("change", () => {
  const isInterval = triggerTypeSelect.value === "interval";
  intervalInput.disabled = !isInterval;
  cronInput.disabled = isInterval;
});

suiteListEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const suiteId = Number(button.dataset.suiteId);
  if (button.dataset.action === "select-suite") {
    selectedSuiteId = suiteId;
    renderSuites();
    await loadSuiteDetail();
  }

  if (button.dataset.action === "run-suite") {
    await api(`/api/runs/suite/${suiteId}`, { method: "POST" });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await refreshAll();
  }
});

runListEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button || button.dataset.action !== "view-run") {
    return;
  }
  const runId = Number(button.dataset.runId);
  const data = await api(`/api/runs/${runId}`);
  runDetailEl.textContent = JSON.stringify(data, null, 2);
});

webProjectListEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const projectId = Number(button.dataset.projectId);
  if (button.dataset.action === "scaffold-web") {
    const data = await api(`/api/web-projects/${projectId}/scaffold`, { method: "POST" });
    webRunDetailEl.textContent = JSON.stringify(data, null, 2);
    await refreshAll();
    return;
  }

  if (button.dataset.action === "run-web-all") {
    await api(`/api/web-runs/project/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ categories: [] }),
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await refreshAll();
    return;
  }

  if (button.dataset.action === "run-web-kind") {
    await api(`/api/web-runs/project/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ categories: [button.dataset.kind] }),
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await refreshAll();
  }
});

webRunListEl.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button || button.dataset.action !== "view-web-run") {
    return;
  }
  const runId = Number(button.dataset.runId);
  const data = await api(`/api/web-runs/${runId}`);
  webRunDetailEl.textContent = JSON.stringify(data, null, 2);
});

refreshAll().catch((error) => {
  runDetailEl.textContent = error.message;
  webRunDetailEl.textContent = error.message;
});
