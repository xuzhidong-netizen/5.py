const storageKey = "java-pages-platform-state-v1";

const menu = document.getElementById("menu");
const panels = Array.from(document.querySelectorAll(".panel"));

const summaryCards = document.getElementById("summaryCards");
const functionTableBody = document.querySelector("#functionTable tbody");
const caseTableBody = document.querySelector("#caseTable tbody");
const executionTableBody = document.querySelector("#executionTable tbody");

const functionForm = document.getElementById("functionForm");
const caseForm = document.getElementById("caseForm");
const aiGenerateForm = document.getElementById("aiGenerateForm");
const aiExecuteBtn = document.getElementById("aiExecuteBtn");
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
const aiGenerateMessage = document.getElementById("aiGenerateMessage");
const aiGenerateOutput = document.getElementById("aiGenerateOutput");

const defaultState = {
  nextFunctionId: 1001,
  nextCaseRecordId: 100001,
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
  authorization: ""
};

let state = loadState();
let latestGeneratedTestCases = [];

menu.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const panelId = button.dataset.panel;
  menu.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
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

function nextGeneratedCaseId() {
  const date = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const base = `${String(date.getFullYear()).slice(2)}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  const suffix = String(Math.floor(Math.random() * 900 + 100));
  return Number(`${base}${suffix}`);
}

function parseJsonArrayText(text, fieldName) {
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

function generateApiTestCases(data) {
  const requestParams = parseJsonArrayText(data.requestParams, "requestParams");
  const responseParams = parseJsonArrayText(data.responseParams || "[]", "responseParams");
  const prompt = `根据接口定义生成测试用例：apiName=${data.apiName}, apiPath=${data.apiPath}, method=${data.method}, requestParams=${JSON.stringify(requestParams)}, responseParams=${JSON.stringify(responseParams)}`;

  const buildRequestBody = (type) => {
    const payload = {};
    requestParams.forEach((item) => {
      const key = item.name || "field";
      if (type === "invalid") {
        payload[key] = "";
      } else if (item.example !== undefined && item.example !== null && String(item.example).trim()) {
        payload[key] = item.example;
      } else {
        payload[key] = "sample";
      }
    });
    return JSON.stringify(payload);
  };

  const base = [
    {
      caseName: `${data.apiName}_正常场景`,
      caseType: "normal",
      requestBody: buildRequestBody("normal"),
      expectedResult: "接口返回成功",
      checkRule: "status=200 且业务成功"
    },
    {
      caseName: `${data.apiName}_边界场景`,
      caseType: "boundary",
      requestBody: buildRequestBody("boundary"),
      expectedResult: "边界参数处理正确",
      checkRule: "status=200 且字段边界合法"
    },
    {
      caseName: `${data.apiName}_异常场景`,
      caseType: "invalid",
      requestBody: buildRequestBody("invalid"),
      expectedResult: "错误码符合预期",
      checkRule: "status=4xx/业务错误码符合定义"
    }
  ];

  latestGeneratedTestCases = base.map((item) => ({
    caseId: nextGeneratedCaseId(),
    apiName: data.apiName,
    apiPath: data.apiPath,
    method: data.method,
    caseName: item.caseName,
    caseType: item.caseType,
    requestBody: item.requestBody,
    expectedResult: item.expectedResult,
    checkRule: item.checkRule,
    status: "NEW",
    source: "AI"
  }));

  return {
    model: "RuleBased-LLM-Adapter",
    prompt,
    generatedCases: latestGeneratedTestCases
  };
}

function executeGeneratedTestCases() {
  if (latestGeneratedTestCases.length === 0) {
    return fail("请先生成测试用例");
  }
  return latestGeneratedTestCases.map((item) => ({
    caseId: item.caseId,
    caseName: item.caseName,
    status: item.requestBody && item.requestBody !== "{}" ? "PASSED" : "FAILED",
    resultMessage: item.requestBody && item.requestBody !== "{}" ? "执行成功，已接入任务执行链" : "请求体为空，执行失败",
    executedAt: nowText()
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

aiGenerateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const result = generateApiTestCases(formToJson(aiGenerateForm));
    aiGenerateOutput.textContent = JSON.stringify(result, null, 2);
    aiGenerateMessage.textContent = `生成成功，共 ${result.generatedCases.length} 条测试用例`;
  } catch (error) {
    aiGenerateMessage.textContent = `AI生成失败：${error.message}`;
  }
});

aiExecuteBtn.addEventListener("click", () => {
  const result = executeGeneratedTestCases();
  aiGenerateOutput.textContent = JSON.stringify(result, null, 2);
  if (Array.isArray(result)) {
    aiGenerateMessage.textContent = `执行完成，共 ${result.length} 条结果`;
  } else {
    aiGenerateMessage.textContent = result.msg;
  }
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
versionResult.textContent = JSON.stringify(state.versions, null, 2);
functionLookupResult.textContent = JSON.stringify(functionLookup(), null, 2);
executionOutput.textContent = "Pages 演示模式已就绪";
aiGenerateOutput.textContent = "输入接口定义后点击“AI生成测试用例”";
setInterval(refreshAll, 5000);
