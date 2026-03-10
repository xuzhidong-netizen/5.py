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

const aiInterfaceFile = document.getElementById("aiInterfaceFile");
const aiInterfaceText = document.getElementById("aiInterfaceText");
const aiInterfaceGenerateBtn = document.getElementById("aiInterfaceGenerateBtn");
const aiInterfaceSelectAllBtn = document.getElementById("aiInterfaceSelectAllBtn");
const aiInterfaceSaveRunBtn = document.getElementById("aiInterfaceSaveRunBtn");
const aiInterfaceTableBody = document.querySelector("#aiInterfaceTable tbody");
const aiInterfaceMessage = document.getElementById("aiInterfaceMessage");
const aiInterfaceOutput = document.getElementById("aiInterfaceOutput");
const aiInterfaceSaveOutput = document.getElementById("aiInterfaceSaveOutput");

const aiDocForm = document.getElementById("aiDocForm");
const aiDocImportFile = document.getElementById("aiDocImportFile");
const aiDocImportText = document.getElementById("aiDocImportText");
const aiDocImportGenerateBtn = document.getElementById("aiDocImportGenerateBtn");
const aiDocMessage = document.getElementById("aiDocMessage");
const aiDocMarkdownOutput = document.getElementById("aiDocMarkdownOutput");
const aiDocOpenApiOutput = document.getElementById("aiDocOpenApiOutput");

const aiCaseForm = document.getElementById("aiCaseForm");
const aiCaseImportFile = document.getElementById("aiCaseImportFile");
const aiCaseImportText = document.getElementById("aiCaseImportText");
const aiCaseImportGenerateBtn = document.getElementById("aiCaseImportGenerateBtn");
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
let latestDocImportedFormat = "auto";
let latestCaseImportedFormat = "auto";
let latestAiInterfaceRows = [];
let latestAiInterfaceGeneration = null;

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

function renderAiInterfaceCandidates(candidates) {
  aiInterfaceTableBody.innerHTML = candidates.map((item) => `
    <tr>
      <td><input type="checkbox" class="ai-interface-checkbox" value="${item.candidateId}" ${item.valid ? "checked" : "disabled"}></td>
      <td>${item.source || "-"}</td>
      <td>${item.sysId || "-"}</td>
      <td>${item.funcNo || "-"}</td>
      <td>${item.funcName || "-"}</td>
      <td>${item.caseId ?? "-"}</td>
      <td>${item.caseName || "-"}</td>
      <td>${item.moduleName || "-"}</td>
      <td>${item.valid ? "可入库" : "不可入库"}</td>
      <td>${item.validationMessage || "-"}</td>
    </tr>
  `).join("");
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

function saveAiInterfaceGeneration(generation, candidateIds, autoExecute = true) {
  const selectedSet = new Set(candidateIds || []);
  const selectedCandidates = (generation?.candidates || []).filter((item) => selectedSet.has(item.candidateId));
  if (selectedCandidates.length === 0) {
    throw new Error("未选中可入库候选案例");
  }

  const items = [];
  let functionCreatedCount = 0;
  let caseCreatedCount = 0;
  selectedCandidates.forEach((candidate) => {
    if (!candidate.valid) {
      items.push({
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
        items.push({
          candidateId: candidate.candidateId,
          funcNo: candidate.funcNo,
          caseId: candidate.caseId,
          caseName: candidate.caseName,
          success: false,
          message: `接口入库失败：${functionResult.msg}`
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
      moduleName: candidate.moduleName
    });

    if (caseResult.code === 200) {
      caseCreatedCount += 1;
      items.push({
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
      items.push({
        candidateId: candidate.candidateId,
        funcNo: candidate.funcNo,
        caseId: candidate.caseId,
        caseName: candidate.caseName,
        success: false,
        functionCreated,
        message: `案例入库失败：${caseResult.msg}`
      });
    }
  });

  let execution = null;
  let executionHisId = null;
  if (autoExecute && caseCreatedCount > 0) {
    execution = createExecution("AGENT", "AI接口自动化", "latest", "AI生成接口案例自动入库触发执行");
    executionHisId = execution.hisId;
  }

  return {
    generationId: generation?.generationId || "",
    selectedCount: selectedCandidates.length,
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
  try {
    latestAiInterfaceGeneration = generateAiInterfaceCandidates(latestAiInterfaceRows, textInput);
    renderAiInterfaceCandidates(latestAiInterfaceGeneration.candidates || []);
    aiInterfaceOutput.textContent = JSON.stringify(latestAiInterfaceGeneration, null, 2);
    aiInterfaceMessage.textContent = `AI候选案例生成成功，候选 ${latestAiInterfaceGeneration.candidates.length} 条，AI引擎=${latestAiInterfaceGeneration.aiEngine}`;
  } catch (error) {
    aiInterfaceMessage.textContent = `生成失败：${error.message}`;
  }
});

aiInterfaceSelectAllBtn.addEventListener("click", () => {
  const checkboxes = Array.from(document.querySelectorAll(".ai-interface-checkbox:not([disabled])"));
  if (checkboxes.length === 0) {
    aiInterfaceMessage.textContent = "当前没有可选候选案例";
    return;
  }
  const allChecked = checkboxes.every((item) => item.checked);
  checkboxes.forEach((item) => {
    item.checked = !allChecked;
  });
});

aiInterfaceSaveRunBtn.addEventListener("click", () => {
  if (!latestAiInterfaceGeneration) {
    aiInterfaceMessage.textContent = "请先执行AI生成";
    return;
  }
  const selectedIds = Array.from(document.querySelectorAll(".ai-interface-checkbox:checked"))
    .map((item) => item.value)
    .filter((item) => item);
  if (selectedIds.length === 0) {
    aiInterfaceMessage.textContent = "请至少勾选一个候选案例";
    return;
  }
  try {
    const result = saveAiInterfaceGeneration(latestAiInterfaceGeneration, selectedIds, true);
    aiInterfaceSaveOutput.textContent = JSON.stringify(result, null, 2);
    const hisId = result.executionHisId ? `，已触发执行 hisId=${result.executionHisId}` : "";
    aiInterfaceMessage.textContent = `入库完成，接口新增 ${result.functionCreatedCount}，案例新增 ${result.caseCreatedCount}${hisId}`;
    if (result.execution) {
      output(ok("AI生成接口案例自动执行已触发", result.execution));
    }
  } catch (error) {
    aiInterfaceMessage.textContent = `入库执行失败：${error.message}`;
  }
});

aiDocForm.addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    const definition = buildApiDefinition(aiDocForm);
    const docs = generateDocs(definition);
    aiDocMessage.textContent = `接口文档生成成功。AI参与=${docs.aiParticipated === true}，引擎=${docs.aiEngine}`;
    aiDocMarkdownOutput.textContent = docs.markdown;
    aiDocOpenApiOutput.textContent = JSON.stringify({
      aiParticipated: docs.aiParticipated,
      aiEngine: docs.aiEngine,
      remoteLlmConfigured: docs.remoteLlmConfigured,
      remoteLlmUsed: docs.remoteLlmUsed,
      openApi: docs.openApi
    }, null, 2);
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
    aiDocMarkdownOutput.textContent = documents.map((item, index) => `### [${index + 1}] ${item.apiName}\n\n${item.markdown}`).join("\n\n---\n\n");
    aiDocOpenApiOutput.textContent = JSON.stringify(result, null, 2);
    aiDocMessage.textContent = `导入成功，识别 ${result.apiCount} 个接口并完成文档生成。AI参与=true，引擎=${result.aiEngines.join(", ")}`;
  } catch (error) {
    aiDocMessage.textContent = `导入生成失败：${error.message}`;
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

aiCaseImportFile.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    aiCaseImportText.value = text;
    latestCaseImportedFormat = detectDocFormatByFileName(file.name);
    aiCaseMessage.textContent = `已导入文档文件：${file.name}`;
  } catch (error) {
    aiCaseMessage.textContent = `读取文件失败：${error.message}`;
  }
});

aiCaseImportGenerateBtn.addEventListener("click", () => {
  const content = String(aiCaseImportText.value || "").trim();
  if (!content) {
    aiCaseMessage.textContent = "请先粘贴或导入接口文档";
    return;
  }
  try {
    const definitions = parseDefinitionsFromImportedDoc(content, latestCaseImportedFormat);
    if (definitions.length === 0) {
      throw new Error("导入文档未识别到可用接口定义");
    }
    latestGeneratedCases = definitions.flatMap((definition) => generateCases(definition));
    persist();
    renderAiCases(latestGeneratedCases);
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
    aiCaseOutput.textContent = JSON.stringify(result, null, 2);
    aiCaseMessage.textContent = `导入成功，识别 ${result.apiCount} 个接口，生成 ${result.caseCount} 条测试用例。AI参与=true，引擎=${result.aiEngines.join(", ")}`;
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
aiInterfaceOutput.textContent = "请先导入Excel/CSV或输入文本，然后执行AI生成";
aiInterfaceSaveOutput.textContent = "勾选候选案例后可确认入库并自动执行";

setInterval(refreshAll, 5000);
