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

menu.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const panelId = button.dataset.panel;
    menu.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
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
        throw new Error(`HTTP ${response.status}`);
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

agentRunForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await http("/api/executions/agent", {
        method: "POST",
        body: JSON.stringify(formToJson(agentRunForm))
    });
    executionOutput.textContent = JSON.stringify(result, null, 2);
    await refreshAll();
});

queryStatusForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const hisId = new FormData(queryStatusForm).get("hisId");
    const result = await http(`/api/executions/${hisId}/status`);
    executionOutput.textContent = JSON.stringify(result, null, 2);
});

queryResultForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const hisId = new FormData(queryResultForm).get("hisId");
    const result = await http(`/api/executions/${hisId}/result`);
    executionOutput.textContent = JSON.stringify(result, null, 2);
});

authBtn.addEventListener("click", async () => {
    const result = await http("/api/executions/devops/authorization", { method: "POST" });
    executionOutput.textContent = JSON.stringify(result, null, 2);
});

devopsBatchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = await http("/api/executions/devops/batch", {
        method: "POST",
        body: JSON.stringify(formToJson(devopsBatchForm))
    });
    executionOutput.textContent = JSON.stringify(result, null, 2);
    await refreshAll();
});

latestDevopsStatusBtn.addEventListener("click", async () => {
    const result = await http("/api/executions/devops/status/latest");
    executionOutput.textContent = JSON.stringify(result, null, 2);
});

latestDevopsResultBtn.addEventListener("click", async () => {
    const result = await http("/api/executions/devops/result/latest");
    executionOutput.textContent = JSON.stringify(result, null, 2);
});

queryDevopsByIdForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const hisId = new FormData(queryDevopsByIdForm).get("hisId");
    const [statusResult, detailResult] = await Promise.all([
        http(`/api/executions/devops/status/${hisId}`),
        http(`/api/executions/devops/result/${hisId}`)
    ]);
    executionOutput.textContent = JSON.stringify({ statusResult, detailResult }, null, 2);
});

busForm.addEventListener("submit", async (event) => {
    event.preventDefault();
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
});

loadVersionsBtn.addEventListener("click", async () => {
    const data = await http("/api/versions/support");
    versionResult.textContent = JSON.stringify(data, null, 2);
});

loadFunctionLookupBtn.addEventListener("click", async () => {
    const data = await http("/api/functions/lookup");
    functionLookupResult.textContent = JSON.stringify(data, null, 2);
});

refreshAll().catch((error) => {
    executionOutput.textContent = `初始化失败: ${error.message}`;
});

setInterval(() => {
    refreshAll().catch(() => {});
}, 6000);
