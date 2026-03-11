package com.xuzhidong.aitest.service;

import com.xuzhidong.aitest.model.AiCase;
import com.xuzhidong.aitest.model.AiFunction;
import com.xuzhidong.aitest.model.PlatformSummary;
import com.xuzhidong.aitest.model.VersionExecution;
import com.xuzhidong.aitest.model.VersionSupport;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class PlatformStore {

    private final AtomicLong functionIdGenerator = new AtomicLong(1000);
    private final AtomicLong caseIdGenerator = new AtomicLong(100000);

    private final Map<Long, AiFunction> functions = new ConcurrentHashMap<>();
    private final Map<Long, AiCase> cases = new ConcurrentHashMap<>();
    private final Map<String, VersionExecution> executions = new ConcurrentHashMap<>();
    private final List<String> executionOrder = new CopyOnWriteArrayList<>();

    private volatile String devopsAuthorization = "";

    private final List<VersionSupport> versionSupports = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void initSeedData() {
        if (!functions.isEmpty() || !cases.isEmpty()) {
            return;
        }

        AiFunction function = new AiFunction();
        function.setSysId("cjeh2");
        function.setSysName("长江e号2");
        function.setFuncNo("500.6");
        function.setFuncName("委托确认");
        function.setFuncType("yn");
        function.setSubFuncType("trade");
        function.setFuncRequestMethod("POST");
        function.setFuncHttpUrl("http://172.19.178.174:9520/api/flask/backend/cjeh/api/test/");
        function.setFuncRemark("种子数据：用于手册流程演示");
        addFunction(function);

        AiCase aiCase = new AiCase();
        aiCase.setSysId("cjeh2");
        aiCase.setSysName("长江e号2");
        aiCase.setCaseId(146666L);
        aiCase.setCaseName("伊诺普通交易深市REITs限价类型委托买入成功");
        aiCase.setCaseType("正例");
        aiCase.setRunFlag("1");
        aiCase.setCaseKvBase("{\"env\":\"50000\",\"funcno\":\"501.20\"}");
        aiCase.setCaseKvDynamic("{\"i_stock_code\":\"180201\"}");
        aiCase.setCaseCheckFunction("517184");
        aiCase.setFuncNo("500.6");
        aiCase.setFuncName("委托确认");
        aiCase.setFuncType("yn");
        aiCase.setSubFuncType("trade");
        aiCase.setModuleName("普通买入");
        addCase(aiCase);

        versionSupports.add(new VersionSupport("长江e号", "13.1.0", "500.6,517504,517508", "cjeh2", "长江e号2", "1"));
        versionSupports.add(new VersionSupport("长江e号", "12.0.0", "500.6,517504", "cjeh2", "长江e号2", "1"));
        versionSupports.add(new VersionSupport("长江e号", "11.9.0", "500.6,517508", "cjeh2", "长江e号2", "1"));
    }

    public List<AiFunction> listFunctions() {
        return functions.values().stream()
            .sorted(Comparator.comparing(AiFunction::getId))
            .toList();
    }

    public synchronized AiFunction addFunction(AiFunction input) {
        Optional<AiFunction> existing = functions.values().stream()
            .filter(item -> Objects.equals(item.getSysId(), input.getSysId()) && Objects.equals(item.getFuncNo(), input.getFuncNo()))
            .findFirst();
        if (existing.isPresent()) {
            throw new IllegalArgumentException("接口记录已存在,请重新检查");
        }
        long id = functionIdGenerator.incrementAndGet();
        input.setId(id);
        input.setCreatedAt(LocalDateTime.now());
        functions.put(id, input);
        return input;
    }

    public List<AiCase> listCases() {
        return cases.values().stream()
            .sorted(Comparator.comparing(AiCase::getId))
            .toList();
    }

    public synchronized AiCase addCase(AiCase input) {
        Optional<AiFunction> function = findFunction(input.getSysId(), input.getFuncNo());
        if (function.isEmpty()) {
            throw new IllegalArgumentException("请先在接口表 T_AI_FUNCTION 中补充功能号信息");
        }
        Optional<AiCase> existing = cases.values().stream()
            .filter(item -> Objects.equals(item.getSysId(), input.getSysId()) && Objects.equals(item.getCaseId(), input.getCaseId()))
            .findFirst();
        if (existing.isPresent()) {
            throw new IllegalArgumentException("案例记录已存在,请重新检查");
        }
        if (input.getCaseId() == null) {
            input.setCaseId(caseIdGenerator.incrementAndGet());
        }
        long id = caseIdGenerator.incrementAndGet();
        input.setId(id);
        input.setCreatedAt(LocalDateTime.now());
        cases.put(id, input);
        return input;
    }

    public Optional<AiCase> findCaseByRecordId(Long recordId) {
        if (recordId == null) {
            return Optional.empty();
        }
        return Optional.ofNullable(cases.get(recordId));
    }

    public Optional<AiCase> findCaseByBusinessKey(String sysId, Long caseId) {
        return cases.values().stream()
            .filter(item -> Objects.equals(item.getSysId(), sysId) && Objects.equals(item.getCaseId(), caseId))
            .findFirst();
    }

    public synchronized AiCase updateCase(Long recordId, AiCase update) {
        AiCase existing = cases.get(recordId);
        if (existing == null) {
            throw new IllegalArgumentException("已入库案例不存在");
        }
        ensureCaseBusinessKeyAvailable(update.getSysId(), update.getCaseId(), existing.getId());
        update.setId(existing.getId());
        update.setCreatedAt(existing.getCreatedAt());
        cases.put(existing.getId(), update);
        return update;
    }

    public synchronized AiCase updateCaseByBusinessKey(String sysId, Long caseId, AiCase update) {
        AiCase existing = findCaseByBusinessKey(sysId, caseId)
            .orElseThrow(() -> new IllegalArgumentException("已入库案例不存在"));
        return updateCase(existing.getId(), update);
    }

    public synchronized boolean deleteCaseByRecordId(Long recordId) {
        if (recordId == null) {
            return false;
        }
        return cases.remove(recordId) != null;
    }

    public synchronized boolean deleteCaseByBusinessKey(String sysId, Long caseId) {
        Optional<AiCase> existing = findCaseByBusinessKey(sysId, caseId);
        if (existing.isEmpty()) {
            return false;
        }
        return cases.remove(existing.get().getId()) != null;
    }

    private void ensureCaseBusinessKeyAvailable(String sysId, Long caseId, Long ignoreRecordId) {
        boolean duplicate = cases.values().stream().anyMatch(item ->
            Objects.equals(item.getSysId(), sysId)
                && Objects.equals(item.getCaseId(), caseId)
                && !Objects.equals(item.getId(), ignoreRecordId)
        );
        if (duplicate) {
            throw new IllegalArgumentException("案例记录已存在,请重新检查");
        }
    }

    public List<VersionSupport> listVersionSupports() {
        return new ArrayList<>(versionSupports);
    }

    public synchronized void putExecution(VersionExecution execution) {
        executions.put(execution.getHisId(), execution);
        if (!executionOrder.contains(execution.getHisId())) {
            executionOrder.add(0, execution.getHisId());
        }
    }

    public VersionExecution getExecution(String hisId) {
        return executions.get(hisId);
    }

    public List<VersionExecution> listExecutions() {
        return executionOrder.stream()
            .map(executions::get)
            .filter(item -> item != null)
            .toList();
    }

    public VersionExecution latestExecution() {
        return executionOrder.stream()
            .map(executions::get)
            .filter(item -> item != null)
            .findFirst()
            .orElse(null);
    }

    public VersionExecution latestExecutionByMode(String modeName) {
        return executionOrder.stream()
            .map(executions::get)
            .filter(item -> item != null && item.getMode().name().equals(modeName))
            .findFirst()
            .orElse(null);
    }

    public PlatformSummary buildSummary() {
        PlatformSummary summary = new PlatformSummary();
        summary.setFunctionCount(functions.size());
        summary.setCaseCount(cases.size());
        summary.setRunCount(executions.size());
        VersionExecution latest = latestExecution();
        summary.setLatestHisId(latest != null ? latest.getHisId() : "-");
        return summary;
    }

    public String getDevopsAuthorization() {
        return devopsAuthorization;
    }

    public Optional<AiFunction> findFunction(String sysId, String funcNo) {
        return functions.values().stream()
            .filter(item -> Objects.equals(item.getSysId(), sysId) && Objects.equals(item.getFuncNo(), funcNo))
            .findFirst();
    }

    public Optional<AiFunction> firstFunctionBySysId(String sysId) {
        return functions.values().stream()
            .filter(item -> Objects.equals(item.getSysId(), sysId))
            .min(Comparator.comparing(AiFunction::getId));
    }

    public void setDevopsAuthorization(String devopsAuthorization) {
        this.devopsAuthorization = devopsAuthorization;
    }
}
