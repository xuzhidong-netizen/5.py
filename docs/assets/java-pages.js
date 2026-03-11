const storageKey = "java-pages-platform-state-v2";
const aiInterfaceCaseTag = "[AI_INTERFACE_CASE]";

const menu = document.getElementById("menu");
const panels = Array.from(document.querySelectorAll(".panel"));
const flowSteps = Array.from(document.querySelectorAll(".flow-step"));

const summaryCards = document.getElementById("summaryCards");
const functionTableBody = document.querySelector("#functionTable tbody");
const caseTableBody = document.querySelector("#caseTable tbody");
const executionTableBody = document.querySelector("#executionTable tbody");

const functionForm = document.getElementById("functionForm");
const caseForm = document.getElementById("caseForm");
const agentRunForm = document.getElementById("agentRunForm");
const queryStatusForm = document.getElementById("queryStatusForm");
const queryResultForm = document.getElementById("queryResultForm");
const devopsBatchForm = document.getElementById("devopsBatchForm");
const queryDevopsByIdForm = document.getElementById("queryDevopsByIdForm");
const busForm = document.getElementById("busForm");

const loadVersionsBtn = document.getElementById("loadVersionsBtn");
const loadFunctionLookupBtn = document.getElementById("loadFunctionLookupBtn");
const authBtn = document.getElementById("authBtn");
const latestDevopsStatusBtn = document.getElementById("latestDevopsStatusBtn");
const latestDevopsResultBtn = document.getElementById("latestDevopsResultBtn");

const functionMessage = document.getElementById("functionMessage");
const caseMessage = document.getElementById("caseMessage");
const versionResult = document.getElementById("versionResult");
const functionLookupResult = document.getElementById("functionLookupResult");
const executionOutput = document.getElementById("executionOutput");

const aiInterfaceFile = document.getElementById("aiInterfaceFile");
const aiInterfaceText = document.getElementById("aiInterfaceText");
const aiInterfaceGenerateBtn = document.getElementById("aiInterfaceGenerateBtn");
const aiInterfaceSelectAllBtn = document.getElementById("aiInterfaceSelectAllBtn");
const aiInterfaceSaveRunBtn = document.getElementById("aiInterfaceSaveRunBtn");
const aiInterfaceDeleteBtn = document.getElementById("aiInterfaceDeleteBtn");
const aiInterfaceRegenerateBtn = document.getElementById("aiInterfaceRegenerateBtn");
const aiInterfaceReloadBtn = document.getElementById("aiInterfaceReloadBtn");
const aiInterfaceFilterKeyword = document.getElementById("aiInterfaceFilterKeyword");
const aiInterfaceFilterStatus = document.getElementById("aiInterfaceFilterStatus");
const aiInterfaceStats = document.getElementById("aiInterfaceStats");
const aiInterfaceGenerateCount = document.getElementById("aiInterfaceGenerateCount");
const aiCaseTypeNormal = document.getElementById("aiCaseTypeNormal");
const aiCaseTypeAbnormal = document.getElementById("aiCaseTypeAbnormal");
const aiCaseTypeBoundary = document.getElementById("aiCaseTypeBoundary");
const aiGeneratedTempTableBody = document.querySelector("#aiGeneratedTempTable tbody");
const aiInterfaceTableBody = document.querySelector("#aiInterfaceTable tbody");
const aiInterfaceSaveTableBody = document.querySelector("#aiInterfaceSaveTable tbody");
const aiInterfaceExecutionTableBody = document.querySelector("#aiInterfaceExecutionTable tbody");
const aiInterfaceMessage = document.getElementById("aiInterfaceMessage");
const aiInterfaceGenerationStatus = document.getElementById("aiInterfaceGenerationStatus");
const aiPreCaseMessage = document.getElementById("aiPreCaseMessage");
const aiPublishedSelectAllBtn = document.getElementById("aiPublishedSelectAllBtn");
const aiPublishedDeleteBtn = document.getElementById("aiPublishedDeleteBtn");
const aiPublishedCancelBtn = document.getElementById("aiPublishedCancelBtn");
const aiPublishedReloadBtn = document.getElementById("aiPublishedReloadBtn");
const aiPublishedCreateBtn = document.getElementById("aiPublishedCreateBtn");
const aiPublishedFilterKeyword = document.getElementById("aiPublishedFilterKeyword");
const aiPublishedStats = document.getElementById("aiPublishedStats");
const aiPublishedTableBody = document.querySelector("#aiPublishedTable tbody");
const aiPublishedMessage = document.getElementById("aiPublishedMessage");
const aiCaseManageTabs = document.getElementById("aiCaseManageTabs");
const aiManageTabButtons = Array.from(document.querySelectorAll("#aiCaseManageTabs .tab-btn"));
const aiManageTabPanels = Array.from(document.querySelectorAll(".case-manage-panel"));

const aiDocModeTabs = document.getElementById("aiDocModeTabs");
const aiDocTabButtons = Array.from(document.querySelectorAll("#aiDocModeTabs .tab-btn"));
const aiDocTabPanels = Array.from(document.querySelectorAll("#aiDocs .tab-panel"));
const aiDocForm = document.getElementById("aiDocForm");
const aiDocImportFile = document.getElementById("aiDocImportFile");
const aiDocImportText = document.getElementById("aiDocImportText");
const aiDocImportGenerateBtn = document.getElementById("aiDocImportGenerateBtn");
const aiDocDownloadTemplateBtn = document.getElementById("aiDocDownloadTemplateBtn");
const aiDocExportExcelBtn = document.getElementById("aiDocExportExcelBtn");
const aiDocImportExportExcelBtn = document.getElementById("aiDocImportExportExcelBtn");
const aiDocMessage = document.getElementById("aiDocMessage");
const aiDocInfoName = document.getElementById("aiDocInfoName");
const aiDocInfoPath = document.getElementById("aiDocInfoPath");
const aiDocInfoMethod = document.getElementById("aiDocInfoMethod");
const aiDocInfoEngine = document.getElementById("aiDocInfoEngine");
const aiDocRequestTableBody = document.querySelector("#aiDocRequestTable tbody");
const aiDocResponseTableBody = document.querySelector("#aiDocResponseTable tbody");
const aiDocImportTableBody = document.querySelector("#aiDocImportTable tbody");

const aiCaseForm = document.getElementById("aiCaseForm");
const aiCaseImportFile = document.getElementById("aiCaseImportFile");
const aiCaseImportText = document.getElementById("aiCaseImportText");
const aiCaseImportGenerateBtn = document.getElementById("aiCaseImportGenerateBtn");
const aiCaseMessage = document.getElementById("aiCaseMessage");
const aiCaseOutput = document.getElementById("aiCaseOutput");
const aiCaseTableBody = document.querySelector("#aiCaseTable tbody");

const aiSelectAllCasesBtn = document.getElementById("aiSelectAllCasesBtn");
const aiExecuteCasesBtn = document.getElementById("aiExecuteCasesBtn");
const aiExecuteModeSerial = document.getElementById("aiExecuteModeSerial");
const aiExecuteModeParallel = document.getElementById("aiExecuteModeParallel");
const aiExecuteMessage = document.getElementById("aiExecuteMessage");
const aiExecuteOutput = document.getElementById("aiExecuteOutput");
const aiExecuteTotal = document.getElementById("aiExecuteTotal");
const aiExecuteSuccess = document.getElementById("aiExecuteSuccess");
const aiExecuteFailed = document.getElementById("aiExecuteFailed");
const aiExecuteProgressValue = document.getElementById("aiExecuteProgressValue");
const aiExecuteRunSummary = document.getElementById("aiExecuteRunSummary");
const aiExecuteResultTableBody = document.querySelector("#aiExecuteResultTable tbody");

const aiResultQueryForm = document.getElementById("aiResultQueryForm");
const aiResultStatusFilter = document.getElementById("aiResultStatusFilter");
const aiLoadLatestResultsBtn = document.getElementById("aiLoadLatestResultsBtn");
const aiResultSummary = document.getElementById("aiResultSummary");
const aiRunTableBody = document.querySelector("#aiRunTable tbody");
const aiResultTableBody = document.querySelector("#aiResultTable tbody");
const aiResultOutput = document.getElementById("aiResultOutput");
const aiDetailModal = document.getElementById("aiDetailModal");
const aiDetailModalBody = document.getElementById("aiDetailModalBody");
const aiDetailModalTitle = document.getElementById("aiDetailModalTitle");
const aiDetailModalCloseBtn = document.getElementById("aiDetailModalCloseBtn");

const defaultState = {
  nextFunctionId: 1001,
  nextCaseRecordId: 100001,
  nextAiCaseId: 200001,
  nextTempCaseId: 300000,
  functions: [
    {
      id: 1001,
      sysId: "cjeh2",
      sysName: "长江e号2",
      funcNo: "500.6",
      funcName: "委托确认",
      funcType: "yn",
      subFuncType: "trade",
      funcRequestMethod: "POST",
      createdAt: nowText()
    }
  ],
  cases: [
    {
      id: 100001,
      sysId: "cjeh2",
      sysName: "长江e号2",
      caseId: 146666,
      caseName: "伊诺普通交易深市REITs限价类型委托买入成功",
      funcNo: "500.6",
      funcName: "委托确认",
      funcType: "yn",
      subFuncType: "trade",
      moduleName: "普通买入",
      caseKvBase: "{\"env\":\"50000\"}",
      caseKvDynamic: "{\"i_stock_code\":\"180201\"}",
      createdAt: nowText()
    }
  ],
  versions: [
    {version_name: "长江e号", version_number: "13.1.0", func_no_string: "500.6,517504,517508", sys_id: "cjeh2", sys_name: "长江e号2", run_flag: "1"},
    {version_name: "长江e号", version_number: "12.0.0", func_no_string: "500.6,517504", sys_id: "cjeh2", sys_name: "长江e号2", run_flag: "1"},
    {version_name: "长江e号", version_number: "11.9.0", func_no_string: "500.6,517508", sys_id: "cjeh2", sys_name: "长江e号2", run_flag: "1"}
  ],
  executions: [],
  aiTempCases: [],
  aiRuns: [],
  authorization: ""
};

let state = loadState();
let latestGeneratedCases = [];
let latestExecutableCases = [];
let latestAiDocDefinition = null;
let latestDocImportedFormat = "auto";
let latestCaseImportedFormat = "auto";
let latestAiInterfaceRows = [];
let latestAiInterfaceGenerationId = "";
let latestAiInterfaceCandidates = [];
let latestAiInterfaceSaveItems = [];
let latestAiResultBatches = [];
let latestFilteredAiResults = [];
let latestDocRecords = [];
let latestExecuteRun = null;
const aiInterfaceEditState = new Map();
const legacyConsoleEnabled = Boolean(summaryCards && functionTableBody && caseTableBody && executionTableBody);

menu.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-panel]");
  if (!button) return;
  activatePanel(button.dataset.panel);
});

function activatePanel(panelId) {
  menu.querySelectorAll("button[data-panel]").forEach((item) => {
    item.classList.toggle("active", item.dataset.panel === panelId);
  });
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === panelId));
  updateFlowStage(panelId);
  if (panelId === "aiExecute") {
    loadExecutableCases();
  }
  if (panelId === "aiCaseManage" && aiManageTabPanels.length > 0) {
    const hasActive = aiManageTabPanels.some((panel) => panel.classList.contains("active"));
    if (!hasActive) {
      activateManageTab("pending");
    }
  }
  if (panelId === "aiResults") {
    const runs = queryAiResults("");
    renderAiResults(runs);
    aiResultOutput.textContent = runs.length === 0 ? "暂无执行结果" : `已加载 ${runs.length} 个执行批次`;
    renderExecuteRun(runs[0] || null);
  }
}

function updateFlowStage(panelId) {
  const panel = panels.find((item) => item.id === panelId);
  const stage = panel?.dataset?.flowStage;
  flowSteps.forEach((step) => {
    step.classList.toggle("active", stage && step.dataset.flowStage === stage);
  });
}

function activateDocTab(tabId) {
  aiDocTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.tabTarget === tabId);
  });
  aiDocTabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabId);
  });
}

function activateManageTab(tabKey) {
  aiManageTabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.manageTab === tabKey);
  });
  aiManageTabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.manageTabPanel === tabKey);
  });
}

function renderTableEmpty(tbody, colspan, text) {
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="${colspan}">${escapeHtml(text)}</td></tr>`;
}

function openDetailModal(title, html) {
  if (!aiDetailModal || !aiDetailModalBody || !aiDetailModalTitle) return;
  aiDetailModalTitle.textContent = title || "详情";
  aiDetailModalBody.innerHTML = html || "<p>暂无详情</p>";
  aiDetailModal.classList.remove("hidden");
  aiDetailModal.setAttribute("aria-hidden", "false");
}

function closeDetailModal() {
  if (!aiDetailModal) return;
  aiDetailModal.classList.add("hidden");
  aiDetailModal.setAttribute("aria-hidden", "true");
}

function parseObject(value) {
  if (value && typeof value === "object") {
    return value;
  }
  const text = String(value || "").trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {raw: text};
  }
}

function flattenObjectRows(value, prefix = "") {
  const rows = [];
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      rows.push(...flattenObjectRows(item, `${prefix}[${index}]`));
    });
    return rows;
  }
  if (value && typeof value === "object") {
    Object.keys(value).forEach((key) => {
      const next = prefix ? `${prefix}.${key}` : key;
      const nested = value[key];
      if (nested && typeof nested === "object") {
        rows.push(...flattenObjectRows(nested, next));
      } else {
        rows.push({field: next, value: nested ?? ""});
      }
    });
    return rows;
  }
  rows.push({field: prefix || "value", value: value ?? ""});
  return rows;
}

function renderMiniTable(rows, headers, emptyText = "无数据") {
  const safeRows = Array.isArray(rows) ? rows : [];
  const headHtml = headers.map((item) => `<th>${escapeHtml(item.label)}</th>`).join("");
  const bodyHtml = safeRows.length === 0
    ? `<tr><td colspan="${headers.length}">${escapeHtml(emptyText)}</td></tr>`
    : safeRows.map((row) => `<tr>${headers.map((item) => `<td>${escapeHtml(String(row[item.key] ?? "-"))}</td>`).join("")}</tr>`).join("");
  return `
    <table class="mini-table">
      <thead><tr>${headHtml}</tr></thead>
      <tbody>${bodyHtml}</tbody>
    </table>
  `;
}

function normalizeDocParam(item, index) {
  if (item && typeof item === "object") {
    return {
      name: item.name || item.field || item.key || `field_${index + 1}`,
      type: item.type || "-",
      required: item.required === true || item.required === "Y" ? "是" : "否",
      description: item.description || item.desc || "-",
      example: item.example ?? item.defaultValue ?? "-"
    };
  }
  return {
    name: `field_${index + 1}`,
    type: typeof item,
    required: "否",
    description: "-",
    example: item ?? "-"
  };
}

function normalizeDocResponse(item, index) {
  if (item && typeof item === "object") {
    return {
      name: item.name || item.field || item.key || `field_${index + 1}`,
      type: item.type || "-",
      description: item.description || item.desc || "-",
      example: item.example ?? item.defaultValue ?? "-"
    };
  }
  return {
    name: `field_${index + 1}`,
    type: typeof item,
    description: "-",
    example: item ?? "-"
  };
}

function normalizeDocRecord(raw, index = 0, defaultEngine = "DEMO_AI_ENGINE") {
  return {
    index: index + 1,
    apiName: raw?.apiName || `接口${index + 1}`,
    apiPath: raw?.apiPath || "-",
    method: String(raw?.method || "POST").toUpperCase(),
    aiEngine: raw?.aiEngine || defaultEngine,
    requestParams: (raw?.requestParams || []).map(normalizeDocParam),
    responseParams: (raw?.responseParams || []).map(normalizeDocResponse)
  };
}

function renderDocTables(record) {
  if (!record) {
    if (aiDocInfoName) {
      aiDocInfoName.textContent = "-";
      aiDocInfoPath.textContent = "-";
      aiDocInfoMethod.textContent = "-";
      aiDocInfoEngine.textContent = "-";
    }
    renderTableEmpty(aiDocRequestTableBody, 5, "暂无请求参数");
    renderTableEmpty(aiDocResponseTableBody, 4, "暂无返回字段");
    return;
  }
  if (aiDocInfoName) {
    aiDocInfoName.textContent = record.apiName || "-";
    aiDocInfoPath.textContent = record.apiPath || "-";
    aiDocInfoMethod.textContent = record.method || "-";
    aiDocInfoEngine.textContent = record.aiEngine || "-";
  }
  const reqRows = Array.isArray(record.requestParams) ? record.requestParams : [];
  aiDocRequestTableBody.innerHTML = reqRows.length === 0
    ? `<tr><td colspan="5">暂无请求参数</td></tr>`
    : reqRows.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(item.required)}</td>
        <td>${escapeHtml(item.description)}</td>
        <td>${escapeHtml(String(item.example ?? "-"))}</td>
      </tr>
    `).join("");
  const respRows = Array.isArray(record.responseParams) ? record.responseParams : [];
  aiDocResponseTableBody.innerHTML = respRows.length === 0
    ? `<tr><td colspan="4">暂无返回字段</td></tr>`
    : respRows.map((item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.type)}</td>
        <td>${escapeHtml(item.description)}</td>
        <td>${escapeHtml(String(item.example ?? "-"))}</td>
      </tr>
    `).join("");
}

function renderDocImportTable(records) {
  if (!aiDocImportTableBody) return;
  const rows = Array.isArray(records) ? records : [];
  if (rows.length === 0) {
    renderTableEmpty(aiDocImportTableBody, 6, "暂无导入记录");
    return;
  }
  aiDocImportTableBody.innerHTML = rows.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(item.apiName || "-")}</td>
      <td>${escapeHtml(item.apiPath || "-")}</td>
      <td>${escapeHtml(item.method || "-")}</td>
      <td>${item.requestParams?.length || item.responseParams?.length ? "已解析" : "待补全"}</td>
      <td><button type="button" class="table-btn table-btn-view ai-doc-detail-btn" data-index="${index}">查看</button></td>
    </tr>
  `).join("");
}

function renderDocRecords(records) {
  latestDocRecords = Array.isArray(records) ? records : [];
  renderDocTables(latestDocRecords[0] || null);
  renderDocImportTable(latestDocRecords);
}

function buildCaseDetailHtml(candidate) {
  const basicRows = [
    {field: "案例名称", value: candidate.caseName || "-"},
    {field: "接口地址", value: candidate.funcHttpUrl || "-"},
    {field: "请求方式", value: candidate.funcRequestMethod || "-"},
    {field: "功能号", value: candidate.funcNo || "-"},
    {field: "模块", value: candidate.moduleName || "-"},
    {field: "状态", value: candidate.status === 1 ? "已入库" : "待采纳"}
  ];
  const baseRows = flattenObjectRows(parseObject(candidate.caseKvBase || {}));
  const dynamicRows = flattenObjectRows(parseObject(candidate.caseKvDynamic || {}));
  return `
    <div class="modal-grid">
      <div>
        <h4>基本信息</h4>
        ${renderMiniTable(basicRows, [
          {key: "field", label: "字段"},
          {key: "value", label: "值"}
        ])}
      </div>
      <div>
        <h4>请求参数</h4>
        ${renderMiniTable(baseRows, [
          {key: "field", label: "参数"},
          {key: "value", label: "值"}
        ], "暂无请求参数")}
        <h4>动态参数</h4>
        ${renderMiniTable(dynamicRows, [
          {key: "field", label: "参数"},
          {key: "value", label: "值"}
        ], "暂无动态参数")}
      </div>
    </div>
  `;
}

function buildExecutionDetailHtml(item) {
  const requestRows = flattenObjectRows(parseObject(item.requestBody || item.requestParams || {}));
  const resultRows = flattenObjectRows(parseObject(item.responseBody || item.responseData || {message: item.resultMessage || "-"}));
  return `
    <div class="modal-grid">
      <div>
        <h4>请求参数</h4>
        ${renderMiniTable(requestRows, [
          {key: "field", label: "参数"},
          {key: "value", label: "值"}
        ], "暂无请求参数")}
      </div>
      <div>
        <h4>返回结果</h4>
        ${renderMiniTable(resultRows, [
          {key: "field", label: "字段"},
          {key: "value", label: "值"}
        ], "暂无返回结果")}
        <h4>断言结果</h4>
        ${renderMiniTable([{
          field: "执行状态",
          value: item.status || "-"
        }, {
          field: "结果信息",
          value: item.resultMessage || "-"
        }], [
          {key: "field", label: "规则"},
          {key: "value", label: "结果"}
        ], "暂无断言结果")}
      </div>
    </div>
  `;
}

function nowText() {
  return new Date().toLocaleString("zh-CN", {hour12: false});
}

function loadState() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return structuredClone(defaultState);
    return {...structuredClone(defaultState), ...JSON.parse(raw)};
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function formToJson(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    data[key] = value;
  });
  return data;
}

function parseJsonArray(text, fieldName) {
  try {
    const value = JSON.parse(text);
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} 必须是JSON数组`);
    }
    return value;
  } catch (error) {
    throw new Error(`${fieldName} 解析失败：${error.message}`);
  }
}

function normalizeMethod(method) {
  return String(method || "POST").toUpperCase();
}

function mapType(source) {
  switch (String(source || "string").toLowerCase()) {
    case "int":
    case "integer":
    case "long":
      return "integer";
    case "double":
    case "float":
    case "decimal":
    case "number":
      return "number";
    case "boolean":
    case "bool":
      return "boolean";
    case "array":
    case "list":
      return "array";
    case "object":
    case "map":
      return "object";
    default:
      return "string";
  }
}

function buildApiDefinition(form) {
  const data = formToJson(form);
  return {
    apiName: data.apiName,
    apiPath: data.apiPath,
    method: data.method,
    requestParams: parseJsonArray(data.requestParams, "requestParams"),
    responseParams: parseJsonArray(data.responseParams || "[]", "responseParams")
  };
}

function detectDocFormatByFileName(fileName) {
  const lower = String(fileName || "").toLowerCase();
  if (lower.endsWith(".yaml") || lower.endsWith(".yml")) return "yaml";
  if (lower.endsWith(".json")) return "json";
  return "auto";
}

function parseDelimitedRows(text, delimiter) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(delimiter).map((item) => item.trim());
  if (headers.every((item) => !item)) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = lines[i].split(delimiter);
    const row = {};
    headers.forEach((header, index) => {
      if (!header) return;
      row[header] = String(values[index] ?? "").trim();
    });
    if (Object.keys(row).length > 0) {
      rows.push(row);
    }
  }
  return rows;
}

function normalizeInputKey(key) {
  return String(key || "")
    .toLowerCase()
    .replace(/[_\-\.\s]/g, "");
}

function pickInputValue(normalized, fallback, aliases) {
  for (const alias of aliases) {
    const key = normalizeInputKey(alias);
    const value = normalized[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }
  return fallback;
}

function nextAiInterfaceCaseId() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const base = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return Number(`${base}${Math.floor(Math.random() * 900 + 100)}`);
}

function buildAiCaseKvBase(candidate) {
  return JSON.stringify({
    env: "50000",
    funcno: candidate.funcNo,
    funcName: candidate.funcName,
    requestMethod: candidate.funcRequestMethod || "POST",
    httpUrl: candidate.funcHttpUrl || "",
    businessGoal: candidate.businessGoal || "校验接口功能返回结果",
    param: {
      module: candidate.moduleName || "AI生成模块",
      scenario: candidate.scenario || "标准交易场景"
    }
  });
}

function buildAiCaseKvDynamic(candidate) {
  return JSON.stringify({
    i_resource: "0",
    i_sysid: candidate.sysName || "长江e号2",
    i_sysver: "latest",
    i_request_data: "aitest_devops_batch",
    i_func_no: candidate.funcNo || ""
  });
}

function normalizeInputRow(rawRow) {
  const normalized = {};
  Object.keys(rawRow || {}).forEach((key) => {
    normalized[normalizeInputKey(key)] = rawRow[key];
  });
  return normalized;
}

function buildAiInterfaceCandidate(rawRow, index, source = "IMPORT_PARSED", defaults = {}) {
  const normalized = normalizeInputRow(rawRow);
  const funcNo = pickInputValue(normalized, defaults.funcNo || "", ["funcNo", "功能号", "接口号"]);
  const candidate = {
    candidateId: `cand_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    source,
    sysId: pickInputValue(normalized, defaults.sysId || "cjeh2", ["sysId", "系统id", "i_sysid"]),
    sysName: pickInputValue(normalized, defaults.sysName || "长江e号2", ["sysName", "系统名称", "i_sysname"]),
    funcNo,
    funcName: pickInputValue(normalized, defaults.funcName || `AI生成接口_${funcNo || index + 1}`, ["funcName", "功能名称", "接口名称"]),
    funcType: pickInputValue(normalized, defaults.funcType || "yn", ["funcType", "功能类型"]),
    subFuncType: pickInputValue(normalized, defaults.subFuncType || "trade", ["subFuncType", "子功能类型"]),
    funcParamMatch: pickInputValue(normalized, "", ["funcParamMatch", "参数映射"]),
    funcHttpUrl: pickInputValue(normalized, defaults.funcHttpUrl || "", ["funcHttpUrl", "接口地址", "url"]),
    funcRequestMethod: pickInputValue(normalized, defaults.funcRequestMethod || "POST", ["funcRequestMethod", "请求方式", "method"]),
    funcRemark: pickInputValue(normalized, "", ["funcRemark", "接口备注"]),
    moduleName: pickInputValue(normalized, defaults.moduleName || "AI生成模块", ["moduleName", "模块名称", "模块"]),
    caseId: Number(pickInputValue(normalized, String(nextAiInterfaceCaseId()), ["caseId", "案例id", "案例编号"])),
    caseName: pickInputValue(normalized, defaults.caseName || `AI生成案例_${funcNo || index + 1}`, ["caseName", "案例名称"]),
    caseType: pickInputValue(normalized, "正例", ["caseType", "案例类型"]),
    runFlag: pickInputValue(normalized, "1", ["runFlag", "是否启用"]),
    caseKvBase: pickInputValue(normalized, "", ["caseKvBase"]),
    caseKvDynamic: pickInputValue(normalized, "", ["caseKvDynamic"]),
    caseCheckFunction: pickInputValue(normalized, "517184", ["caseCheckFunction", "检查功能号"]),
    caseRemark: pickInputValue(normalized, "", ["caseRemark", "案例备注"]),
    businessGoal: pickInputValue(normalized, "校验接口功能返回结果", ["businessGoal", "业务目标"]),
    scenario: pickInputValue(normalized, "标准交易场景", ["scenario", "场景"])
  };

  if (!candidate.caseKvBase) {
    candidate.caseKvBase = buildAiCaseKvBase(candidate);
  }
  if (!candidate.caseKvDynamic) {
    candidate.caseKvDynamic = buildAiCaseKvDynamic(candidate);
  }

  candidate.valid = Boolean(
    candidate.sysId &&
    candidate.sysName &&
    candidate.funcNo &&
    candidate.funcName &&
    candidate.funcType &&
    candidate.moduleName &&
    Number.isFinite(candidate.caseId) &&
    candidate.caseName &&
    candidate.caseKvBase
  );
  candidate.validationMessage = candidate.valid
    ? "可入库"
    : "缺少必填字段（sysId/sysName/funcNo/funcName/funcType/caseId/caseName/caseKvBase/moduleName）";
  return candidate;
}

function parseTextBlocksToRows(text) {
  const blocks = String(text || "").trim().split(/\n\s*\n/).filter((item) => item.trim().length > 0);
  const rows = [];
  blocks.forEach((block) => {
    const row = {};
    block.split(/\r?\n/).forEach((line) => {
      const textLine = line.trim();
      if (!textLine) return;
      const idx = [textLine.indexOf(":"), textLine.indexOf("："), textLine.indexOf("=")]
        .filter((item) => item > 0)
        .sort((a, b) => a - b)[0];
      if (idx === undefined || idx < 1) return;
      const key = textLine.slice(0, idx).trim();
      const value = textLine.slice(idx + 1).trim();
      if (key) {
        row[key] = value;
      }
    });
    if (Object.keys(row).length > 0) {
      rows.push(row);
    }
  });
  return rows;
}

function parseAiInterfaceTextRows(text) {
  const content = String(text || "").trim();
  if (!content) return [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => item && typeof item === "object");
    }
    if (parsed && typeof parsed === "object") {
      return [parsed];
    }
  } catch {
    // ignore
  }
  const delimiterRows = parseDelimitedRows(content, content.includes("\t") ? "\t" : ",");
  if (delimiterRows.length > 0) {
    return delimiterRows;
  }
  return parseTextBlocksToRows(content);
}

async function parseAiInterfaceFile(file) {
  const name = String(file?.name || "").toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    if (!window.XLSX || typeof window.XLSX.read !== "function") {
      throw new Error("Excel解析器未加载，请刷新页面后重试");
    }
    const buffer = await file.arrayBuffer();
    const workbook = window.XLSX.read(buffer, {type: "array"});
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {rows: [], text: ""};
    }
    const sheet = workbook.Sheets[sheetName];
    return {rows: window.XLSX.utils.sheet_to_json(sheet, {defval: ""}), text: ""};
  }

  const text = await file.text();
  if (name.endsWith(".csv")) {
    return {rows: parseDelimitedRows(text, text.includes("\t") ? "\t" : ","), text};
  }
  if (name.endsWith(".json")) {
    return {rows: parseAiInterfaceTextRows(text), text};
  }
  return {rows: [], text};
}

function generateAiInterfaceCandidates(importRows, textInput) {
  const allRows = [];
  if (Array.isArray(importRows) && importRows.length > 0) {
    allRows.push(...importRows);
  }
  allRows.push(...parseAiInterfaceTextRows(textInput));
  if (allRows.length === 0) {
    throw new Error("未识别到可用输入数据");
  }

  const seedCase = state.cases[0] || null;
  const seedFunction = seedCase
    ? state.functions.find((item) => item.sysId === seedCase.sysId && item.funcNo === seedCase.funcNo)
    : null;
  const defaults = {
    sysId: seedCase?.sysId || "cjeh2",
    sysName: seedCase?.sysName || "长江e号2",
    funcNo: seedCase?.funcNo || "",
    funcName: seedCase?.funcName || "委托确认",
    funcType: seedCase?.funcType || "yn",
    subFuncType: seedCase?.subFuncType || "trade",
    funcHttpUrl: seedFunction?.funcHttpUrl || "",
    funcRequestMethod: seedFunction?.funcRequestMethod || "POST",
    moduleName: seedCase?.moduleName || "普通买入",
    caseName: seedCase?.caseName || "AI生成案例"
  };

  const importCandidates = allRows.map((row, index) => buildAiInterfaceCandidate(row, index, "IMPORT_PARSED", defaults));
  const aiExplored = importCandidates
    .filter((item) => item.valid)
    .map((item, index) => {
      const cloned = buildAiInterfaceCandidate({
        ...item,
        caseId: nextAiInterfaceCaseId(),
        caseName: `${item.caseName}_AI探索${index + 1}`,
        caseType: index % 2 === 0 ? "边界" : "异常",
        scenario: index % 2 === 0 ? "边界值场景" : "异常参数场景",
        businessGoal: index % 2 === 0 ? "验证边界输入处理" : "验证异常输入拦截"
      }, index, "AI_EXPLORED", defaults);
      return cloned;
    });

  const candidates = [...importCandidates, ...aiExplored];
  const generation = {
    generationId: `gen_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    inputRowCount: allRows.length,
    aiEngine: "DEMO_AI_ENGINE",
    remoteLlmConfigured: false,
    remoteLlmUsed: false,
    prompt: "基于成功案例进行AI探索生成（Pages演示）",
    seedCase: seedCase || {},
    candidates
  };
  return generation;
}

function cacheAiTempCases(generation) {
  const now = nowText();
  const generated = (generation?.candidates || []).map((candidate) => {
    state.nextTempCaseId += 1;
    const tempCase = {
      tempId: state.nextTempCaseId,
      generationId: generation.generationId,
      status: 0,
      statusMessage: "待人工审核",
      createdAt: now,
      updatedAt: now,
      ...candidate,
      selected: false
    };
    validateAiInterfaceCandidate(tempCase);
    return tempCase;
  });
  state.aiTempCases = [...generated, ...(state.aiTempCases || [])];
  persist();
  return generated;
}

function collectSelectedTempIds() {
  return (latestAiInterfaceCandidates || [])
    .filter((item) => item.selected && item.valid && item.status === 0)
    .map((item) => Number(item.tempId))
    .filter((item) => Number.isFinite(item));
}

function collectSelectedPublishedTempIds() {
  return (latestAiInterfaceCandidates || [])
    .filter((item) => item.selected && item.status === 1)
    .map((item) => Number(item.tempId))
    .filter((item) => Number.isFinite(item));
}

function findLocalStoredCaseIndex(tempCase) {
  if (Number.isFinite(Number(tempCase.caseRecordId))) {
    const byRecordId = (state.cases || []).findIndex((item) => Number(item.id) === Number(tempCase.caseRecordId));
    if (byRecordId >= 0) return byRecordId;
  }
  return (state.cases || []).findIndex((item) => (
    item.sysId === tempCase.sysId && String(item.caseId) === String(tempCase.caseId)
  ));
}

function updateLocalTempCase(candidate, allowStored = false) {
  const targetIndex = (state.aiTempCases || []).findIndex((item) => Number(item.tempId) === Number(candidate.tempId));
  if (targetIndex < 0) {
    throw new Error(`预生成案例不存在: ${candidate.tempId}`);
  }
  const target = state.aiTempCases[targetIndex];
  if (target.status === 1 && !allowStored) {
    throw new Error("已入库案例不允许修改");
  }
  const merged = {
    ...target,
    ...candidate,
    caseId: Number.isFinite(Number(candidate.caseId)) ? Number(candidate.caseId) : candidate.caseId,
    updatedAt: nowText()
  };
  validateAiInterfaceCandidate(merged);

  if (target.status === 1) {
    if (!merged.valid) {
      throw new Error("已入库案例修改后必填字段不完整，无法保存");
    }
    const recordIndex = findLocalStoredCaseIndex(target);
    if (recordIndex < 0) {
      throw new Error("已入库案例不存在，无法修改");
    }
    const duplicate = (state.cases || []).find((item, index) => (
      index !== recordIndex
      && item.sysId === merged.sysId
      && String(item.caseId) === String(merged.caseId)
    ));
    if (duplicate) {
      throw new Error("案例记录已存在,请重新检查");
    }
    const functionRef = (state.functions || []).find((item) => (
      item.sysId === merged.sysId && item.funcNo === merged.funcNo
    ));
    if (!functionRef) {
      throw new Error("请先在接口表 T_AI_FUNCTION 中补充功能号信息");
    }
    const currentCase = state.cases[recordIndex];
    const normalizedRemark = String(merged.caseRemark || "").includes(aiInterfaceCaseTag)
      ? String(merged.caseRemark || "")
      : `${aiInterfaceCaseTag} ${merged.caseRemark || ""}`.trim();
    state.cases[recordIndex] = {
      ...currentCase,
      sysId: merged.sysId,
      sysName: merged.sysName,
      caseId: Number(merged.caseId),
      caseName: merged.caseName,
      caseType: merged.caseType || currentCase.caseType || "正例",
      runFlag: merged.runFlag || currentCase.runFlag || "1",
      caseKvBase: merged.caseKvBase,
      caseKvDynamic: merged.caseKvDynamic || "",
      funcNo: merged.funcNo,
      funcName: functionRef.funcName,
      funcType: functionRef.funcType,
      subFuncType: functionRef.subFuncType,
      moduleName: merged.moduleName,
      caseRemark: normalizedRemark,
      createdAt: currentCase.createdAt || nowText()
    };
    merged.caseRecordId = state.cases[recordIndex].id;
    merged.status = 1;
    merged.statusMessage = "已入库(已更新)";
  } else {
    merged.status = 0;
    merged.statusMessage = "待人工审核";
  }

  state.aiTempCases[targetIndex] = merged;
  persist();
  return merged;
}

function deleteLocalTempCases(tempIds) {
  const selectedSet = new Set((tempIds || []).map((item) => Number(item)).filter((item) => Number.isFinite(item)));
  if (selectedSet.size === 0) {
    throw new Error("请选择要删除的预生成案例");
  }
  let deleted = 0;
  state.aiTempCases = (state.aiTempCases || []).filter((item) => {
    if (!selectedSet.has(Number(item.tempId))) {
      return true;
    }
    if (item.status === 1) {
      const recordIndex = findLocalStoredCaseIndex(item);
      if (recordIndex >= 0) {
        state.cases.splice(recordIndex, 1);
      }
    }
    deleted += 1;
    return false;
  });
  persist();
  return {
    action: "delete",
    affectedCount: deleted
  };
}

function cancelPublishTempCases(tempIds) {
  const selectedSet = new Set((tempIds || []).map((item) => Number(item)).filter((item) => Number.isFinite(item)));
  if (selectedSet.size === 0) {
    throw new Error("请选择要取消入库的案例");
  }
  let affected = 0;
  (state.aiTempCases || []).forEach((item) => {
    if (!selectedSet.has(Number(item.tempId)) || item.status !== 1) {
      return;
    }
    const recordIndex = findLocalStoredCaseIndex(item);
    if (recordIndex >= 0) {
      state.cases.splice(recordIndex, 1);
    }
    item.status = 0;
    item.statusMessage = "待人工审核(已取消入库)";
    item.caseRecordId = null;
    item.updatedAt = nowText();
    item.selected = false;
    validateAiInterfaceCandidate(item);
    affected += 1;
  });
  persist();
  return {
    action: "cancelPublish",
    affectedCount: affected
  };
}

function regenerateLocalTempCases(tempIds, copiesPerCase = 1) {
  const copies = Math.max(1, Math.min(3, Number(copiesPerCase) || 1));
  const selectedSet = new Set((tempIds || []).map((item) => Number(item)).filter((item) => Number.isFinite(item)));
  const source = (state.aiTempCases || []).filter((item) => item.status === 0 && (selectedSet.size === 0 || selectedSet.has(Number(item.tempId))));
  if (source.length === 0) {
    throw new Error("未找到可再生的预生成案例");
  }
  const now = nowText();
  const generated = [];
  source.forEach((item) => {
    for (let i = 0; i < copies; i += 1) {
      state.nextTempCaseId += 1;
      const cloned = {
        ...item,
        tempId: state.nextTempCaseId,
        candidateId: `cand_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
        source: "REGENERATED",
        caseId: nextAiInterfaceCaseId(),
        caseName: `${item.caseName}_再生${i + 1}`,
        scenario: `${item.scenario || "标准交易场景"}_再生`,
        status: 0,
        statusMessage: "待人工审核",
        createdAt: now,
        updatedAt: now,
        selected: false
      };
      validateAiInterfaceCandidate(cloned);
      generated.push(cloned);
    }
  });
  state.aiTempCases = [...generated, ...(state.aiTempCases || [])];
  persist();
  return {
    action: "regenerate",
    affectedCount: generated.length,
    generated
  };
}

function renderAiInterfaceCandidates(candidates) {
  const visibleCandidates = filterAiInterfaceCandidates(candidates);
  aiInterfaceTableBody.innerHTML = visibleCandidates.map((item) => `
    <tr>
      <td><input type="checkbox" class="ai-interface-checkbox" value="${item.tempId}" ${item.valid && item.status === 0 ? "" : "disabled"} ${item.selected ? "checked" : ""}></td>
      <td>${item.tempId ?? "-"}</td>
      <td>${item.source || "-"}</td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="sysId" value="${escapeHtml(item.sysId || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="sysName" value="${escapeHtml(item.sysName || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="funcNo" value="${escapeHtml(item.funcNo || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="funcName" value="${escapeHtml(item.funcName || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="funcType" value="${escapeHtml(item.funcType || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="caseId" value="${escapeHtml(String(item.caseId ?? ""))}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="caseName" value="${escapeHtml(item.caseName || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-interface-field" data-id="${item.tempId}" data-field="moduleName" value="${escapeHtml(item.moduleName || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td>待采纳<br>${item.validationMessage || item.statusMessage || "-"}</td>
      <td>
        <div class="table-actions">
          <button type="button" class="table-btn table-btn-view ai-interface-action" data-action="detail" data-id="${item.tempId}">查看</button>
          <button type="button" class="table-btn ai-interface-action" data-action="adopt" data-id="${item.tempId}" ${item.valid === false ? "disabled" : ""}>${item.valid ? "采纳入库" : "不可采纳"}</button>
          <button type="button" class="table-btn table-btn-secondary ai-interface-action" data-action="edit" data-id="${item.tempId}">${aiInterfaceEditState.get(item.tempId) ? "完成" : "编辑"}</button>
          <button type="button" class="table-btn table-btn-danger ai-interface-action" data-action="delete" data-id="${item.tempId}">删除</button>
        </div>
      </td>
    </tr>
  `).join("");
  renderAiInterfaceStats(candidates);
}

function filterAiInterfaceCandidates(candidates) {
  const keyword = String(aiInterfaceFilterKeyword?.value || "").trim().toLowerCase();
  const status = String(aiInterfaceFilterStatus?.value || "pending");
  return (candidates || []).filter((item) => {
    if (item.status !== 0) return false;
    if (status === "pending" && item.status !== 0) return false;
    if (status === "valid" && !item.valid) return false;
    if (status === "invalid" && item.valid) return false;
    if (status === "selected" && !item.selected) return false;
    if (!keyword) return true;
    const text = [
      item.sysId,
      item.sysName,
      item.funcNo,
      item.funcName,
      item.caseName,
      item.moduleName
    ].map((val) => String(val || "").toLowerCase()).join("|");
    return text.includes(keyword);
  });
}

function renderAiInterfaceStats(candidates) {
  if (!aiInterfaceStats) return;
  const total = (candidates || []).length;
  const pending = (candidates || []).filter((item) => item.status === 0).length;
  const stored = (candidates || []).filter((item) => item.status === 1).length;
  const valid = (candidates || []).filter((item) => item.valid && item.status === 0).length;
  const selected = (candidates || []).filter((item) => item.selected).length;
  const invalid = pending - valid;
  aiInterfaceStats.textContent = `预生成总数: ${total} | 未入库: ${pending} | 已入库: ${stored} | 可入库: ${valid} | 不可入库: ${invalid} | 已采纳: ${selected}`;
}

function filterPublishedCandidates(candidates) {
  const keyword = String(aiPublishedFilterKeyword?.value || "").trim().toLowerCase();
  return (candidates || []).filter((item) => {
    if (item.status !== 1) return false;
    if (!keyword) return true;
    const text = [
      item.sysId,
      item.sysName,
      item.funcNo,
      item.funcName,
      item.caseName,
      item.moduleName,
      item.funcHttpUrl,
      item.funcRequestMethod
    ].map((val) => String(val || "").toLowerCase()).join("|");
    return text.includes(keyword);
  });
}

function renderPublishedStats(candidates) {
  if (!aiPublishedStats) return;
  const published = (candidates || []).filter((item) => item.status === 1);
  const total = published.length;
  const selected = published.filter((item) => item.selected).length;
  aiPublishedStats.textContent = `已入库总数: ${total} | 已勾选: ${selected}`;
}

function renderPublishedCandidates(candidates) {
  if (!aiPublishedTableBody) return;
  const visibleCandidates = filterPublishedCandidates(candidates);
  aiPublishedTableBody.innerHTML = visibleCandidates.map((item) => `
    <tr>
      <td><input type="checkbox" class="ai-published-checkbox" value="${item.tempId}" ${item.selected ? "checked" : ""}></td>
      <td>${item.tempId ?? "-"}</td>
      <td><input class="table-input ai-published-field" data-id="${item.tempId}" data-field="caseName" value="${escapeHtml(item.caseName || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-published-field" data-id="${item.tempId}" data-field="funcNo" value="${escapeHtml(item.funcNo || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-published-field" data-id="${item.tempId}" data-field="funcRequestMethod" value="${escapeHtml(item.funcRequestMethod || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td><input class="table-input ai-published-field" data-id="${item.tempId}" data-field="funcHttpUrl" value="${escapeHtml(item.funcHttpUrl || "")}" ${aiInterfaceEditState.get(item.tempId) ? "" : "disabled"}></td>
      <td>已入库</td>
      <td>${item.updatedAt || "-"}</td>
      <td>
        <div class="table-actions">
          <button type="button" class="table-btn table-btn-view ai-published-action" data-action="detail" data-id="${item.tempId}">查看</button>
          <button type="button" class="table-btn table-btn-secondary ai-published-action" data-action="edit" data-id="${item.tempId}">${aiInterfaceEditState.get(item.tempId) ? "保存" : "修改"}</button>
          <button type="button" class="table-btn table-btn-danger ai-published-action" data-action="delete" data-id="${item.tempId}">删除</button>
          <button type="button" class="table-btn ai-published-action" data-action="cancel-publish" data-id="${item.tempId}">取消入库</button>
        </div>
      </td>
    </tr>
  `).join("");
  renderPublishedStats(candidates);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function setButtonBusy(button, busy, busyText) {
  if (!button) return;
  if (busy) {
    if (!button.dataset.originalText) {
      button.dataset.originalText = button.textContent || "";
    }
    button.disabled = true;
    button.textContent = busyText;
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.textContent = button.dataset.originalText;
    }
  }
}

function renderAiInterfaceSaveResults(items) {
  aiInterfaceSaveTableBody.innerHTML = (items || []).map((item) => `
    <tr>
      <td>${item.tempId ?? "-"}</td>
      <td>${item.funcNo || "-"}</td>
      <td>${item.caseId ?? "-"}</td>
      <td>${item.caseName || "-"}</td>
      <td>${item.functionCreated ? "是" : "否"}</td>
      <td>${item.success ? "成功" : "失败"}</td>
      <td>${item.message || "-"}</td>
    </tr>
  `).join("");
}

function renderGeneratedTempRows(tempCases) {
  aiGeneratedTempTableBody.innerHTML = (tempCases || []).map((item) => `
    <tr>
      <td>${item.tempId ?? "-"}</td>
      <td>${item.generationId || "-"}</td>
      <td>${item.funcNo || "-"}</td>
      <td>${item.caseName || "-"}</td>
      <td>${item.status === 1 ? "已入库" : "未入库"}</td>
      <td>${item.createdAt || "-"}</td>
    </tr>
  `).join("");
}

function loadTempCases() {
  const selectedSet = new Set(
    latestAiInterfaceCandidates
      .filter((item) => item.selected)
      .map((item) => Number(item.tempId))
      .filter((item) => Number.isFinite(item))
  );
  latestAiInterfaceCandidates = (state.aiTempCases || [])
    .slice()
    .sort((a, b) => Number(b.tempId || 0) - Number(a.tempId || 0))
    .map((item) => {
      const candidate = {...item, selected: selectedSet.has(Number(item.tempId))};
      validateAiInterfaceCandidate(candidate);
      return candidate;
    });
  renderAiInterfaceCandidates(latestAiInterfaceCandidates);
  renderPublishedCandidates(latestAiInterfaceCandidates);
  return latestAiInterfaceCandidates;
}

function renderAiInterfaceExecution(execution) {
  if (!execution) {
    aiInterfaceExecutionTableBody.innerHTML = "";
    return;
  }
  aiInterfaceExecutionTableBody.innerHTML = `
    <tr>
      <td>${execution.hisId || "-"}</td>
      <td>${execution.status || "-"}</td>
      <td>${execution.mode || "-"}</td>
      <td>${execution.versionName || "-"} ${execution.versionNumber || "-"}</td>
      <td>${execution.totalCases ?? "-"}</td>
      <td>${execution.successCases ?? "-"}</td>
      <td>${execution.failedCases ?? "-"}</td>
      <td>${execution.passRate || "-"}</td>
    </tr>
  `;
}

function validateAiInterfaceCandidate(candidate) {
  const caseIdText = String(candidate.caseId ?? "").trim();
  const caseIdValue = Number(caseIdText);
  const caseIdValid = caseIdText !== "" && Number.isFinite(caseIdValue);
  const valid = Boolean(
    String(candidate.sysId || "").trim()
    && String(candidate.sysName || "").trim()
    && String(candidate.funcNo || "").trim()
    && String(candidate.funcName || "").trim()
    && String(candidate.funcType || "").trim()
    && String(candidate.moduleName || "").trim()
    && String(candidate.caseName || "").trim()
    && String(candidate.caseKvBase || "").trim()
    && caseIdValid
  );
  candidate.caseId = caseIdValid ? caseIdValue : candidate.caseId;
  candidate.valid = valid;
  candidate.validationMessage = valid
    ? "可入库"
    : "缺少必填字段（sysId/sysName/funcNo/funcName/funcType/caseId/caseName/caseKvBase/moduleName）";
  if (!valid) {
    candidate.selected = false;
  }
}

function parseDefinitionsFromImportedDoc(documentText, format = "auto") {
  const normalized = String(format || "auto").toLowerCase();
  let root = null;
  if (normalized === "yaml" || normalized === "yml") {
    if (!window.jsyaml || typeof window.jsyaml.load !== "function") {
      throw new Error("YAML 解析器未加载，请刷新页面后重试");
    }
    root = window.jsyaml.load(documentText);
  } else if (normalized === "json") {
    try {
      root = JSON.parse(documentText);
    } catch (error) {
      throw new Error(`文档 JSON 解析失败：${error.message}`);
    }
  } else {
    try {
      root = JSON.parse(documentText);
    } catch (jsonError) {
      if (!window.jsyaml || typeof window.jsyaml.load !== "function") {
        throw new Error(`文档解析失败：${jsonError.message}`);
      }
      try {
        root = window.jsyaml.load(documentText);
      } catch (yamlError) {
        throw new Error(`文档解析失败：${yamlError.message}`);
      }
    }
  }

  if (Array.isArray(root)) {
    return root
      .map((item) => item && typeof item === "object" ? item : null)
      .filter((item) => item && item.apiName && item.apiPath && item.method)
      .map((item) => ({
        apiName: item.apiName,
        apiPath: item.apiPath,
        method: item.method,
        requestParams: Array.isArray(item.requestParams) ? item.requestParams : [],
        responseParams: Array.isArray(item.responseParams) ? item.responseParams : []
      }));
  }

  if (root && typeof root === "object" && root.apiName && root.apiPath && root.method) {
    return [{
      apiName: root.apiName,
      apiPath: root.apiPath,
      method: root.method,
      requestParams: Array.isArray(root.requestParams) ? root.requestParams : [],
      responseParams: Array.isArray(root.responseParams) ? root.responseParams : []
    }];
  }

  return parseOpenApiToDefinitions(root);
}

function parseOpenApiToDefinitions(root) {
  const httpMethods = new Set(["get", "post", "put", "delete", "patch", "head", "options"]);
  const paths = root && typeof root === "object" && root.paths && typeof root.paths === "object"
    ? root.paths
    : {};
  const definitions = [];

  const parseSchemaProperties = (schema, withRequired) => {
    const props = schema && typeof schema === "object" && schema.properties && typeof schema.properties === "object"
      ? schema.properties
      : {};
    const requiredSet = withRequired && Array.isArray(schema.required) ? new Set(schema.required.map((item) => String(item))) : new Set();
    return Object.keys(props).map((name) => {
      const field = props[name] && typeof props[name] === "object" ? props[name] : {};
      return {
        name,
        type: field.type || "string",
        required: withRequired ? requiredSet.has(name) : false,
        description: field.description || "",
        example: field.example === undefined || field.example === null ? "" : String(field.example)
      };
    });
  };

  Object.keys(paths).forEach((apiPath) => {
    const pathItem = paths[apiPath] && typeof paths[apiPath] === "object" ? paths[apiPath] : {};
    Object.keys(pathItem).forEach((methodKey) => {
      if (!httpMethods.has(methodKey.toLowerCase())) return;
      const operation = pathItem[methodKey] && typeof pathItem[methodKey] === "object" ? pathItem[methodKey] : {};
      const requestParams = [];

      if (Array.isArray(operation.parameters)) {
        operation.parameters.forEach((param) => {
          if (!param || typeof param !== "object") return;
          const schema = param.schema && typeof param.schema === "object" ? param.schema : {};
          requestParams.push({
            name: param.name || "",
            type: schema.type || "string",
            required: Boolean(param.required),
            description: param.description || "",
            example: param.example !== undefined ? String(param.example) : (schema.example !== undefined ? String(schema.example) : "")
          });
        });
      }

      const requestSchema = operation.requestBody
        && operation.requestBody.content
        && operation.requestBody.content["application/json"]
        && operation.requestBody.content["application/json"].schema
        ? operation.requestBody.content["application/json"].schema
        : null;
      requestParams.push(...parseSchemaProperties(requestSchema, true));

      const responses = operation.responses && typeof operation.responses === "object" ? operation.responses : {};
      const success = responses["200"] || responses["201"] || responses.default || {};
      const responseSchema = success
        && success.content
        && success.content["application/json"]
        && success.content["application/json"].schema
        ? success.content["application/json"].schema
        : null;
      const responseParams = parseSchemaProperties(responseSchema, false);

      definitions.push({
        apiName: operation.summary || operation.operationId || `${methodKey.toUpperCase()} ${apiPath}`,
        apiPath,
        method: methodKey.toUpperCase(),
        requestParams,
        responseParams
      });
    });
  });

  return definitions;
}

function generateDocs(definition) {
  const reqLines = definition.requestParams.length === 0
    ? "- 无"
    : definition.requestParams.map((item) => `- \`${item.name || "field"}\` (${item.type || "string"}), required=${Boolean(item.required)}, desc=${item.description || "-"}`).join("\n");
  const rspLines = definition.responseParams.length === 0
    ? "- 无"
    : definition.responseParams.map((item) => `- \`${item.name || "field"}\` (${item.type || "string"}), desc=${item.description || "-"}`).join("\n");

  const markdown = [
    `## ${definition.apiName}`,
    `- 路径: \`${definition.apiPath}\``,
    `- 方法: \`${normalizeMethod(definition.method)}\``,
    "",
    "### 请求参数",
    reqLines,
    "",
    "### 响应参数",
    rspLines
  ].join("\n");

  const toSchema = (params) => {
    const properties = {};
    const required = [];
    params.forEach((item) => {
      const name = item.name || "field";
      properties[name] = {
        type: mapType(item.type),
        description: item.description || "",
        example: item.example || ""
      };
      if (item.required) required.push(name);
    });
    const schema = {type: "object", properties};
    if (required.length > 0) schema.required = required;
    return schema;
  };

  return {
    apiName: definition.apiName,
    apiPath: definition.apiPath,
    method: normalizeMethod(definition.method),
    generatedAt: nowText(),
    aiParticipated: true,
    aiEngine: "DEMO_AI_ENGINE",
    remoteLlmConfigured: false,
    remoteLlmUsed: false,
    markdown,
    openApi: {
      openapi: "3.0.3",
      info: {title: definition.apiName, version: "1.0.0"},
      paths: {
        [definition.apiPath]: {
          [normalizeMethod(definition.method).toLowerCase()]: {
            summary: definition.apiName,
            requestBody: {
              required: true,
              content: {
                "application/json": {schema: toSchema(definition.requestParams)}
              }
            },
            responses: {
              200: {
                description: "success",
                content: {
                  "application/json": {schema: toSchema(definition.responseParams)}
                }
              }
            }
          }
        }
      }
    }
  };
}

function buildApiDocExcelRows(definitions) {
  const rows = [];
  (definitions || []).forEach((definition) => {
    const requestParams = Array.isArray(definition.requestParams) ? definition.requestParams : [];
    const responseParams = Array.isArray(definition.responseParams) ? definition.responseParams : [];
    const maxRows = Math.max(Math.max(requestParams.length, responseParams.length), 1);
    for (let i = 0; i < maxRows; i += 1) {
      const request = requestParams[i] || {};
      const response = responseParams[i] || {};
      rows.push({
        接口名称: definition.apiName || "",
        接口路径: definition.apiPath || "",
        请求方法: normalizeMethod(definition.method),
        请求参数名称: request.name || "",
        请求参数类型: request.type || "",
        是否必填: request.name ? (request.required ? "Yes" : "No") : "",
        默认值: request.name ? (request.example || "N/A") : "",
        返回字段: response.name || "",
        返回类型: response.type || "",
        返回说明: response.description || ""
      });
    }
  });
  return rows;
}

function exportApiDocExcel(definitions, filePrefix) {
  if (!window.XLSX || typeof window.XLSX.utils?.book_new !== "function") {
    throw new Error("Excel导出依赖未加载，请刷新页面后重试");
  }
  if (!Array.isArray(definitions) || definitions.length === 0) {
    throw new Error("没有可导出的接口文档数据");
  }
  const headers = ["接口名称", "接口路径", "请求方法", "请求参数名称", "请求参数类型", "是否必填", "默认值", "返回字段", "返回类型", "返回说明"];
  const rows = buildApiDocExcelRows(definitions);
  const worksheet = window.XLSX.utils.json_to_sheet(rows, {header: headers});
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, worksheet, "接口文档");
  const timestamp = new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace("T", "_").slice(0, 15);
  window.XLSX.writeFile(workbook, `${filePrefix}_${timestamp}.xlsx`);
}

function buildRequestBody(params, invalid = false) {
  const payload = {};
  params.forEach((item) => {
    const key = item.name || "field";
    if (invalid) {
      payload[key] = "";
      return;
    }
    if (item.example !== undefined && item.example !== null && String(item.example).trim()) {
      payload[key] = item.example;
      return;
    }
    payload[key] = "sample";
  });
  return JSON.stringify(payload);
}

function generateCases(definition) {
  const base = [
    {
      caseType: "normal",
      caseName: `${definition.apiName}_正常场景`,
      expectedResult: "接口返回成功",
      checkRule: "status=200 且业务成功",
      requestBody: buildRequestBody(definition.requestParams, false)
    },
    {
      caseType: "boundary",
      caseName: `${definition.apiName}_边界场景`,
      expectedResult: "边界参数处理正确",
      checkRule: "status=200 且字段边界合法",
      requestBody: buildRequestBody(definition.requestParams, false)
    },
    {
      caseType: "invalid",
      caseName: `${definition.apiName}_异常场景`,
      expectedResult: "错误码符合预期",
      checkRule: "status=4xx/业务错误码符合定义",
      requestBody: buildRequestBody(definition.requestParams, true)
    }
  ];

  return base.map((item) => {
    state.nextAiCaseId += 1;
    return {
      caseId: state.nextAiCaseId,
      apiName: definition.apiName,
      apiPath: definition.apiPath,
      method: normalizeMethod(definition.method),
      caseName: item.caseName,
      caseType: item.caseType,
      requestBody: item.requestBody,
      expectedResult: item.expectedResult,
      checkRule: item.checkRule,
      status: "NEW",
      source: "AI"
    };
  });
}

function generateRunId() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const base = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const suffix = String(Math.floor(Math.random() * 900000 + 100000));
  return `${base}${suffix}`;
}

function toExecutableCase(caseItem) {
  return {
    caseId: caseItem.caseId,
    caseName: caseItem.caseName,
    caseType: caseItem.caseType || "正例",
    status: caseItem.runFlag === "0" ? "DISABLED" : "ENABLED",
    source: caseItem.source || "AI_INTERFACE_CASE",
    requestBody: caseItem.caseKvBase || "{}"
  };
}

function loadExecutableCases() {
  const merged = new Map();
  const interfaceCases = (state.cases || [])
    .filter((item) => item && (
      item.source === "AI_INTERFACE_CASE"
      || String(item.caseRemark || "").includes(aiInterfaceCaseTag)
    ))
    .map(toExecutableCase);
  interfaceCases.forEach((item) => {
    if (item.caseId != null) {
      merged.set(Number(item.caseId), item);
    }
  });
  (latestGeneratedCases || []).forEach((item) => {
    if (item && item.caseId != null) {
      merged.set(Number(item.caseId), item);
    }
  });
  latestExecutableCases = Array.from(merged.values())
    .sort((a, b) => Number(b.caseId || 0) - Number(a.caseId || 0));
  renderAiCases(latestExecutableCases);
  updateExecuteProgress(latestExecutableCases.length, 0, 0);
  return latestExecutableCases;
}

function normalizeExecutionStatus(status) {
  const text = String(status || "").toLowerCase();
  if (text.includes("pass") || text.includes("success") || text.includes("ok") || text.includes("成功")) {
    return "success";
  }
  if (text.includes("fail") || text.includes("error") || text.includes("失败")) {
    return "failed";
  }
  return "running";
}

function renderStatusBadge(status) {
  const normalized = normalizeExecutionStatus(status);
  const label = escapeHtml(status || "-");
  const cssClass = normalized === "success"
    ? "status-badge status-success"
    : normalized === "failed"
      ? "status-badge status-failed"
      : "status-badge status-running";
  return `<span class="${cssClass}">${label}</span>`;
}

function updateExecuteProgress(total, passed, failed) {
  if (aiExecuteTotal) {
    aiExecuteTotal.textContent = `总数：${total ?? 0}`;
  }
  if (aiExecuteSuccess) {
    aiExecuteSuccess.textContent = `成功：${passed ?? 0}`;
  }
  if (aiExecuteFailed) {
    aiExecuteFailed.textContent = `失败：${failed ?? 0}`;
  }
  if (aiExecuteProgressValue) {
    const all = Number(total) || 0;
    const done = (Number(passed) || 0) + (Number(failed) || 0);
    const percent = all <= 0 ? 0 : Math.min(100, Math.round((done / all) * 100));
    aiExecuteProgressValue.style.width = `${percent}%`;
  }
}

function executeCases(selectedIds, mode = "parallel") {
  const caseSet = new Set(selectedIds.map((item) => Number(item)));
  const selectedCases = latestExecutableCases.filter((item) => caseSet.has(Number(item.caseId)));
  if (selectedCases.length === 0) {
    throw new Error("未找到可执行测试用例");
  }
  const results = selectedCases.map((item) => ({
    caseId: item.caseId,
    caseName: item.caseName,
    status: item.caseType === "invalid" ? "FAILED" : "PASSED",
    resultMessage: item.caseType === "invalid" ? "参数非法，命中异常场景" : "执行成功，已接入任务执行链",
    durationMs: Math.floor(Math.random() * 300) + 120,
    executedAt: nowText()
  }));
  const passed = results.filter((item) => item.status === "PASSED").length;
  const run = {
    runId: generateRunId(),
    status: passed === results.length ? "PASSED" : "FAILED",
    mode,
    total: results.length,
    passed,
    failed: results.length - passed,
    executedAt: nowText(),
    results
  };
  state.aiRuns.unshift(run);
  persist();
  return run;
}

function queryAiResults(runId) {
  if (runId && String(runId).trim()) {
    return state.aiRuns.filter((item) => item.runId === String(runId).trim());
  }
  return state.aiRuns;
}

function buildSummary() {
  const latest = state.executions[0];
  return {
    functionCount: state.functions.length,
    caseCount: state.cases.length,
    runCount: state.executions.length,
    latestHisId: latest ? latest.hisId : "-"
  };
}

function renderSummary(summary) {
  if (!summaryCards) return;
  const items = [
    ["接口数", summary.functionCount],
    ["案例数", summary.caseCount],
    ["执行次数", summary.runCount],
    ["最新 hisId", summary.latestHisId]
  ];
  summaryCards.innerHTML = items.map(([label, value]) => `
    <div class="card">
      <div class="label">${label}</div>
      <div class="value">${value}</div>
    </div>
  `).join("");
}

function renderFunctions(functions) {
  if (!functionTableBody) return;
  functionTableBody.innerHTML = functions.map((item) => `
    <tr>
      <td>${item.id}</td>
      <td>${item.sysId}</td>
      <td>${item.funcNo}</td>
      <td>${item.funcName}</td>
      <td>${item.funcType}</td>
      <td>${item.subFuncType || "-"}</td>
      <td>${item.createdAt || "-"}</td>
    </tr>
  `).join("");
}

function renderCases(cases) {
  if (!caseTableBody) return;
  caseTableBody.innerHTML = cases.map((item) => `
    <tr>
      <td>${item.id}</td>
      <td>${item.sysId}</td>
      <td>${item.caseId}</td>
      <td>${item.caseName}</td>
      <td>${item.funcNo}</td>
      <td>${item.moduleName}</td>
      <td>${item.createdAt || "-"}</td>
    </tr>
  `).join("");
}

function renderExecutions(executions) {
  if (!executionTableBody) return;
  executionTableBody.innerHTML = executions.map((item) => `
    <tr>
      <td>${item.hisId}</td>
      <td>${item.mode}</td>
      <td>${item.versionName} ${item.versionNumber}</td>
      <td>${item.status}</td>
      <td>${item.passRate || "-"}</td>
      <td>${item.beginTime || "-"}</td>
      <td>${item.endTime || "-"}</td>
    </tr>
  `).join("");
}

function renderAiCases(cases) {
  if (!aiCaseTableBody) return;
  aiCaseTableBody.innerHTML = cases.map((item) => `
    <tr>
      <td><input type="checkbox" class="ai-case-checkbox" value="${item.caseId}" checked></td>
      <td>${item.caseId}</td>
      <td>${item.caseName}</td>
      <td>${item.caseType}</td>
      <td>${renderStatusBadge(item.status || "-")}</td>
      <td>${item.source}</td>
      <td><button type="button" class="table-btn table-btn-view ai-exec-case-detail" data-id="${item.caseId}">查看</button></td>
    </tr>
  `).join("");
}

function renderExecuteRun(run) {
  latestExecuteRun = run;
  if (!aiExecuteRunSummary || !aiExecuteResultTableBody) return;
  if (!run) {
    aiExecuteRunSummary.textContent = "暂无执行结果";
    aiExecuteResultTableBody.innerHTML = `<tr><td colspan="5">暂无执行明细</td></tr>`;
    return;
  }
  aiExecuteRunSummary.textContent = `runId=${run.runId || "-"} | 状态=${run.status || "-"} | 总数=${run.total ?? 0} | 成功=${run.passed ?? 0} | 失败=${run.failed ?? 0}`;
  const rows = Array.isArray(run.results) ? run.results : [];
  aiExecuteResultTableBody.innerHTML = rows.length === 0
    ? `<tr><td colspan="5">暂无执行明细</td></tr>`
    : rows.map((item) => `
      <tr>
        <td>${escapeHtml(item.caseName || String(item.caseId || "-"))}</td>
        <td>${renderStatusBadge(item.status || "-")}</td>
        <td>${item.durationMs ?? item.elapsedMs ?? item.costMs ?? "-"}</td>
        <td>${escapeHtml(item.executedAt || "-")}</td>
        <td><button type="button" class="table-btn table-btn-view ai-exec-result-detail-btn" data-case-id="${item.caseId ?? ""}" data-time="${escapeHtml(item.executedAt || "")}">详情</button></td>
      </tr>
    `).join("");
}

function renderAiResults(runs) {
  if (!aiRunTableBody || !aiResultTableBody) return;
  latestAiResultBatches = Array.isArray(runs) ? runs : [];
  aiRunTableBody.innerHTML = latestAiResultBatches.map((item) => `
    <tr>
      <td>${item.runId}</td>
      <td>${renderStatusBadge(item.status)}</td>
      <td>${item.total}</td>
      <td>${item.passed}</td>
      <td>${item.failed}</td>
      <td>${item.executedAt}</td>
    </tr>
  `).join("");

  const selected = latestAiResultBatches[0];
  const details = selected ? selected.results : [];
  const statusFilter = String(aiResultStatusFilter?.value || "all");
  const filteredDetails = details.filter((item) => {
    if (statusFilter === "all") {
      return true;
    }
    return normalizeExecutionStatus(item.status) === statusFilter;
  });
  const passed = details.filter((item) => normalizeExecutionStatus(item.status) === "success").length;
  const failed = details.filter((item) => normalizeExecutionStatus(item.status) === "failed").length;
  latestFilteredAiResults = filteredDetails;
  if (aiResultSummary) {
    aiResultSummary.textContent = `当前批次总数: ${details.length} | 成功: ${passed} | 失败: ${failed} | 筛选: ${statusFilter === "all" ? "全部" : statusFilter}`;
  }
  aiResultTableBody.innerHTML = filteredDetails.length === 0
    ? `<tr><td colspan="7">暂无结果数据</td></tr>`
    : filteredDetails.map((item) => {
    const normalized = normalizeExecutionStatus(item.status);
    const messageClass = normalized === "failed" ? "result-message-failed" : "";
    return `
    <tr>
      <td>${item.caseId}</td>
      <td>${item.caseName}</td>
      <td>${renderStatusBadge(item.status)}</td>
      <td class="${messageClass}">${escapeHtml(item.resultMessage || "-")}</td>
      <td>${item.durationMs ?? item.elapsedMs ?? item.costMs ?? "-"}</td>
      <td>${item.executedAt}</td>
      <td><button type="button" class="table-btn table-btn-view ai-result-detail-btn" data-case-id="${item.caseId ?? ""}" data-time="${escapeHtml(item.executedAt || "")}">详情</button></td>
    </tr>
  `;
  }).join("");
}

function refreshAll() {
  if (!legacyConsoleEnabled) return;
  renderSummary(buildSummary());
  renderFunctions(state.functions);
  renderCases(state.cases);
  renderExecutions(state.executions);
}

function ok(msg, data) {
  return {code: 200, msg, data};
}

function fail(msg) {
  return {code: 500, msg};
}

function findExecution(hisId) {
  return state.executions.find((item) => item.hisId === hisId);
}

function latestDevopsExecution() {
  return state.executions.find((item) => item.mode === "DEVOPS");
}

function formatExecutionResult(execution) {
  return ok("查询成功", {
    total: execution.details.length,
    rows: execution.details
  });
}

function generateHisId() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const base = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const suffix = String(Math.floor(Math.random() * 90 + 10));
  return `${base}${suffix}`;
}

function createExecution(mode, versionName, versionNumber, message) {
  const execution = {
    hisId: generateHisId(),
    runName: `接口自动化V${versionNumber}(aitest)`,
    versionName,
    versionNumber,
    mode,
    status: "RUNNING",
    totalCases: 0,
    successCases: 0,
    failedCases: 0,
    passRate: "",
    beginTime: nowText(),
    endTime: null,
    executeSeconds: 0,
    message,
    details: []
  };
  state.executions.unshift(execution);
  persist();
  refreshAll();
  setTimeout(() => completeExecution(execution.hisId), 1200 + Math.floor(Math.random() * 1000));
  return execution;
}

function completeExecution(hisId) {
  const execution = findExecution(hisId);
  if (!execution || execution.status !== "RUNNING") return;

  const allCases = state.cases;
  const total = Math.max(1, allCases.length);
  const failed = total > 1 ? Math.floor(Math.random() * 2) : 0;
  const success = total - failed;

  execution.totalCases = total;
  execution.successCases = success;
  execution.failedCases = failed;
  execution.passRate = `${((success / total) * 100).toFixed(2)}%`;
  execution.status = failed === 0 ? "DONE" : "FAILED";
  execution.endTime = nowText();
  execution.executeSeconds = 1 + Math.floor(Math.random() * 3);

  if (allCases.length === 0) {
    execution.details = [{
      caseId: 0,
      caseName: "默认演示案例",
      caseResult: "Pass",
      caseMsg: "{\"message\":\"no cases configured\"}"
    }];
  } else {
    execution.details = allCases.map((item, index) => ({
      caseId: item.caseId,
      caseName: item.caseName,
      caseResult: index < failed ? "Fail" : "Pass",
      caseMsg: `{"funcNo":"${item.funcNo}","module":"${item.moduleName}"}`
    }));
  }

  persist();
  refreshAll();
}

function output(result) {
  const target = executionOutput || aiExecuteOutput;
  if (!target) return;
  if (result == null) {
    target.textContent = "无结果返回";
    return;
  }
  if (typeof result !== "object") {
    target.textContent = String(result);
    return;
  }
  const code = result.code ?? "-";
  const msg = result.msg || result.message || "操作完成";
  const hisId = result?.data?.hisId || result?.data?.runId || "";
  const hint = hisId ? `，ID=${hisId}` : "";
  target.textContent = `[code=${code}] ${msg}${hint}`;
}

if (aiDetailModal) {
  aiDetailModal.addEventListener("click", (event) => {
    const closeTarget = event.target.closest("[data-modal-close='true']");
    if (closeTarget) {
      closeDetailModal();
    }
  });
}

if (aiDetailModalCloseBtn) {
  aiDetailModalCloseBtn.addEventListener("click", closeDetailModal);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDetailModal();
  }
});

function functionLookup() {
  return state.functions.map((item) => ({
    function_id: item.id,
    i_function_id: item.id,
    i_function_id_doc: item.funcNo,
    function_id_doc: item.funcNo,
    i_function_name: item.funcName,
    function_name: item.funcName,
    sys_id: item.sysId,
    i_sys_id: item.sysId,
    i_sys_ver: "latest",
    i_resource: "0",
    i_run_flag: "1",
    function_seq: item.id,
    i_function_seq: item.id,
    sys_ver: "latest",
    func_no_string: item.funcNo,
    run_flag: "1"
  }));
}

function submitFunction(data) {
  const exists = state.functions.some((item) => item.sysId === data.sysId && item.funcNo === data.funcNo);
  if (exists) return fail("接口记录已存在,请重新检查");

  state.nextFunctionId += 1;
  const record = {
    id: state.nextFunctionId,
    sysId: data.sysId,
    sysName: data.sysName,
    funcNo: data.funcNo,
    funcName: data.funcName,
    funcType: data.funcType,
    subFuncType: data.subFuncType || "trade",
    funcRequestMethod: data.funcRequestMethod || "POST",
    funcHttpUrl: data.funcHttpUrl || "",
    funcParamMatch: data.funcParamMatch || "",
    funcRemark: data.funcRemark || "",
    createdAt: nowText()
  };
  state.functions.push(record);
  persist();
  refreshAll();
  return ok("接口新增成功", record);
}

function submitCase(data) {
  const exists = state.cases.some((item) => item.sysId === data.sysId && String(item.caseId) === String(data.caseId));
  if (exists) return fail("案例记录已存在,请重新检查");
  const functionRef = state.functions.find((item) => item.sysId === data.sysId && item.funcNo === data.funcNo);
  if (!functionRef) return fail("请先在接口表 T_AI_FUNCTION 中补充功能号信息");

  state.nextCaseRecordId += 1;
  const record = {
    id: state.nextCaseRecordId,
    sysId: data.sysId,
    sysName: data.sysName,
    caseId: Number(data.caseId),
    caseName: data.caseName,
    caseType: "正例",
    runFlag: "1",
    caseKvBase: data.caseKvBase,
    caseKvDynamic: data.caseKvDynamic || "",
    funcNo: data.funcNo,
    funcName: functionRef.funcName,
    funcType: functionRef.funcType,
    subFuncType: functionRef.subFuncType,
    moduleName: data.moduleName,
    caseRemark: data.caseRemark || "",
    source: data.source || "MANUAL",
    createdAt: nowText()
  };
  state.cases.push(record);
  persist();
  refreshAll();
  return ok("案例新增成功", record);
}

function storeAiTempCases(tempIds, autoExecute = true) {
  const selectedSet = new Set((tempIds || []).map((item) => Number(item)).filter((item) => Number.isFinite(item)));
  const selectedCases = (state.aiTempCases || []).filter((item) => item.status === 0 && selectedSet.has(Number(item.tempId)));
  if (selectedCases.length === 0) {
    throw new Error("未选中待入库的预生成案例");
  }

  const items = [];
  let functionCreatedCount = 0;
  let caseCreatedCount = 0;

  selectedCases.forEach((candidate) => {
    validateAiInterfaceCandidate(candidate);
    if (!candidate.valid) {
      candidate.status = 0;
      candidate.statusMessage = "候选数据不完整";
      candidate.updatedAt = nowText();
      items.push({
        tempId: candidate.tempId,
        candidateId: candidate.candidateId,
        funcNo: candidate.funcNo,
        caseId: candidate.caseId,
        caseName: candidate.caseName,
        success: false,
        message: "候选数据不完整"
      });
      return;
    }

    let functionCreated = false;
    const functionExists = state.functions.some((item) => item.sysId === candidate.sysId && item.funcNo === candidate.funcNo);
    if (!functionExists) {
      const functionResult = submitFunction({
        sysId: candidate.sysId,
        sysName: candidate.sysName,
        funcNo: candidate.funcNo,
        funcName: candidate.funcName,
        funcType: candidate.funcType,
        subFuncType: candidate.subFuncType,
        funcParamMatch: candidate.funcParamMatch,
        funcHttpUrl: candidate.funcHttpUrl,
        funcRequestMethod: candidate.funcRequestMethod,
        funcRemark: candidate.funcRemark
      });
      if (functionResult.code !== 200) {
        candidate.status = 0;
        candidate.statusMessage = `接口入库失败：${functionResult.msg}`;
        candidate.updatedAt = nowText();
        items.push({
          tempId: candidate.tempId,
          candidateId: candidate.candidateId,
          funcNo: candidate.funcNo,
          caseId: candidate.caseId,
          caseName: candidate.caseName,
          success: false,
          message: candidate.statusMessage
        });
        return;
      }
      functionCreated = true;
      functionCreatedCount += 1;
    }

    const caseResult = submitCase({
      sysId: candidate.sysId,
      sysName: candidate.sysName,
      caseId: candidate.caseId,
      caseName: candidate.caseName,
      caseKvBase: candidate.caseKvBase,
      caseKvDynamic: candidate.caseKvDynamic,
      funcNo: candidate.funcNo,
      moduleName: candidate.moduleName,
      caseRemark: String(candidate.caseRemark || "").includes(aiInterfaceCaseTag)
        ? candidate.caseRemark
        : `${aiInterfaceCaseTag} ${candidate.caseRemark || ""}`.trim(),
      source: "AI_INTERFACE_CASE"
    });

    if (caseResult.code === 200) {
      caseCreatedCount += 1;
      candidate.status = 1;
      candidate.statusMessage = "已入库";
      candidate.caseRecordId = caseResult.data?.id ?? null;
      candidate.updatedAt = nowText();
      candidate.selected = false;
      items.push({
        tempId: candidate.tempId,
        candidateId: candidate.candidateId,
        funcNo: candidate.funcNo,
        caseId: candidate.caseId,
        caseName: candidate.caseName,
        success: true,
        functionCreated,
        caseRecordId: caseResult.data?.id ?? null,
        message: "入库成功"
      });
    } else {
      candidate.status = 0;
      candidate.statusMessage = `案例入库失败：${caseResult.msg}`;
      candidate.updatedAt = nowText();
      items.push({
        tempId: candidate.tempId,
        candidateId: candidate.candidateId,
        funcNo: candidate.funcNo,
        caseId: candidate.caseId,
        caseName: candidate.caseName,
        success: false,
        functionCreated,
        message: candidate.statusMessage
      });
    }
  });

  persist();
  refreshAll();
  loadExecutableCases();

  let execution = null;
  let executionHisId = null;
  if (autoExecute && caseCreatedCount > 0) {
    execution = createExecution("AGENT", "AI接口自动化", "latest", "AI预生成案例人工确认后入库执行");
    executionHisId = execution.hisId;
  }

  return {
    generationId: latestAiInterfaceGenerationId,
    selectedCount: selectedCases.length,
    functionCreatedCount,
    caseCreatedCount,
    executionHisId,
    execution,
    items
  };
}

function queryStatusByHisId(hisId) {
  const execution = findExecution(hisId);
  if (!execution) return fail("您输入的运行id不存在，请确定后重新输入");
  return ok("查询成功", execution);
}

function queryResultByHisId(hisId) {
  const execution = findExecution(hisId);
  if (!execution) return fail("您输入的运行id不存在，请确定后重新输入");
  return formatExecutionResult(execution);
}

function handleBus(requestData, iResource, iSysid, iSysver) {
  if (!requestData) return fail("i_request_data 不能为空");
  const normalized = requestData.trim().toLowerCase();
  if (normalized === "authorization") {
    const token = `Bearer ${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    state.authorization = token;
    persist();
    return ok("操作成功", {authorization: token});
  }
  if (normalized === "aitest_devops_batch") {
    const execution = createExecution("DEVOPS", iSysid || "长江e号", iSysver || "latest", `通过 DevOps 接口自动化测试（方式2）, resource=${iResource || "0"}`);
    return ok("操作成功", execution);
  }
  if (normalized.startsWith("aitest_devops_hisid")) {
    const id = requestData.split(":", 2)[1];
    if (id && id.trim()) return queryStatusByHisId(id.trim());
    const latest = latestDevopsExecution();
    return latest ? ok("操作成功", latest) : fail("当前没有任务正在执行可以执行任务");
  }
  if (normalized.startsWith("aitest_devops_detail")) {
    const id = requestData.split(":", 2)[1];
    if (id && id.trim()) return queryResultByHisId(id.trim());
    const latest = latestDevopsExecution();
    return latest ? formatExecutionResult(latest) : fail("没有可查询的执行结果");
  }
  return fail(`不支持的请求类型: ${requestData}`);
}

if (functionForm) {
  functionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = submitFunction(formToJson(functionForm));
    if (functionMessage) {
      functionMessage.textContent = result.code === 200 ? `${result.msg}，ID=${result.data?.id ?? "-"}` : result.msg;
    }
    output(result);
  });
}

if (caseForm) {
  caseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = submitCase(formToJson(caseForm));
    if (caseMessage) {
      caseMessage.textContent = result.code === 200 ? `${result.msg}，ID=${result.data?.id ?? "-"}` : result.msg;
    }
    loadExecutableCases();
    output(result);
  });
}

aiInterfaceTableBody.addEventListener("input", (event) => {
  const input = event.target.closest(".ai-interface-field");
  if (!input) return;
  const tempId = Number(input.dataset.id);
  const field = input.dataset.field;
  const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
  if (!candidate || !field) return;
  candidate[field] = field === "caseId"
    ? (String(input.value).trim() === "" ? "" : Number(input.value))
    : input.value;
  validateAiInterfaceCandidate(candidate);
  renderAiInterfaceStats(latestAiInterfaceCandidates);
});

aiInterfaceTableBody.addEventListener("change", (event) => {
  const checkbox = event.target.closest(".ai-interface-checkbox");
  if (!checkbox) return;
  const tempId = Number(checkbox.value);
  const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
  if (!candidate) return;
  candidate.selected = checkbox.checked && candidate.valid && candidate.status === 0;
  renderAiInterfaceStats(latestAiInterfaceCandidates);
});

aiInterfaceTableBody.addEventListener("click", (event) => {
  const button = event.target.closest(".ai-interface-action");
  if (!button) return;
  const action = button.dataset.action;
  const tempId = Number(button.dataset.id);
  const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
  if (!candidate) return;

  if (action === "detail") {
    openDetailModal(`案例详情 · ${candidate.caseName || candidate.tempId}`, buildCaseDetailHtml(candidate));
    return;
  }

  if (action === "adopt") {
    if (!candidate.valid) {
      aiPreCaseMessage.textContent = "该行必填字段未完整，不能采纳";
      return;
    }
    if (candidate.status === 1) {
      aiPreCaseMessage.textContent = "已入库案例不需要再次采纳";
      return;
    }
    try {
      const result = storeAiTempCases([tempId], false);
      renderAiInterfaceSaveResults(result.items || []);
      renderAiInterfaceExecution(null);
      loadTempCases();
      loadExecutableCases();
      aiPreCaseMessage.textContent = `已采纳入库 tempId=${tempId}，可前往“用例执行”执行`;
      activateManageTab("published");
    } catch (error) {
      aiPreCaseMessage.textContent = `采纳入库失败：${error.message}`;
    }
    return;
  }

  if (action === "edit") {
    if (candidate.status === 1) {
      aiPreCaseMessage.textContent = "已入库案例不允许修改";
      return;
    }
    const editing = Boolean(aiInterfaceEditState.get(tempId));
    if (!editing) {
      aiInterfaceEditState.set(tempId, true);
      renderAiInterfaceCandidates(latestAiInterfaceCandidates);
      return;
    }
    try {
      validateAiInterfaceCandidate(candidate);
      if (!candidate.valid) {
        aiPreCaseMessage.textContent = "必填字段不完整，无法保存修改";
        return;
      }
      updateLocalTempCase(candidate);
      aiPreCaseMessage.textContent = `tempId=${tempId} 修改成功`;
    } catch (error) {
      aiPreCaseMessage.textContent = `修改失败：${error.message}`;
    } finally {
      aiInterfaceEditState.set(tempId, false);
      loadTempCases();
    }
    return;
  }

  if (action === "delete") {
    try {
      deleteLocalTempCases([tempId]);
      aiInterfaceEditState.delete(tempId);
      loadTempCases();
      aiPreCaseMessage.textContent = `tempId=${tempId} 已删除`;
    } catch (error) {
      aiPreCaseMessage.textContent = `删除失败：${error.message}`;
    }
  }
});

if (aiPublishedTableBody) {
  aiPublishedTableBody.addEventListener("input", (event) => {
    const input = event.target.closest(".ai-published-field");
    if (!input) return;
    const tempId = Number(input.dataset.id);
    const field = input.dataset.field;
    const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
    if (!candidate || !field) return;
    candidate[field] = input.value;
    validateAiInterfaceCandidate(candidate);
    renderPublishedStats(latestAiInterfaceCandidates);
  });

  aiPublishedTableBody.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".ai-published-checkbox");
    if (!checkbox) return;
    const tempId = Number(checkbox.value);
    const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
    if (!candidate) return;
    candidate.selected = checkbox.checked;
    renderPublishedStats(latestAiInterfaceCandidates);
  });

  aiPublishedTableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".ai-published-action");
    if (!button) return;
    const action = button.dataset.action;
    const tempId = Number(button.dataset.id);
    const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
    if (!candidate) return;

    if (action === "detail") {
      openDetailModal(`案例详情 · ${candidate.caseName || candidate.tempId}`, buildCaseDetailHtml(candidate));
      return;
    }

    if (action === "edit") {
      const editing = Boolean(aiInterfaceEditState.get(tempId));
      if (!editing) {
        aiInterfaceEditState.set(tempId, true);
        renderPublishedCandidates(latestAiInterfaceCandidates);
        return;
      }
      try {
        validateAiInterfaceCandidate(candidate);
        if (!candidate.valid) {
          aiPublishedMessage.textContent = "必填字段不完整，无法保存修改";
          return;
        }
        updateLocalTempCase(candidate, true);
        aiPublishedMessage.textContent = `tempId=${tempId} 修改成功`;
      } catch (error) {
        aiPublishedMessage.textContent = `修改失败：${error.message}`;
      } finally {
        aiInterfaceEditState.set(tempId, false);
        loadTempCases();
      }
      return;
    }

    if (action === "delete") {
      if (!window.confirm("确认删除该已入库案例吗？删除后不可恢复。")) {
        return;
      }
      try {
        deleteLocalTempCases([tempId]);
        aiInterfaceEditState.delete(tempId);
        loadTempCases();
        aiPublishedMessage.textContent = `tempId=${tempId} 已删除`;
      } catch (error) {
        aiPublishedMessage.textContent = `删除失败：${error.message}`;
      }
      return;
    }

    if (action === "cancel-publish") {
      try {
        const result = cancelPublishTempCases([tempId]);
        loadTempCases();
        aiPublishedMessage.textContent = `取消入库成功，影响 ${result.affectedCount} 条`;
        activateManageTab("pending");
      } catch (error) {
        aiPublishedMessage.textContent = `取消入库失败：${error.message}`;
      }
    }
  });
}

aiInterfaceFilterKeyword.addEventListener("input", () => {
  renderAiInterfaceCandidates(latestAiInterfaceCandidates);
});

aiInterfaceFilterStatus.addEventListener("change", () => {
  renderAiInterfaceCandidates(latestAiInterfaceCandidates);
});

if (aiPublishedFilterKeyword) {
  aiPublishedFilterKeyword.addEventListener("input", () => {
    renderPublishedCandidates(latestAiInterfaceCandidates);
  });
}

aiInterfaceFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const parsed = await parseAiInterfaceFile(file);
    latestAiInterfaceRows = Array.isArray(parsed.rows) ? parsed.rows : [];
    if (!String(aiInterfaceText.value || "").trim() && parsed.text) {
      aiInterfaceText.value = parsed.text;
    }
    if (latestAiInterfaceRows.length > 0) {
      aiInterfaceMessage.textContent = `已导入文件 ${file.name}，识别 ${latestAiInterfaceRows.length} 行数据`;
    } else {
      aiInterfaceMessage.textContent = `已导入文件 ${file.name}，未识别结构化表格，将仅使用文本输入`;
    }
  } catch (error) {
    aiInterfaceMessage.textContent = `文件解析失败：${error.message}`;
  }
});

aiInterfaceGenerateBtn.addEventListener("click", () => {
  const textInput = String(aiInterfaceText.value || "").trim();
  if (latestAiInterfaceRows.length === 0 && !textInput) {
    aiInterfaceMessage.textContent = "请先导入Excel/CSV或输入文本";
    return;
  }
  const source = document.querySelector("input[name='aiCaseSource']:checked")?.value || "doc";
  const generateCount = Number(aiInterfaceGenerateCount?.value || 10);
  const generateTypes = [
    aiCaseTypeNormal?.checked ? "normal" : null,
    aiCaseTypeAbnormal?.checked ? "abnormal" : null,
    aiCaseTypeBoundary?.checked ? "boundary" : null
  ].filter(Boolean);
  if (generateTypes.length === 0) {
    aiInterfaceMessage.textContent = "请至少选择一种生成类型";
    return;
  }
  setButtonBusy(aiInterfaceGenerateBtn, true, "生成中...");
  if (aiInterfaceGenerationStatus) {
    aiInterfaceGenerationStatus.textContent = "生成中...";
  }
  try {
    const generation = generateAiInterfaceCandidates(latestAiInterfaceRows, textInput);
    generation.source = source;
    generation.generateCount = generateCount;
    generation.generateTypes = generateTypes;
    latestAiInterfaceGenerationId = generation.generationId;
    aiInterfaceEditState.clear();
    const tempCases = cacheAiTempCases(generation);
    const failed = tempCases.filter((item) => item.valid === false).length;
    renderGeneratedTempRows(tempCases);
    loadTempCases();
    activatePanel("aiCaseManage");
    activateManageTab("pending");
    renderAiInterfaceSaveResults([]);
    renderAiInterfaceExecution(null);
    aiInterfaceMessage.textContent = `AI候选案例生成成功，预生成 ${tempCases.length} 条，AI引擎=${generation.aiEngine}`;
    if (aiInterfaceGenerationStatus) {
      aiInterfaceGenerationStatus.textContent = `生成成功：${tempCases.length - failed} 条，生成失败：${failed} 条`;
    }
    aiPreCaseMessage.textContent = "请在预生成案例管理中审核、采纳并入库";
  } catch (error) {
    aiInterfaceMessage.textContent = `生成失败：${error.message}`;
    if (aiInterfaceGenerationStatus) {
      aiInterfaceGenerationStatus.textContent = `生成失败：${error.message}`;
    }
  } finally {
    setButtonBusy(aiInterfaceGenerateBtn, false);
  }
});

aiInterfaceSelectAllBtn.addEventListener("click", () => {
  const visible = filterAiInterfaceCandidates(latestAiInterfaceCandidates).filter((item) => item.valid && item.status === 0);
  if (visible.length === 0) {
    aiPreCaseMessage.textContent = "当前没有可采纳的待入库案例";
    return;
  }
  const allChecked = visible.every((item) => item.selected);
  visible.forEach((item) => {
    item.selected = !allChecked;
  });
  renderAiInterfaceCandidates(latestAiInterfaceCandidates);
});

aiInterfaceSaveRunBtn.addEventListener("click", () => {
  const selectedIds = collectSelectedTempIds();
  if (selectedIds.length === 0) {
    aiPreCaseMessage.textContent = "请至少采纳一个待入库案例";
    return;
  }
  setButtonBusy(aiInterfaceSaveRunBtn, true, "入库执行中...");
  try {
    const result = storeAiTempCases(selectedIds, true);
    renderAiInterfaceSaveResults(result.items || []);
    renderAiInterfaceExecution(result.execution || null);
    const hisId = result.executionHisId ? `，已触发执行 hisId=${result.executionHisId}` : "";
    aiPreCaseMessage.textContent = `入库完成，接口新增 ${result.functionCreatedCount}，案例新增 ${result.caseCreatedCount}${hisId}`;
    loadTempCases();
    activateManageTab("published");
    if (result.execution) {
      aiExecuteOutput.textContent = `已触发自动执行：hisId=${result.execution.hisId || result.executionHisId || "-"}`;
    }
  } catch (error) {
    aiPreCaseMessage.textContent = `入库执行失败：${error.message}`;
  } finally {
    setButtonBusy(aiInterfaceSaveRunBtn, false);
  }
});

aiInterfaceDeleteBtn.addEventListener("click", () => {
  const selectedIds = collectSelectedTempIds();
  if (selectedIds.length === 0) {
    aiPreCaseMessage.textContent = "请先勾选需要删除的预生成案例";
    return;
  }
  setButtonBusy(aiInterfaceDeleteBtn, true, "删除中...");
  try {
    const result = deleteLocalTempCases(selectedIds);
    loadTempCases();
    aiPreCaseMessage.textContent = `删除完成，删除 ${result.affectedCount} 条`;
  } catch (error) {
    aiPreCaseMessage.textContent = `删除失败：${error.message}`;
  } finally {
    setButtonBusy(aiInterfaceDeleteBtn, false);
  }
});

aiInterfaceRegenerateBtn.addEventListener("click", () => {
  const selectedIds = collectSelectedTempIds();
  if (selectedIds.length === 0) {
    aiPreCaseMessage.textContent = "请先勾选需要再生的预生成案例";
    return;
  }
  setButtonBusy(aiInterfaceRegenerateBtn, true, "再生中...");
  try {
    const result = regenerateLocalTempCases(selectedIds, 1);
    renderGeneratedTempRows(result.generated || []);
    loadTempCases();
    aiPreCaseMessage.textContent = `再生完成，新增 ${result.affectedCount} 条案例`;
  } catch (error) {
    aiPreCaseMessage.textContent = `再生失败：${error.message}`;
  } finally {
    setButtonBusy(aiInterfaceRegenerateBtn, false);
  }
});

aiInterfaceReloadBtn.addEventListener("click", () => {
  setButtonBusy(aiInterfaceReloadBtn, true, "刷新中...");
  try {
    const rows = loadTempCases();
    aiPreCaseMessage.textContent = `刷新成功，共 ${rows.length} 条预生成案例`;
  } finally {
    setButtonBusy(aiInterfaceReloadBtn, false);
  }
});

if (aiPublishedSelectAllBtn) {
  aiPublishedSelectAllBtn.addEventListener("click", () => {
    const visible = filterPublishedCandidates(latestAiInterfaceCandidates);
    if (visible.length === 0) {
      aiPublishedMessage.textContent = "当前没有已入库案例";
      return;
    }
    const allChecked = visible.every((item) => item.selected);
    visible.forEach((item) => {
      item.selected = !allChecked;
    });
    renderPublishedCandidates(latestAiInterfaceCandidates);
  });
}

if (aiPublishedDeleteBtn) {
  aiPublishedDeleteBtn.addEventListener("click", () => {
    const selectedIds = collectSelectedPublishedTempIds();
    if (selectedIds.length === 0) {
      aiPublishedMessage.textContent = "请先勾选需要删除的已入库案例";
      return;
    }
    if (!window.confirm("确认删除该已入库案例吗？删除后不可恢复。")) {
      return;
    }
    setButtonBusy(aiPublishedDeleteBtn, true, "删除中...");
    try {
      const result = deleteLocalTempCases(selectedIds);
      loadTempCases();
      aiPublishedMessage.textContent = `删除完成，删除 ${result.affectedCount} 条`;
    } catch (error) {
      aiPublishedMessage.textContent = `删除失败：${error.message}`;
    } finally {
      setButtonBusy(aiPublishedDeleteBtn, false);
    }
  });
}

if (aiPublishedCancelBtn) {
  aiPublishedCancelBtn.addEventListener("click", () => {
    const selectedIds = collectSelectedPublishedTempIds();
    if (selectedIds.length === 0) {
      aiPublishedMessage.textContent = "请先勾选需要取消入库的案例";
      return;
    }
    setButtonBusy(aiPublishedCancelBtn, true, "取消入库中...");
    try {
      const result = cancelPublishTempCases(selectedIds);
      loadTempCases();
      aiPublishedMessage.textContent = `取消入库完成，影响 ${result.affectedCount} 条`;
      activateManageTab("pending");
    } catch (error) {
      aiPublishedMessage.textContent = `取消入库失败：${error.message}`;
    } finally {
      setButtonBusy(aiPublishedCancelBtn, false);
    }
  });
}

if (aiPublishedReloadBtn) {
  aiPublishedReloadBtn.addEventListener("click", () => {
    setButtonBusy(aiPublishedReloadBtn, true, "刷新中...");
    try {
      const rows = loadTempCases().filter((item) => item.status === 1);
      aiPublishedMessage.textContent = `刷新成功，共 ${rows.length} 条已入库案例`;
    } finally {
      setButtonBusy(aiPublishedReloadBtn, false);
    }
  });
}

if (aiPublishedCreateBtn) {
  aiPublishedCreateBtn.addEventListener("click", () => {
    aiPublishedMessage.textContent = "请先在“待采纳案例”中生成并采纳，或对现有案例点“修改”后保存。";
  });
}

if (aiDocModeTabs) {
  aiDocModeTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab-btn");
    if (!button) {
      return;
    }
    activateDocTab(button.dataset.tabTarget);
  });
}

if (aiCaseManageTabs) {
  aiCaseManageTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".tab-btn");
    if (!button) {
      return;
    }
    const key = button.dataset.manageTab;
    if (!key) {
      return;
    }
    activateManageTab(key);
  });
}

if (aiDocDownloadTemplateBtn) {
  aiDocDownloadTemplateBtn.addEventListener("click", () => {
    try {
      exportApiDocExcel([{
        apiName: "下单接口",
        apiPath: "/api/order",
        method: "POST",
        requestParams: [
          {name: "account", type: "string", required: true, description: "账户"},
          {name: "stockCode", type: "string", required: true, description: "证券代码"},
          {name: "price", type: "number", required: true, description: "价格"},
          {name: "qty", type: "integer", required: true, description: "数量"}
        ],
        responseParams: [
          {name: "code", type: "string", required: true, description: "响应码"},
          {name: "message", type: "string", required: true, description: "响应消息"}
        ]
      }], "ai-doc-template");
      aiDocMessage.textContent = "模板下载成功";
    } catch (error) {
      aiDocMessage.textContent = `模板下载失败：${error.message}`;
    }
  });
}

aiDocForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const definition = buildApiDefinition(aiDocForm);
    latestAiDocDefinition = definition;
    const docs = generateDocs(definition);
    const record = normalizeDocRecord({
      apiName: definition.apiName,
      apiPath: definition.apiPath,
      method: definition.method,
      requestParams: definition.requestParams || [],
      responseParams: definition.responseParams || [],
      aiEngine: docs.aiEngine || "DEMO_AI_ENGINE"
    }, 0, docs.aiEngine || "DEMO_AI_ENGINE");
    renderDocRecords([record]);
    aiDocMessage.textContent = `接口文档生成成功：${record.apiName} (${record.method} ${record.apiPath})`;
  } catch (error) {
    aiDocMessage.textContent = `接口文档生成失败：${error.message}`;
  }
});

aiDocImportFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    aiDocImportText.value = text;
    latestDocImportedFormat = detectDocFormatByFileName(file.name);
    aiDocMessage.textContent = `已导入接口文档文件：${file.name}`;
  } catch (error) {
    aiDocMessage.textContent = `读取文档失败：${error.message}`;
  }
});

aiDocImportGenerateBtn.addEventListener("click", () => {
  const content = String(aiDocImportText.value || "").trim();
  if (!content) {
    aiDocMessage.textContent = "请先粘贴或导入接口文档";
    return;
  }
  try {
    const definitions = parseDefinitionsFromImportedDoc(content, latestDocImportedFormat);
    if (definitions.length === 0) {
      throw new Error("导入文档未识别到可用接口定义");
    }
    const documents = definitions.map((definition) => generateDocs(definition));
    const result = {
      apiCount: definitions.length,
      aiParticipated: true,
      aiEngines: ["DEMO_AI_ENGINE"],
      remoteLlmUsedCount: 0,
      fallbackAiUsedCount: definitions.length,
      apiDefinitions: definitions,
      documents
    };
    const records = definitions.map((definition, index) => normalizeDocRecord({
      apiName: definition.apiName,
      apiPath: definition.apiPath,
      method: definition.method,
      requestParams: definition.requestParams || [],
      responseParams: definition.responseParams || [],
      aiEngine: "DEMO_AI_ENGINE"
    }, index, "DEMO_AI_ENGINE"));
    renderDocRecords(records);
    aiDocMessage.textContent = `导入成功，识别 ${result.apiCount} 个接口。已结构化展示。`;
  } catch (error) {
    aiDocMessage.textContent = `导入生成失败：${error.message}`;
  }
});

if (aiDocImportTableBody) {
  aiDocImportTableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".ai-doc-detail-btn");
    if (!button) return;
    const index = Number(button.dataset.index);
    const record = latestDocRecords[index];
    if (!record) return;
    openDetailModal(`接口文档详情 · ${record.apiName}`, `
      <div class="modal-grid">
        <div>
          <h4>接口信息</h4>
          ${renderMiniTable([
            {field: "接口名称", value: record.apiName},
            {field: "接口路径", value: record.apiPath},
            {field: "请求方式", value: record.method},
            {field: "AI引擎", value: record.aiEngine}
          ], [
            {key: "field", label: "字段"},
            {key: "value", label: "值"}
          ])}
          <h4>请求参数</h4>
          ${renderMiniTable(record.requestParams, [
            {key: "name", label: "参数"},
            {key: "type", label: "类型"},
            {key: "required", label: "必填"},
            {key: "description", label: "说明"}
          ], "暂无请求参数")}
        </div>
        <div>
          <h4>返回字段</h4>
          ${renderMiniTable(record.responseParams, [
            {key: "name", label: "字段"},
            {key: "type", label: "类型"},
            {key: "description", label: "说明"},
            {key: "example", label: "示例"}
          ], "暂无返回字段")}
        </div>
      </div>
    `);
  });
}

aiDocExportExcelBtn.addEventListener("click", () => {
  try {
    const definition = latestAiDocDefinition || buildApiDefinition(aiDocForm);
    exportApiDocExcel([definition], "api-document");
    aiDocMessage.textContent = "Excel导出成功";
  } catch (error) {
    aiDocMessage.textContent = `Excel导出失败：${error.message}`;
  }
});

aiDocImportExportExcelBtn.addEventListener("click", () => {
  const content = String(aiDocImportText.value || "").trim();
  if (!content) {
    aiDocMessage.textContent = "请先粘贴或导入接口文档";
    return;
  }
  try {
    const definitions = parseDefinitionsFromImportedDoc(content, latestDocImportedFormat);
    exportApiDocExcel(definitions, "api-documents");
    aiDocMessage.textContent = `导出成功，共 ${definitions.length} 个接口`;
  } catch (error) {
    aiDocMessage.textContent = `导出失败：${error.message}`;
  }
});

if (aiCaseForm) {
  aiCaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    try {
      const definition = buildApiDefinition(aiCaseForm);
      latestGeneratedCases = generateCases(definition);
      persist();
      const executable = loadExecutableCases();
      if (aiCaseOutput) {
        aiCaseOutput.textContent = `已生成 ${latestGeneratedCases.length} 条测试用例，请在下方表格查看与操作。`;
      }
      if (aiCaseMessage) {
        aiCaseMessage.textContent = `生成成功，共 ${latestGeneratedCases.length} 条测试用例`;
      }
      aiExecuteMessage.textContent = `已同步 ${executable.length} 条用例到执行列表`;
    } catch (error) {
      if (aiCaseMessage) {
        aiCaseMessage.textContent = `测试用例生成失败：${error.message}`;
      }
    }
  });
}

if (aiCaseImportFile) {
  aiCaseImportFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      if (aiCaseImportText) {
        aiCaseImportText.value = text;
      }
      latestCaseImportedFormat = detectDocFormatByFileName(file.name);
      if (aiCaseMessage) {
        aiCaseMessage.textContent = `已导入文档文件：${file.name}`;
      }
    } catch (error) {
      if (aiCaseMessage) {
        aiCaseMessage.textContent = `读取文件失败：${error.message}`;
      }
    }
  });
}

if (aiCaseImportGenerateBtn) {
  aiCaseImportGenerateBtn.addEventListener("click", () => {
    const content = String(aiCaseImportText?.value || "").trim();
    if (!content) {
      if (aiCaseMessage) {
        aiCaseMessage.textContent = "请先粘贴或导入接口文档";
      }
      return;
    }
    try {
      const definitions = parseDefinitionsFromImportedDoc(content, latestCaseImportedFormat);
      if (definitions.length === 0) {
        throw new Error("导入文档未识别到可用接口定义");
      }
      latestGeneratedCases = definitions.flatMap((definition) => generateCases(definition));
      persist();
      const executable = loadExecutableCases();
      const result = {
        apiCount: definitions.length,
        caseCount: latestGeneratedCases.length,
        aiParticipated: true,
        aiEngines: ["DEMO_AI_ENGINE"],
        remoteLlmUsedCount: 0,
        fallbackAiUsedCount: definitions.length,
        apiDefinitions: definitions,
        generatedCases: latestGeneratedCases
      };
      if (aiCaseOutput) {
        aiCaseOutput.textContent = `导入识别 ${result.apiCount} 个接口，生成 ${result.caseCount} 条测试用例，请在下方表格查看与操作。`;
      }
      if (aiCaseMessage) {
        aiCaseMessage.textContent = `导入成功，识别 ${result.apiCount} 个接口，生成 ${result.caseCount} 条测试用例。AI参与=true，引擎=${result.aiEngines.join(", ")}`;
      }
      aiExecuteMessage.textContent = `已同步 ${executable.length} 条用例到执行列表`;
    } catch (error) {
      if (aiCaseMessage) {
        aiCaseMessage.textContent = `导入生成失败：${error.message}`;
      }
    }
  });
}

aiSelectAllCasesBtn.addEventListener("click", () => {
  const checkboxes = Array.from(document.querySelectorAll(".ai-case-checkbox"));
  if (checkboxes.length === 0) {
    aiExecuteMessage.textContent = "请先生成测试用例";
    return;
  }
  const allChecked = checkboxes.every((item) => item.checked);
  checkboxes.forEach((item) => {
    item.checked = !allChecked;
  });
});

aiExecuteCasesBtn.addEventListener("click", () => {
  try {
    const selectedIds = Array.from(document.querySelectorAll(".ai-case-checkbox:checked"))
      .map((item) => Number(item.value))
      .filter((item) => Number.isFinite(item));
    if (selectedIds.length === 0) {
      aiExecuteMessage.textContent = "请至少选择一个用例执行";
      return;
    }
    const executeMode = document.querySelector("input[name='aiExecuteMode']:checked")?.value
      || (aiExecuteModeParallel?.checked ? "parallel" : "serial");
    updateExecuteProgress(selectedIds.length, 0, 0);
    const run = executeCases(selectedIds, executeMode);
    aiExecuteOutput.textContent = `执行完成，runId=${run.runId}，结果已结构化展示`;
    aiExecuteMessage.textContent = `执行完成，模式=${executeMode === "parallel" ? "并行" : "串行"}，runId=${run.runId}，通过 ${run.passed}/${run.total}`;
    updateExecuteProgress(run.total, run.passed, run.failed);
    const runs = queryAiResults(run.runId);
    renderAiResults(runs);
    aiResultOutput.textContent = runs.length === 0 ? "暂无执行结果" : `已加载 ${runs.length} 个执行批次`;
    renderExecuteRun(runs[0] || null);
  } catch (error) {
    aiExecuteMessage.textContent = `执行失败：${error.message}`;
  }
});

aiResultQueryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const runId = String(new FormData(aiResultQueryForm).get("runId") || "").trim();
  const runs = queryAiResults(runId);
  renderAiResults(runs);
  aiResultOutput.textContent = runs.length === 0
    ? (runId ? `未找到 runId=${runId} 的执行结果` : "暂无执行结果")
    : `已加载 ${runs.length} 个执行批次`;
  renderExecuteRun(runs[0] || null);
});

if (aiResultStatusFilter) {
  aiResultStatusFilter.addEventListener("change", () => {
    renderAiResults(latestAiResultBatches);
  });
}

aiLoadLatestResultsBtn.addEventListener("click", () => {
  const runs = queryAiResults("");
  renderAiResults(runs);
  aiResultOutput.textContent = runs.length === 0 ? "暂无执行结果" : `已加载 ${runs.length} 个执行批次`;
  renderExecuteRun(runs[0] || null);
});

if (aiCaseTableBody) {
  aiCaseTableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".ai-exec-case-detail");
    if (!button) return;
    const caseId = Number(button.dataset.id);
    const item = latestExecutableCases.find((row) => Number(row.caseId) === caseId);
    if (!item) return;
    openDetailModal(`执行候选详情 · ${item.caseName || caseId}`, buildExecutionDetailHtml(item));
  });
}

if (aiExecuteResultTableBody) {
  aiExecuteResultTableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".ai-exec-result-detail-btn");
    if (!button || !latestExecuteRun) return;
    const caseId = Number(button.dataset.caseId);
    const time = String(button.dataset.time || "");
    const item = (latestExecuteRun.results || []).find((row) => (
      Number(row.caseId) === caseId && String(row.executedAt || "") === time
    )) || (latestExecuteRun.results || []).find((row) => Number(row.caseId) === caseId);
    if (!item) return;
    openDetailModal(`执行详情 · ${item.caseName || caseId}`, buildExecutionDetailHtml(item));
  });
}

if (aiResultTableBody) {
  aiResultTableBody.addEventListener("click", (event) => {
    const button = event.target.closest(".ai-result-detail-btn");
    if (!button) return;
    const caseId = Number(button.dataset.caseId);
    const time = String(button.dataset.time || "");
    const item = latestFilteredAiResults.find((row) => (
      Number(row.caseId) === caseId && String(row.executedAt || "") === time
    )) || latestFilteredAiResults.find((row) => Number(row.caseId) === caseId);
    if (!item) return;
    openDetailModal(`结果详情 · ${item.caseName || caseId}`, buildExecutionDetailHtml(item));
  });
}

if (agentRunForm) {
  agentRunForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToJson(agentRunForm);
    const execution = createExecution("AGENT", data.iVersionName || "长江e号", data.iVersionNumber || "latest", "通过智能体执行（方式1）");
    output(ok("任务已创建", execution));
  });
}

if (queryStatusForm) {
  queryStatusForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const hisId = new FormData(queryStatusForm).get("hisId");
    output(queryStatusByHisId(String(hisId || "")));
  });
}

if (queryResultForm) {
  queryResultForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const hisId = new FormData(queryResultForm).get("hisId");
    output(queryResultByHisId(String(hisId || "")));
  });
}

if (authBtn) {
  authBtn.addEventListener("click", () => {
    output(handleBus("authorization"));
  });
}

if (devopsBatchForm) {
  devopsBatchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToJson(devopsBatchForm);
    output(handleBus("aitest_devops_batch", data.iResource, data.iSysid, data.iSysver));
  });
}

if (latestDevopsStatusBtn) {
  latestDevopsStatusBtn.addEventListener("click", () => {
    output(handleBus("aitest_devops_hisid"));
  });
}

if (latestDevopsResultBtn) {
  latestDevopsResultBtn.addEventListener("click", () => {
    output(handleBus("aitest_devops_detail"));
  });
}

if (queryDevopsByIdForm) {
  queryDevopsByIdForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const hisId = String(new FormData(queryDevopsByIdForm).get("hisId") || "");
    output({
      statusResult: handleBus(`aitest_devops_hisid:${hisId}`),
      detailResult: handleBus(`aitest_devops_detail:${hisId}`)
    });
  });
}

if (busForm) {
  busForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = formToJson(busForm);
    output(handleBus(data.iRequestData, data.iResource, data.iSysid, data.iSysver));
  });
}

if (loadVersionsBtn) {
  loadVersionsBtn.addEventListener("click", () => {
    if (versionResult) {
      versionResult.textContent = JSON.stringify(state.versions, null, 2);
    }
  });
}

if (loadFunctionLookupBtn) {
  loadFunctionLookupBtn.addEventListener("click", () => {
    if (functionLookupResult) {
      functionLookupResult.textContent = JSON.stringify(functionLookup(), null, 2);
    }
  });
}

if (legacyConsoleEnabled) {
  refreshAll();
}
renderAiResults(state.aiRuns);
if (versionResult) {
  versionResult.textContent = JSON.stringify(state.versions, null, 2);
}
if (functionLookupResult) {
  functionLookupResult.textContent = JSON.stringify(functionLookup(), null, 2);
}
if (executionOutput) {
  executionOutput.textContent = "Pages 演示模式已就绪";
}
renderDocRecords([]);
if (aiCaseOutput) {
  aiCaseOutput.textContent = "生成后的测试用例会显示在这里";
}
aiExecuteOutput.textContent = "请选择测试用例并执行，结果将以表格展示。";
aiResultOutput.textContent = state.aiRuns.length === 0 ? "暂无执行结果" : `已加载 ${state.aiRuns.length} 个执行批次`;
if (aiInterfaceGenerationStatus) {
  aiInterfaceGenerationStatus.textContent = "等待生成";
}
updateExecuteProgress(0, 0, 0);
renderExecuteRun(state.aiRuns[0] || null);
renderGeneratedTempRows([]);
renderPublishedCandidates([]);
renderAiInterfaceSaveResults([]);
renderAiInterfaceExecution(null);
activateManageTab("pending");
loadTempCases();
loadExecutableCases();
updateFlowStage("aiDocs");

if (legacyConsoleEnabled) {
  setInterval(refreshAll, 5000);
}
