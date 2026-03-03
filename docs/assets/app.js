const storageKey = "autotest-pages-data";
const apiBaseKey = "autotest-pages-api-base";

const suiteListEl = document.querySelector("#suiteList");
const caseListEl = document.querySelector("#caseList");
const runListEl = document.querySelector("#runList");
const statsEl = document.querySelector("#stats");
const suiteForm = document.querySelector("#suiteForm");
const caseForm = document.querySelector("#caseForm");
const suiteSelect = document.querySelector("#suiteSelect");
const apiBaseInput = document.querySelector("#apiBase");
const saveApiBaseButton = document.querySelector("#saveApiBase");

const defaultData = {
  suites: [
    {
      id: 1,
      name: "平台自检",
      description: "Pages 演示版默认套件",
      base_url: "https://example-api.internal",
    },
  ],
  cases: [
    {
      id: 1,
      suite_id: 1,
      name: "健康检查接口",
      method: "GET",
      path: "/health",
      expected_status: 200,
      assertions: [{ path: "status", operator: "eq", expected: "ok" }],
    },
  ],
  runs: [
    {
      id: 1,
      suite_id: 1,
      status: "passed",
      summary: "1 passed, 0 failed",
      triggered_by: "demo",
    },
  ],
};

let state = loadState();
let apiBase = localStorage.getItem(apiBaseKey) || "";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function renderStats() {
  const passedRuns = state.runs.filter((run) => run.status === "passed").length;
  const items = [
    ["测试套件", state.suites.length],
    ["测试用例", state.cases.length],
    ["执行记录", state.runs.length],
    ["成功执行", passedRuns],
    ["API 模式", apiBase ? "已连接" : "离线演示"],
  ];
  statsEl.innerHTML = items.map(([label, value]) => `
    <div class="stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");
}

function renderSuiteOptions() {
  suiteSelect.innerHTML = state.suites.map((suite) => `
    <option value="${suite.id}">${suite.name}</option>
  `).join("");
}

function renderSuites() {
  suiteListEl.innerHTML = state.suites.map((suite) => `
    <div class="item">
      <div class="item-head">
        <div>
          <h3>${suite.name}</h3>
          <p>${suite.description || "暂无描述"}</p>
        </div>
        <span class="pill info">ID ${suite.id}</span>
      </div>
      <div class="meta">
        <span>${suite.base_url}</span>
      </div>
    </div>
  `).join("");
}

function renderCases() {
  caseListEl.innerHTML = state.cases.map((testCase) => `
    <div class="item">
      <div class="item-head">
        <div>
          <h3>${testCase.name}</h3>
          <p>${testCase.method} ${testCase.path}</p>
        </div>
        <span class="pill info">${testCase.method}</span>
      </div>
      <div class="meta">
        <span>Suite: ${testCase.suite_id}</span>
        <span>状态码: ${testCase.expected_status}</span>
      </div>
    </div>
  `).join("");
}

function renderRuns() {
  runListEl.innerHTML = state.runs.map((run) => `
    <div class="item">
      <div class="item-head">
        <div>
          <h3>Run #${run.id}</h3>
          <p>${run.summary}</p>
        </div>
        <span class="pill ${run.status === "passed" ? "passed" : "failed"}">${run.status}</span>
      </div>
      <div class="meta">
        <span>Suite: ${run.suite_id}</span>
        <span>来源: ${run.triggered_by}</span>
      </div>
    </div>
  `).join("");
}

async function syncFromApi() {
  if (!apiBase) {
    return;
  }
  const [suites, runs] = await Promise.all([
    fetchJson(`${apiBase}/api/suites`),
    fetchJson(`${apiBase}/api/runs`),
  ]);
  const caseDetails = await Promise.all(
    suites.map((suite) => fetchJson(`${apiBase}/api/suites/${suite.id}`))
  );
  state = {
    suites,
    cases: caseDetails.flatMap((suite) => suite.cases.map((testCase) => ({
      id: testCase.id,
      suite_id: suite.id,
      name: testCase.name,
      method: testCase.method,
      path: testCase.path,
      expected_status: testCase.expected_status,
      assertions: testCase.expected_json_assertions,
    }))),
    runs: runs.map((run) => ({
      id: run.id,
      suite_id: run.suite_id,
      status: run.status,
      summary: run.summary || "待执行",
      triggered_by: run.triggered_by,
    })),
  };
  persist();
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  return response.json();
}

function rerender() {
  renderStats();
  renderSuiteOptions();
  renderSuites();
  renderCases();
  renderRuns();
}

suiteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(suiteForm);
  if (apiBase) {
    await fetch(`${apiBase}/api/suites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries())),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
    });
    await syncFromApi();
  } else {
    state.suites.push({
      id: Date.now(),
      name: String(formData.get("name")),
      base_url: String(formData.get("base_url")),
      description: String(formData.get("description") || ""),
    });
    persist();
  }
  suiteForm.reset();
  rerender();
});

caseForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(caseForm);
  const assertionsText = String(formData.get("assertions") || "").trim();
  const assertions = assertionsText ? JSON.parse(assertionsText) : [];
  const payload = {
    suite_id: Number(formData.get("suite_id")),
    name: String(formData.get("name")),
    description: "",
    method: String(formData.get("method")),
    path: String(formData.get("path")),
    headers: {},
    query_params: {},
    body: null,
    expected_status: Number(formData.get("expected_status")),
    expected_body_contains: null,
    expected_json_assertions: assertions,
    max_response_time_ms: null,
    enabled: true,
    sort_order: 0,
  };
  if (apiBase) {
    await fetch(`${apiBase}/api/cases`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
    });
    await syncFromApi();
  } else {
    state.cases.push({
      id: Date.now(),
      suite_id: payload.suite_id,
      name: payload.name,
      method: payload.method,
      path: payload.path,
      expected_status: payload.expected_status,
      assertions,
    });
    state.runs.unshift({
      id: Date.now() + 1,
      suite_id: payload.suite_id,
      status: "passed",
      summary: "Pages 离线演示记录已生成",
      triggered_by: "pages-demo",
    });
    persist();
  }
  caseForm.reset();
  rerender();
});

saveApiBaseButton.addEventListener("click", async () => {
  apiBase = apiBaseInput.value.trim().replace(/\/$/, "");
  localStorage.setItem(apiBaseKey, apiBase);
  if (apiBase) {
    await syncFromApi();
  } else {
    state = loadState();
  }
  rerender();
});

apiBaseInput.value = apiBase;
if (apiBase) {
  syncFromApi().then(() => rerender()).catch(() => rerender());
}
rerender();
