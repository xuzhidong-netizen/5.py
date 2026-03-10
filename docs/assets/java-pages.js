const storageKey = "java-pages-platform-state-v2";

const menu = document.getElementById("menu");
const panels = Array.from(document.querySelectorAll(".panel"));

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

const aiDocForm = document.getElementById("aiDocForm");
const aiDocMessage = document.getElementById("aiDocMessage");
const aiDocMarkdownOutput = document.getElementById("aiDocMarkdownOutput");
const aiDocOpenApiOutput = document.getElementById("aiDocOpenApiOutput");

const aiCaseForm = document.getElementById("aiCaseForm");
const aiImportFile = document.getElementById("aiImportFile");
const aiImportText = document.getElementById("aiImportText");
const aiImportGenerateBtn = document.getElementById("aiImportGenerateBtn");
const aiCaseMessage = document.getElementById("aiCaseMessage");
const aiCaseOutput = document.getElementById("aiCaseOutput");
const aiCaseTableBody = document.querySelector("#aiCaseTable tbody");

const aiSelectAllCasesBtn = document.getElementById("aiSelectAllCasesBtn");
const aiExecuteCasesBtn = document.getElementById("aiExecuteCasesBtn");
const aiExecuteMessage = document.getElementById("aiExecuteMessage");
const aiExecuteOutput = document.getElementById("aiExecuteOutput");

const aiResultQueryForm = document.getElementById("aiResultQueryForm");
const aiLoadLatestResultsBtn = document.getElementById("aiLoadLatestResultsBtn");
const aiRunTableBody = document.querySelector("#aiRunTable tbody");
const aiResultTableBody = document.querySelector("#aiResultTable tbody");
const aiResultOutput = document.getElementById("aiResultOutput");

const defaultState = {
  nextFunctionId: 1001,
  nextCaseRecordId: 100001,
  nextAiCaseId: 200001,
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
  aiRuns: [],
  authorization: ""
};

let state = loadState();
let latestGeneratedCases = [];
let latestImportedFormat = "auto";

menu.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-panel]");
  if (!button) return;
  const panelId = button.dataset.panel;
  menu.querySelectorAll("button[data-panel]").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === panelId));
});

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

function executeCases(selectedIds) {
  const caseSet = new Set(selectedIds.map((item) => Number(item)));
  const selectedCases = latestGeneratedCases.filter((item) => caseSet.has(Number(item.caseId)));
  if (selectedCases.length === 0) {
    throw new Error("未找到可执行测试用例");
  }
  const results = selectedCases.map((item) => ({
    caseId: item.caseId,
    caseName: item.caseName,
    status: item.caseType === "invalid" ? "FAILED" : "PASSED",
    resultMessage: item.caseType === "invalid" ? "参数非法，命中异常场景" : "执行成功，已接入任务执行链",
    executedAt: nowText()
  }));
  const passed = results.filter((item) => item.status === "PASSED").length;
  const run = {
    runId: generateRunId(),
    status: passed === results.length ? "PASSED" : "FAILED",
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
  aiCaseTableBody.innerHTML = cases.map((item) => `
    <tr>
      <td><input type="checkbox" class="ai-case-checkbox" value="${item.caseId}" checked></td>
      <td>${item.caseId}</td>
      <td>${item.caseName}</td>
      <td>${item.caseType}</td>
      <td>${item.status}</td>
      <td>${item.source}</td>
    </tr>
  `).join("");
}

function renderAiResults(runs) {
  aiRunTableBody.innerHTML = runs.map((item) => `
    <tr>
      <td>${item.runId}</td>
      <td>${item.status}</td>
      <td>${item.total}</td>
      <td>${item.passed}</td>
      <td>${item.failed}</td>
      <td>${item.executedAt}</td>
    </tr>
  `).join("");

  const selected = runs[0];
  const details = selected ? selected.results : [];
  aiResultTableBody.innerHTML = details.map((item) => `
    <tr>
      <td>${item.caseId}</td>
      <td>${item.caseName}</td>
      <td>${item.status}</td>
      <td>${item.resultMessage}</td>
      <td>${item.executedAt}</td>
    </tr>
  `).join("");
}

function refreshAll() {
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
  executionOutput.textContent = JSON.stringify(result, null, 2);
}

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
    createdAt: nowText()
  };
  state.cases.push(record);
  persist();
  refreshAll();
  return ok("案例新增成功", record);
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

functionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = submitFunction(formToJson(functionForm));
  functionMessage.textContent = result.code === 200 ? `${result.msg}，ID=${result.data?.id ?? "-"}` : result.msg;
  output(result);
});

caseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = submitCase(formToJson(caseForm));
  caseMessage.textContent = result.code === 200 ? `${result.msg}，ID=${result.data?.id ?? "-"}` : result.msg;
  output(result);
});

aiDocForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const definition = buildApiDefinition(aiDocForm);
    const docs = generateDocs(definition);
    aiDocMessage.textContent = "接口文档生成成功";
    aiDocMarkdownOutput.textContent = docs.markdown;
    aiDocOpenApiOutput.textContent = JSON.stringify(docs.openApi, null, 2);
  } catch (error) {
    aiDocMessage.textContent = `接口文档生成失败：${error.message}`;
  }
});

aiCaseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const definition = buildApiDefinition(aiCaseForm);
    latestGeneratedCases = generateCases(definition);
    persist();
    renderAiCases(latestGeneratedCases);
    aiCaseOutput.textContent = JSON.stringify(latestGeneratedCases, null, 2);
    aiCaseMessage.textContent = `生成成功，共 ${latestGeneratedCases.length} 条测试用例`;
    aiExecuteMessage.textContent = `已同步 ${latestGeneratedCases.length} 条用例到执行列表`;
  } catch (error) {
    aiCaseMessage.textContent = `测试用例生成失败：${error.message}`;
  }
});

aiImportFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    aiImportText.value = text;
    latestImportedFormat = detectDocFormatByFileName(file.name);
    aiCaseMessage.textContent = `已导入文档文件：${file.name}`;
  } catch (error) {
    aiCaseMessage.textContent = `读取文件失败：${error.message}`;
  }
});

aiImportGenerateBtn.addEventListener("click", () => {
  const content = String(aiImportText.value || "").trim();
  if (!content) {
    aiCaseMessage.textContent = "请先粘贴或导入接口文档";
    return;
  }
  try {
    const definitions = parseDefinitionsFromImportedDoc(content, latestImportedFormat);
    if (definitions.length === 0) {
      throw new Error("导入文档未识别到可用接口定义");
    }
    latestGeneratedCases = definitions.flatMap((definition) => generateCases(definition));
    persist();
    renderAiCases(latestGeneratedCases);
    const result = {
      apiCount: definitions.length,
      caseCount: latestGeneratedCases.length,
      apiDefinitions: definitions,
      generatedCases: latestGeneratedCases
    };
    aiCaseOutput.textContent = JSON.stringify(result, null, 2);
    aiCaseMessage.textContent = `导入成功，识别 ${result.apiCount} 个接口，生成 ${result.caseCount} 条测试用例`;
    aiExecuteMessage.textContent = `已同步 ${latestGeneratedCases.length} 条用例到执行列表`;
  } catch (error) {
    aiCaseMessage.textContent = `导入生成失败：${error.message}`;
  }
});

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
    const run = executeCases(selectedIds);
    aiExecuteOutput.textContent = JSON.stringify(run, null, 2);
    aiExecuteMessage.textContent = `执行完成，runId=${run.runId}，通过 ${run.passed}/${run.total}`;
    const runs = queryAiResults(run.runId);
    renderAiResults(runs);
    aiResultOutput.textContent = JSON.stringify(runs, null, 2);
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
    : JSON.stringify(runs, null, 2);
});

aiLoadLatestResultsBtn.addEventListener("click", () => {
  const runs = queryAiResults("");
  renderAiResults(runs);
  aiResultOutput.textContent = runs.length === 0 ? "暂无执行结果" : JSON.stringify(runs, null, 2);
});

agentRunForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = formToJson(agentRunForm);
  const execution = createExecution("AGENT", data.iVersionName || "长江e号", data.iVersionNumber || "latest", "通过智能体执行（方式1）");
  output(ok("任务已创建", execution));
});

queryStatusForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const hisId = new FormData(queryStatusForm).get("hisId");
  output(queryStatusByHisId(String(hisId || "")));
});

queryResultForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const hisId = new FormData(queryResultForm).get("hisId");
  output(queryResultByHisId(String(hisId || "")));
});

authBtn.addEventListener("click", () => {
  output(handleBus("authorization"));
});

devopsBatchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = formToJson(devopsBatchForm);
  output(handleBus("aitest_devops_batch", data.iResource, data.iSysid, data.iSysver));
});

latestDevopsStatusBtn.addEventListener("click", () => {
  output(handleBus("aitest_devops_hisid"));
});

latestDevopsResultBtn.addEventListener("click", () => {
  output(handleBus("aitest_devops_detail"));
});

queryDevopsByIdForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const hisId = String(new FormData(queryDevopsByIdForm).get("hisId") || "");
  output({
    statusResult: handleBus(`aitest_devops_hisid:${hisId}`),
    detailResult: handleBus(`aitest_devops_detail:${hisId}`)
  });
});

busForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = formToJson(busForm);
  output(handleBus(data.iRequestData, data.iResource, data.iSysid, data.iSysver));
});

loadVersionsBtn.addEventListener("click", () => {
  versionResult.textContent = JSON.stringify(state.versions, null, 2);
});

loadFunctionLookupBtn.addEventListener("click", () => {
  functionLookupResult.textContent = JSON.stringify(functionLookup(), null, 2);
});

refreshAll();
renderAiResults(state.aiRuns);
versionResult.textContent = JSON.stringify(state.versions, null, 2);
functionLookupResult.textContent = JSON.stringify(functionLookup(), null, 2);
executionOutput.textContent = "Pages 演示模式已就绪";
aiDocMarkdownOutput.textContent = "提交接口定义后自动生成 Markdown 文档";
aiDocOpenApiOutput.textContent = "提交接口定义后自动生成 OpenAPI JSON";
aiCaseOutput.textContent = "生成后的测试用例会显示在这里";
aiExecuteOutput.textContent = "请选择测试用例并执行";
aiResultOutput.textContent = state.aiRuns.length === 0 ? "暂无执行结果" : JSON.stringify(state.aiRuns, null, 2);

setInterval(refreshAll, 5000);
