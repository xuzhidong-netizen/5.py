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
const aiInterfaceDeleteBtn = document.getElementById("aiInterfaceDeleteBtn");
const aiInterfaceRegenerateBtn = document.getElementById("aiInterfaceRegenerateBtn");
const aiInterfaceReloadBtn = document.getElementById("aiInterfaceReloadBtn");
const aiInterfaceFilterKeyword = document.getElementById("aiInterfaceFilterKeyword");
const aiInterfaceFilterStatus = document.getElementById("aiInterfaceFilterStatus");
const aiInterfaceStats = document.getElementById("aiInterfaceStats");
const aiGeneratedTempTableBody = document.querySelector("#aiGeneratedTempTable tbody");
const aiInterfaceTableBody = document.querySelector("#aiInterfaceTable tbody");
const aiInterfaceSaveTableBody = document.querySelector("#aiInterfaceSaveTable tbody");
const aiInterfaceExecutionTableBody = document.querySelector("#aiInterfaceExecutionTable tbody");
const aiInterfaceMessage = document.getElementById("aiInterfaceMessage");
const aiPreCaseMessage = document.getElementById("aiPreCaseMessage");

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

let latestGeneratedCases = [];
let latestExecutableCases = [];
let latestDocImportedFormat = "auto";
let latestCaseImportedFormat = "auto";
let latestAiInterfaceRows = [];
let latestAiInterfaceGenerationId = "";
let latestAiInterfaceCandidates = [];
let latestAiInterfaceSaveItems = [];
const aiInterfaceEditState = new Map();

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
    if (panelId === "aiExecute") {
        loadExecutableCases().catch(() => {
            aiExecuteMessage.textContent = "加载可执行用例失败";
        });
    }
    if (panelId === "aiResults") {
        loadAiResults().catch(() => {
            aiResultOutput.textContent = "加载执行结果失败";
        });
    }
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
    if (lower.endsWith(".yaml") || lower.endsWith(".yml")) {
        return "yaml";
    }
    if (lower.endsWith(".json")) {
        return "json";
    }
    return "auto";
}

function parseDelimitedRows(text, delimiter) {
    const lines = String(text || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    if (lines.length < 2) {
        return [];
    }
    const headers = lines[0].split(delimiter).map((item) => item.trim());
    if (headers.every((item) => !item)) {
        return [];
    }
    const rows = [];
    for (let i = 1; i < lines.length; i += 1) {
        const values = lines[i].split(delimiter);
        const row = {};
        headers.forEach((header, index) => {
            if (!header) {
                return;
            }
            row[header] = String(values[index] ?? "").trim();
        });
        if (Object.keys(row).length > 0) {
            rows.push(row);
        }
    }
    return rows;
}

async function parseAiInterfaceFile(file) {
    const name = String(file?.name || "").toLowerCase();
    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        if (!window.XLSX || typeof window.XLSX.read !== "function") {
            throw new Error("Excel解析器未加载，请刷新页面后重试");
        }
        const buffer = await file.arrayBuffer();
        const workbook = window.XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return { rows: [], text: "" };
        }
        const sheet = workbook.Sheets[sheetName];
        return {
            rows: window.XLSX.utils.sheet_to_json(sheet, { defval: "" }),
            text: ""
        };
    }

    const text = await file.text();
    if (name.endsWith(".csv")) {
        return {
            rows: parseDelimitedRows(text, text.includes("\t") ? "\t" : ","),
            text
        };
    }
    if (name.endsWith(".json")) {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) {
                return {
                    rows: parsed.filter((item) => item && typeof item === "object"),
                    text
                };
            }
            if (parsed && typeof parsed === "object") {
                return {
                    rows: [parsed],
                    text
                };
            }
        } catch (error) {
            throw new Error(`JSON解析失败：${error.message}`);
        }
    }
    return { rows: [], text };
}

function renderAiInterfaceCandidates(candidates) {
    const visibleCandidates = filterAiInterfaceCandidates(candidates);
    aiInterfaceTableBody.innerHTML = visibleCandidates.map((item) => `
      <tr>
        <td>
            <input
                type="checkbox"
                class="ai-interface-checkbox"
                value="${item.tempId}"
                ${item.valid === false ? "disabled" : ""}
                ${item.selected ? "checked" : ""}
            >
        </td>
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
        <td>${item.status === 1 ? "已入库" : "未入库"}<br>${item.validationMessage || item.statusMessage || "-"}</td>
        <td>
            <div class="table-actions">
                <button type="button" class="table-btn ai-interface-action" data-action="adopt" data-id="${item.tempId}" ${item.status === 1 || item.valid === false ? "disabled" : ""}>${item.valid === false ? "不可采纳" : "采纳入库"}</button>
                <button type="button" class="table-btn table-btn-secondary ai-interface-action" data-action="edit" data-id="${item.tempId}" ${item.status === 1 ? "disabled" : ""}>${aiInterfaceEditState.get(item.tempId) ? "完成" : "修改"}</button>
                <button type="button" class="table-btn table-btn-danger ai-interface-action" data-action="delete" data-id="${item.tempId}" ${item.status === 1 ? "disabled" : ""}>删除</button>
            </div>
        </td>
      </tr>
    `).join("");
    renderAiInterfaceStats(candidates);
}

function filterAiInterfaceCandidates(candidates) {
    const keyword = String(aiInterfaceFilterKeyword?.value || "").trim().toLowerCase();
    const status = String(aiInterfaceFilterStatus?.value || "all");
    return (candidates || []).filter((item) => {
        if (status === "pending" && item.status !== 0) {
            return false;
        }
        if (status === "stored" && item.status !== 1) {
            return false;
        }
        if (status === "valid" && !item.valid) {
            return false;
        }
        if (status === "invalid" && item.valid) {
            return false;
        }
        if (status === "selected" && !item.selected) {
            return false;
        }
        if (!keyword) {
            return true;
        }
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
    if (!aiInterfaceStats) {
        return;
    }
    const total = (candidates || []).length;
    const pending = (candidates || []).filter((item) => item.status === 0).length;
    const stored = (candidates || []).filter((item) => item.status === 1).length;
    const valid = (candidates || []).filter((item) => item.valid && item.status === 0).length;
    const selected = (candidates || []).filter((item) => item.selected).length;
    const invalid = pending - valid;
    aiInterfaceStats.textContent = `预生成总数: ${total} | 未入库: ${pending} | 已入库: ${stored} | 可入库: ${valid} | 不可入库: ${invalid} | 已采纳: ${selected}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

function setButtonBusy(button, busy, busyText) {
    if (!button) {
        return;
    }
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

async function loadTempCases() {
    const result = await http("/api/ai/interface-cases/temp");
    const rows = Array.isArray(result.data) ? result.data : [];
    const selectedSet = new Set(
        latestAiInterfaceCandidates
            .filter((item) => item.selected)
            .map((item) => Number(item.tempId))
            .filter((item) => Number.isFinite(item))
    );
    latestAiInterfaceCandidates = rows.map((item) => {
        validateAiInterfaceCandidate(item);
        return {
            ...item,
            selected: selectedSet.has(Number(item.tempId))
        };
    });
    renderAiInterfaceCandidates(latestAiInterfaceCandidates);
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

async function http(path, options = {}) {
    const response = await fetch(path, {
        headers: { "Content-Type": "application/json" },
        ...options
    });
    let payload = null;
    try {
        payload = await response.json();
    } catch (error) {
        throw new Error(`响应解析失败: ${error.message}`);
    }
    if (!response.ok) {
        throw new Error(payload?.message || `HTTP ${response.status}`);
    }
    if (payload && typeof payload.code === "number" && payload.code !== 200) {
        throw new Error(payload.msg || "业务处理失败");
    }
    return payload;
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
        <td>${item.caseName || "-"}</td>
        <td>${item.caseType || "-"}</td>
        <td>${item.status || "-"}</td>
        <td>${item.source || "-"}</td>
      </tr>
    `).join("");
}

async function loadExecutableCases() {
    const rows = await http("/api/execute-cases");
    latestExecutableCases = Array.isArray(rows) ? rows : [];
    renderAiCases(latestExecutableCases);
    return latestExecutableCases;
}

function renderAiResults(batches) {
    aiRunTableBody.innerHTML = batches.map((item) => `
      <tr>
        <td>${item.runId}</td>
        <td>${item.status}</td>
        <td>${item.total}</td>
        <td>${item.passed}</td>
        <td>${item.failed}</td>
        <td>${item.executedAt || "-"}</td>
      </tr>
    `).join("");

    const selected = batches[0];
    const results = selected?.results || [];
    aiResultTableBody.innerHTML = results.map((item) => `
      <tr>
        <td>${item.caseId ?? "-"}</td>
        <td>${item.caseName || "-"}</td>
        <td>${item.status || "-"}</td>
        <td>${item.resultMessage || "-"}</td>
        <td>${item.executedAt || "-"}</td>
      </tr>
    `).join("");
}

async function refreshAll() {
    const [summary, functions, cases, executions] = await Promise.all([
        http("/api/summary"),
        http("/api/functions"),
        http("/api/cases"),
        http("/api/executions")
    ]);
    renderSummary(summary);
    renderFunctions(functions);
    renderCases(cases);
    renderExecutions(executions);
}

async function loadAiResults(runId = "") {
    const path = runId ? `/api/results?runId=${encodeURIComponent(runId)}` : "/api/results";
    const result = await http(path);
    renderAiResults(result);
    aiResultOutput.textContent = JSON.stringify(result, null, 2);
    return result;
}

functionForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const result = await http("/api/functions", {
            method: "POST",
            body: JSON.stringify(formToJson(functionForm))
        });
        functionMessage.textContent = `${result.msg}，ID=${result.data?.id ?? "-"}`;
        await refreshAll();
    } catch (error) {
        functionMessage.textContent = `接口新增失败：${error.message}`;
    }
});

caseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = formToJson(caseForm);
    data.caseId = Number(data.caseId);
    data.runFlag = "1";
    try {
        const result = await http("/api/cases", {
            method: "POST",
            body: JSON.stringify(data)
        });
        caseMessage.textContent = `${result.msg}，ID=${result.data?.id ?? "-"}`;
        await refreshAll();
    } catch (error) {
        caseMessage.textContent = `案例新增失败：${error.message}`;
    }
});

aiInterfaceTableBody.addEventListener("input", (event) => {
    const input = event.target.closest(".ai-interface-field");
    if (!input) {
        return;
    }
    const tempId = Number(input.dataset.id);
    const field = input.dataset.field;
    const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
    if (!candidate || !field) {
        return;
    }
    const value = input.value;
    candidate[field] = field === "caseId"
        ? (String(value).trim() === "" ? "" : Number(value))
        : value;
    validateAiInterfaceCandidate(candidate);
    renderAiInterfaceStats(latestAiInterfaceCandidates);
});

aiInterfaceTableBody.addEventListener("change", (event) => {
    const checkbox = event.target.closest(".ai-interface-checkbox");
    if (!checkbox) {
        return;
    }
    const tempId = Number(checkbox.value);
    const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
    if (!candidate) {
        return;
    }
    candidate.selected = checkbox.checked && candidate.valid;
    renderAiInterfaceStats(latestAiInterfaceCandidates);
});

async function updateTempCase(candidate) {
    const payload = {
        tempId: candidate.tempId,
        sysId: candidate.sysId,
        sysName: candidate.sysName,
        funcNo: candidate.funcNo,
        funcName: candidate.funcName,
        funcType: candidate.funcType,
        subFuncType: candidate.subFuncType,
        funcParamMatch: candidate.funcParamMatch,
        funcHttpUrl: candidate.funcHttpUrl,
        funcRequestMethod: candidate.funcRequestMethod,
        funcRemark: candidate.funcRemark,
        caseId: Number.isFinite(Number(candidate.caseId)) ? Number(candidate.caseId) : null,
        caseName: candidate.caseName,
        caseType: candidate.caseType,
        runFlag: candidate.runFlag,
        caseKvBase: candidate.caseKvBase,
        caseKvDynamic: candidate.caseKvDynamic,
        caseCheckFunction: candidate.caseCheckFunction,
        moduleName: candidate.moduleName,
        caseRemark: candidate.caseRemark,
        businessGoal: candidate.businessGoal,
        scenario: candidate.scenario
    };
    const result = await http("/api/ai/interface-cases/temp/update", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return result.data;
}

function collectSelectedTempIds() {
    return latestAiInterfaceCandidates
        .filter((item) => item.selected && item.valid && item.status === 0)
        .map((item) => Number(item.tempId))
        .filter((item) => Number.isFinite(item));
}

async function deleteTempCases(tempIds) {
    await http("/api/ai/interface-cases/temp/delete", {
        method: "POST",
        body: JSON.stringify({ tempIds })
    });
}

aiInterfaceTableBody.addEventListener("click", async (event) => {
    const button = event.target.closest(".ai-interface-action");
    if (!button) {
        return;
    }
    const action = button.dataset.action;
    const tempId = Number(button.dataset.id);
    const candidate = latestAiInterfaceCandidates.find((item) => Number(item.tempId) === tempId);
    if (!candidate) {
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
        setButtonBusy(button, true, "入库中...");
        try {
            const result = await http("/api/ai/interface-cases/temp/store", {
                method: "POST",
                body: JSON.stringify({
                    generationId: latestAiInterfaceGenerationId,
                    tempIds: [tempId],
                    autoExecute: false
                })
            });
            const data = result.data || {};
            latestAiInterfaceSaveItems = Array.isArray(data.items) ? data.items : [];
            renderAiInterfaceSaveResults(latestAiInterfaceSaveItems);
            renderAiInterfaceExecution(null);
            await loadTempCases();
            await loadExecutableCases();
            await refreshAll();
            aiPreCaseMessage.textContent = `${result.msg}，已采纳入库 tempId=${tempId}，可前往“用例执行”执行`;
        } catch (error) {
            aiPreCaseMessage.textContent = `采纳入库失败：${error.message}`;
        } finally {
            setButtonBusy(button, false);
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
        setButtonBusy(button, true, "保存中...");
        try {
            validateAiInterfaceCandidate(candidate);
            if (!candidate.valid) {
                aiPreCaseMessage.textContent = "必填字段不完整，无法保存修改";
                return;
            }
            const updated = await updateTempCase(candidate);
            const index = latestAiInterfaceCandidates.findIndex((item) => Number(item.tempId) === tempId);
            if (index >= 0 && updated) {
                latestAiInterfaceCandidates[index] = {
                    ...updated,
                    selected: latestAiInterfaceCandidates[index].selected
                };
                validateAiInterfaceCandidate(latestAiInterfaceCandidates[index]);
            }
            aiPreCaseMessage.textContent = `tempId=${tempId} 修改成功`;
        } catch (error) {
            aiPreCaseMessage.textContent = `修改失败：${error.message}`;
        } finally {
            aiInterfaceEditState.set(tempId, false);
            setButtonBusy(button, false);
            renderAiInterfaceCandidates(latestAiInterfaceCandidates);
        }
        return;
    }

    if (action === "delete") {
        setButtonBusy(button, true, "删除中...");
        try {
            await deleteTempCases([tempId]);
            latestAiInterfaceCandidates = latestAiInterfaceCandidates.filter((item) => Number(item.tempId) !== tempId);
            aiInterfaceEditState.delete(tempId);
            renderAiInterfaceCandidates(latestAiInterfaceCandidates);
            aiPreCaseMessage.textContent = `tempId=${tempId} 已删除`;
        } catch (error) {
            aiPreCaseMessage.textContent = `删除失败：${error.message}`;
        } finally {
            setButtonBusy(button, false);
        }
    }
});

aiInterfaceFilterKeyword.addEventListener("input", () => {
    renderAiInterfaceCandidates(latestAiInterfaceCandidates);
});

aiInterfaceFilterStatus.addEventListener("change", () => {
    renderAiInterfaceCandidates(latestAiInterfaceCandidates);
});

aiInterfaceFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }
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

aiInterfaceGenerateBtn.addEventListener("click", async () => {
    const textInput = String(aiInterfaceText.value || "").trim();
    if (latestAiInterfaceRows.length === 0 && !textInput) {
        aiInterfaceMessage.textContent = "请先导入Excel/CSV或输入文本";
        return;
    }
    setButtonBusy(aiInterfaceGenerateBtn, true, "生成中...");
    try {
        const result = await http("/api/ai/interface-cases/generate", {
            method: "POST",
            body: JSON.stringify({
                textInput,
                importRows: latestAiInterfaceRows
            })
        });
        const data = result.data || {};
        latestAiInterfaceGenerationId = data.generationId || "";
        latestAiInterfaceCandidates = [];
        latestAiInterfaceSaveItems = [];
        aiInterfaceEditState.clear();
        renderGeneratedTempRows(Array.isArray(data.tempCases) ? data.tempCases : []);
        await loadTempCases();
        activatePanel("aiPreCases");
        renderAiInterfaceSaveResults([]);
        renderAiInterfaceExecution(null);
        aiInterfaceMessage.textContent = `${result.msg}，预生成 ${Array.isArray(data.tempCases) ? data.tempCases.length : 0} 条，AI引擎=${data.aiEngine || "N/A"}`;
        aiPreCaseMessage.textContent = "请在预生成案例管理中审核、采纳并入库";
    } catch (error) {
        aiInterfaceMessage.textContent = `生成失败：${error.message}`;
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

aiInterfaceSaveRunBtn.addEventListener("click", async () => {
    const selectedIds = collectSelectedTempIds();
    if (selectedIds.length === 0) {
        aiPreCaseMessage.textContent = "请至少采纳一个待入库案例";
        return;
    }
    setButtonBusy(aiInterfaceSaveRunBtn, true, "入库执行中...");
    try {
        const result = await http("/api/ai/interface-cases/temp/store", {
            method: "POST",
            body: JSON.stringify({
                generationId: latestAiInterfaceGenerationId,
                tempIds: selectedIds,
                autoExecute: true
            })
        });
        const data = result.data || {};
        latestAiInterfaceSaveItems = Array.isArray(data.items) ? data.items : [];
        renderAiInterfaceSaveResults(latestAiInterfaceSaveItems);
        renderAiInterfaceExecution(data.execution || null);
        const hisId = data.executionHisId ? `，已触发执行 hisId=${data.executionHisId}` : "";
        aiPreCaseMessage.textContent = `${result.msg}，接口新增 ${data.functionCreatedCount || 0}，案例新增 ${data.caseCreatedCount || 0}${hisId}`;
        if (data.execution) {
            executionOutput.textContent = JSON.stringify(data.execution, null, 2);
        }
        await loadTempCases();
        await refreshAll();
        await loadExecutableCases();
    } catch (error) {
        aiPreCaseMessage.textContent = `入库执行失败：${error.message}`;
    } finally {
        setButtonBusy(aiInterfaceSaveRunBtn, false);
    }
});

aiInterfaceDeleteBtn.addEventListener("click", async () => {
    const selectedIds = collectSelectedTempIds();
    if (selectedIds.length === 0) {
        aiPreCaseMessage.textContent = "请先勾选需要删除的预生成案例";
        return;
    }
    setButtonBusy(aiInterfaceDeleteBtn, true, "删除中...");
    try {
        const result = await http("/api/ai/interface-cases/temp/delete", {
            method: "POST",
            body: JSON.stringify({ tempIds: selectedIds })
        });
        await loadTempCases();
        aiPreCaseMessage.textContent = `${result.msg}，删除 ${result.data?.affectedCount ?? 0} 条`;
    } catch (error) {
        aiPreCaseMessage.textContent = `删除失败：${error.message}`;
    } finally {
        setButtonBusy(aiInterfaceDeleteBtn, false);
    }
});

aiInterfaceRegenerateBtn.addEventListener("click", async () => {
    const selectedIds = collectSelectedTempIds();
    if (selectedIds.length === 0) {
        aiPreCaseMessage.textContent = "请先勾选需要再生的预生成案例";
        return;
    }
    setButtonBusy(aiInterfaceRegenerateBtn, true, "再生中...");
    try {
        const result = await http("/api/ai/interface-cases/temp/regenerate", {
            method: "POST",
            body: JSON.stringify({
                tempIds: selectedIds,
                copiesPerCase: 1
            })
        });
        await loadTempCases();
        aiPreCaseMessage.textContent = `${result.msg}，新增 ${result.data?.affectedCount ?? 0} 条再生案例`;
    } catch (error) {
        aiPreCaseMessage.textContent = `再生失败：${error.message}`;
    } finally {
        setButtonBusy(aiInterfaceRegenerateBtn, false);
    }
});

aiInterfaceReloadBtn.addEventListener("click", async () => {
    setButtonBusy(aiInterfaceReloadBtn, true, "刷新中...");
    try {
        const rows = await loadTempCases();
        aiPreCaseMessage.textContent = `刷新成功，共 ${rows.length} 条预生成案例`;
    } catch (error) {
        aiPreCaseMessage.textContent = `刷新失败：${error.message}`;
    } finally {
        setButtonBusy(aiInterfaceReloadBtn, false);
    }
});

aiDocForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const payload = buildApiDefinition(aiDocForm);
        const result = await http("/api/generate-docs", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        aiDocMessage.textContent = `接口文档生成成功。AI参与=${result.aiParticipated === true}，引擎=${result.aiEngine || "N/A"}，远程LLM使用=${result.remoteLlmUsed === true}`;
        aiDocMarkdownOutput.textContent = result.markdown || "";
        aiDocOpenApiOutput.textContent = JSON.stringify({
            aiParticipated: result.aiParticipated,
            aiEngine: result.aiEngine,
            remoteLlmConfigured: result.remoteLlmConfigured,
            remoteLlmUsed: result.remoteLlmUsed,
            openApi: result.openApi || {}
        }, null, 2);
    } catch (error) {
        aiDocMessage.textContent = `接口文档生成失败：${error.message}`;
    }
});

aiDocImportFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }
    try {
        const text = await file.text();
        aiDocImportText.value = text;
        latestDocImportedFormat = detectDocFormatByFileName(file.name);
        aiDocMessage.textContent = `已导入接口文档文件：${file.name}`;
    } catch (error) {
        aiDocMessage.textContent = `读取文档失败：${error.message}`;
    }
});

aiDocImportGenerateBtn.addEventListener("click", async () => {
    const content = String(aiDocImportText.value || "").trim();
    if (!content) {
        aiDocMessage.textContent = "请先粘贴或导入接口文档";
        return;
    }
    try {
        const result = await http("/api/generate-docs/import", {
            method: "POST",
            body: JSON.stringify({
                documentContent: content,
                format: latestDocImportedFormat
            })
        });
        const documents = Array.isArray(result.documents) ? result.documents : [];
        const markdown = documents.map((item, index) => `### [${index + 1}] ${item.apiName || "-"}\n\n${item.markdown || ""}`).join("\n\n---\n\n");
        aiDocMarkdownOutput.textContent = markdown || "未生成文档内容";
        const openApiOutput = documents.length === 1
            ? {
                aiParticipated: result.aiParticipated,
                aiEngines: result.aiEngines,
                remoteLlmUsedCount: result.remoteLlmUsedCount,
                fallbackAiUsedCount: result.fallbackAiUsedCount,
                openApi: documents[0].openApi || {}
            }
            : {
                aiParticipated: result.aiParticipated,
                aiEngines: result.aiEngines,
                remoteLlmUsedCount: result.remoteLlmUsedCount,
                fallbackAiUsedCount: result.fallbackAiUsedCount,
                documents: documents.map((item) => ({
                    apiName: item.apiName,
                    apiPath: item.apiPath,
                    aiEngine: item.aiEngine,
                    openApi: item.openApi || {}
                }))
            };
        aiDocOpenApiOutput.textContent = JSON.stringify(openApiOutput, null, 2);
        const engines = Array.isArray(result.aiEngines) && result.aiEngines.length > 0 ? result.aiEngines.join(", ") : "N/A";
        aiDocMessage.textContent = `导入成功，识别 ${result.apiCount} 个接口并完成文档生成。AI参与=${result.aiParticipated === true}，引擎=${engines}，远程LLM=${result.remoteLlmUsedCount ?? 0}，回退AI=${result.fallbackAiUsedCount ?? 0}`;
    } catch (error) {
        aiDocMessage.textContent = `导入生成失败：${error.message}`;
    }
});

aiCaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const payload = buildApiDefinition(aiCaseForm);
        const result = await http("/api/generate-cases", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        latestGeneratedCases = result;
        renderAiCases(result);
        aiCaseOutput.textContent = JSON.stringify(result, null, 2);
        aiCaseMessage.textContent = `生成成功，共 ${result.length} 条测试用例`;
        const executable = await loadExecutableCases();
        aiExecuteMessage.textContent = `已同步 ${executable.length} 条用例到执行列表`;
    } catch (error) {
        aiCaseMessage.textContent = `测试用例生成失败：${error.message}`;
    }
});

aiCaseImportFile.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
        return;
    }
    try {
        const text = await file.text();
        aiCaseImportText.value = text;
        latestCaseImportedFormat = detectDocFormatByFileName(file.name);
        aiCaseMessage.textContent = `已导入文档文件：${file.name}`;
    } catch (error) {
        aiCaseMessage.textContent = `读取文件失败：${error.message}`;
    }
});

aiCaseImportGenerateBtn.addEventListener("click", async () => {
    const content = String(aiCaseImportText.value || "").trim();
    if (!content) {
        aiCaseMessage.textContent = "请先粘贴或导入接口文档";
        return;
    }
    try {
        const result = await http("/api/generate-cases/import", {
            method: "POST",
            body: JSON.stringify({
                documentContent: content,
                format: latestCaseImportedFormat
            })
        });
        latestGeneratedCases = result.generatedCases || [];
        renderAiCases(latestGeneratedCases);
        aiCaseOutput.textContent = JSON.stringify(result, null, 2);
        const engines = Array.isArray(result.aiEngines) && result.aiEngines.length > 0 ? result.aiEngines.join(", ") : "N/A";
        aiCaseMessage.textContent = `导入成功，识别 ${result.apiCount} 个接口，生成 ${result.caseCount} 条测试用例。AI参与=${result.aiParticipated === true}，引擎=${engines}，远程LLM=${result.remoteLlmUsedCount ?? 0}，回退AI=${result.fallbackAiUsedCount ?? 0}`;
        const executable = await loadExecutableCases();
        aiExecuteMessage.textContent = `已同步 ${executable.length} 条用例到执行列表`;
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

aiExecuteCasesBtn.addEventListener("click", async () => {
    const selectedCaseIds = Array.from(document.querySelectorAll(".ai-case-checkbox:checked"))
        .map((item) => Number(item.value))
        .filter((item) => Number.isFinite(item));
    if (selectedCaseIds.length === 0) {
        aiExecuteMessage.textContent = "请至少选择一个用例执行";
        return;
    }

    try {
        const result = await http("/api/execute-cases", {
            method: "POST",
            body: JSON.stringify({ caseIds: selectedCaseIds })
        });
        aiExecuteOutput.textContent = JSON.stringify(result, null, 2);
        aiExecuteMessage.textContent = `执行完成，runId=${result.runId}，通过 ${result.passed}/${result.total}`;
        await loadAiResults(result.runId);
    } catch (error) {
        aiExecuteMessage.textContent = `执行失败：${error.message}`;
    }
});

aiResultQueryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const runId = String(new FormData(aiResultQueryForm).get("runId") || "").trim();
    try {
        const result = await loadAiResults(runId);
        if (result.length === 0) {
            aiResultOutput.textContent = runId ? `未找到 runId=${runId} 的执行结果` : "暂无执行结果";
        }
    } catch (error) {
        aiResultOutput.textContent = `查询失败：${error.message}`;
    }
});

aiLoadLatestResultsBtn.addEventListener("click", async () => {
    try {
        await loadAiResults();
    } catch (error) {
        aiResultOutput.textContent = `查询失败：${error.message}`;
    }
});

agentRunForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const result = await http("/api/executions/agent", {
            method: "POST",
            body: JSON.stringify(formToJson(agentRunForm))
        });
        executionOutput.textContent = JSON.stringify(result, null, 2);
        await refreshAll();
    } catch (error) {
        executionOutput.textContent = `执行失败：${error.message}`;
    }
});

queryStatusForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const hisId = new FormData(queryStatusForm).get("hisId");
        const result = await http(`/api/executions/${hisId}/status`);
        executionOutput.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        executionOutput.textContent = `查询失败：${error.message}`;
    }
});

queryResultForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const hisId = new FormData(queryResultForm).get("hisId");
        const result = await http(`/api/executions/${hisId}/result`);
        executionOutput.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        executionOutput.textContent = `查询失败：${error.message}`;
    }
});

authBtn.addEventListener("click", async () => {
    try {
        const result = await http("/api/executions/devops/authorization", { method: "POST" });
        executionOutput.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        executionOutput.textContent = `查询失败：${error.message}`;
    }
});

devopsBatchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const result = await http("/api/executions/devops/batch", {
            method: "POST",
            body: JSON.stringify(formToJson(devopsBatchForm))
        });
        executionOutput.textContent = JSON.stringify(result, null, 2);
        await refreshAll();
    } catch (error) {
        executionOutput.textContent = `执行失败：${error.message}`;
    }
});

latestDevopsStatusBtn.addEventListener("click", async () => {
    try {
        const result = await http("/api/executions/devops/status/latest");
        executionOutput.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        executionOutput.textContent = `查询失败：${error.message}`;
    }
});

latestDevopsResultBtn.addEventListener("click", async () => {
    try {
        const result = await http("/api/executions/devops/result/latest");
        executionOutput.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
        executionOutput.textContent = `查询失败：${error.message}`;
    }
});

queryDevopsByIdForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const hisId = new FormData(queryDevopsByIdForm).get("hisId");
        const [statusResult, detailResult] = await Promise.all([
            http(`/api/executions/devops/status/${hisId}`),
            http(`/api/executions/devops/result/${hisId}`)
        ]);
        executionOutput.textContent = JSON.stringify({ statusResult, detailResult }, null, 2);
    } catch (error) {
        executionOutput.textContent = `查询失败：${error.message}`;
    }
});

busForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
        const data = formToJson(busForm);
        const payload = {
            i_request_data: data.iRequestData,
            i_resource: data.iResource,
            i_sysid: data.iSysid,
            i_sysver: data.iSysver
        };
        const result = await http("/prod-api/api/v1/forward/517268", {
            method: "POST",
            body: JSON.stringify(payload)
        });
        executionOutput.textContent = JSON.stringify(result, null, 2);
        await refreshAll();
    } catch (error) {
        executionOutput.textContent = `执行失败：${error.message}`;
    }
});

loadVersionsBtn.addEventListener("click", async () => {
    try {
        const data = await http("/api/versions/support");
        versionResult.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        versionResult.textContent = `查询失败：${error.message}`;
    }
});

loadFunctionLookupBtn.addEventListener("click", async () => {
    try {
        const data = await http("/api/functions/lookup");
        functionLookupResult.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        functionLookupResult.textContent = `查询失败：${error.message}`;
    }
});

refreshAll().catch((error) => {
    executionOutput.textContent = `初始化失败: ${error.message}`;
});

aiDocMarkdownOutput.textContent = "提交接口定义后自动生成 Markdown 文档";
aiDocOpenApiOutput.textContent = "提交接口定义后自动生成 OpenAPI JSON";
aiCaseOutput.textContent = "生成后的测试用例会显示在这里";
aiExecuteOutput.textContent = "请选择测试用例并执行";
aiResultOutput.textContent = "执行后可在这里查看批次结果";
renderAiInterfaceCandidates([]);
renderAiInterfaceSaveResults([]);
renderAiInterfaceExecution(null);
renderGeneratedTempRows([]);

loadTempCases().catch(() => {
    aiPreCaseMessage.textContent = "暂无预生成案例";
});
loadExecutableCases().catch(() => {
    aiExecuteMessage.textContent = "暂无可执行用例";
});

loadAiResults().catch(() => {
    aiResultOutput.textContent = "暂无执行结果";
});

setInterval(() => {
    refreshAll().catch(() => {});
}, 6000);
