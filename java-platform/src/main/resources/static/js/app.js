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
let latestDocImportedFormat = "auto";
let latestCaseImportedFormat = "auto";

menu.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-panel]");
    if (!button) return;
    const panelId = button.dataset.panel;
    menu.querySelectorAll("button[data-panel]").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    panels.forEach((panel) => panel.classList.toggle("active", panel.id === panelId));
});

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
        aiExecuteMessage.textContent = `已同步 ${result.length} 条用例到执行列表`;
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

loadAiResults().catch(() => {
    aiResultOutput.textContent = "暂无执行结果";
});

setInterval(() => {
    refreshAll().catch(() => {});
}, 6000);
