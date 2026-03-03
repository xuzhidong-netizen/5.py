const metricsEl = document.querySelector("#metrics");
const suiteListEl = document.querySelector("#suiteList");
const caseListEl = document.querySelector("#caseList");
const runListEl = document.querySelector("#runList");
const scheduleListEl = document.querySelector("#scheduleList");
const runDetailEl = document.querySelector("#runDetail");
const suiteForm = document.querySelector("#suiteForm");
const caseForm = document.querySelector("#caseForm");
const scheduleForm = document.querySelector("#scheduleForm");
const caseSuiteSelect = document.querySelector("#caseSuiteSelect");
const scheduleSuiteSelect = document.querySelector("#scheduleSuiteSelect");
const triggerTypeSelect = document.querySelector("#triggerTypeSelect");
const intervalInput = document.querySelector("#intervalInput");
const cronInput = document.querySelector("#cronInput");

let suites = [];
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

async function refreshAll() {
  await loadSuites();
  await Promise.all([loadDashboard(), loadSuiteDetail(), loadRuns(), loadSchedules()]);
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

refreshAll().catch((error) => {
  runDetailEl.textContent = error.message;
});
