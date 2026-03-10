package com.xuzhidong.aitest.service;

import com.xuzhidong.aitest.model.AiCase;
import com.xuzhidong.aitest.model.CaseExecutionDetail;
import com.xuzhidong.aitest.model.ExecutionMode;
import com.xuzhidong.aitest.model.ExecutionStatus;
import com.xuzhidong.aitest.model.VersionExecution;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.text.DecimalFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
public class ExecutionService {

    private static final DateTimeFormatter HIS_ID_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final DecimalFormat RATE_FORMAT = new DecimalFormat("0.00%");

    private final PlatformStore store;
    private final ExecutorService executor = Executors.newCachedThreadPool();
    private final SecureRandom random = new SecureRandom();

    public ExecutionService(PlatformStore store) {
        this.store = store;
    }

    public VersionExecution startAgentExecution(String versionName, String versionNumber) {
        return createAndRunExecution(versionName, versionNumber, ExecutionMode.AGENT, "通过智能体执行（方式1）");
    }

    public VersionExecution startDevopsBatch(String sysId, String sysVer, String resource) {
        String versionName = sysId == null || sysId.isBlank() ? "长江e号" : sysId;
        String versionNumber = sysVer == null || sysVer.isBlank() ? "latest" : sysVer;
        String msg = "通过 DevOps 接口自动化测试（方式2）, resource=" + (resource == null ? "0" : resource);
        return createAndRunExecution(versionName, versionNumber, ExecutionMode.DEVOPS, msg);
    }

    public String generateAuthorizationToken() {
        String token = "Bearer " + UUID.randomUUID().toString().replace("-", "");
        store.setDevopsAuthorization(token);
        return token;
    }

    public VersionExecution createAndRunExecution(String versionName, String versionNumber, ExecutionMode mode, String message) {
        VersionExecution execution = new VersionExecution();
        execution.setHisId(HIS_ID_FORMATTER.format(LocalDateTime.now()) + random.nextInt(10, 99));
        execution.setRunName("接口自动化V" + versionNumber + "(aitest)");
        execution.setVersionName(versionName);
        execution.setVersionNumber(versionNumber);
        execution.setMode(mode);
        execution.setStatus(ExecutionStatus.RUNNING);
        execution.setBeginTime(LocalDateTime.now());
        execution.setMessage(message);
        store.putExecution(execution);

        CompletableFuture.runAsync(() -> completeExecution(execution), executor);
        return execution;
    }

    public VersionExecution statusByHisId(String hisId) {
        return store.getExecution(hisId);
    }

    public VersionExecution latestDevopsStatus() {
        return store.latestExecutionByMode(ExecutionMode.DEVOPS.name());
    }

    private void completeExecution(VersionExecution execution) {
        try {
            Thread.sleep(random.nextLong(900, 2400));
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        List<AiCase> allCases = store.listCases();
        int total = Math.max(1, allCases.size());
        int failed = total > 1 ? random.nextInt(0, 2) : 0;
        int success = total - failed;
        execution.setTotalCases(total);
        execution.setSuccessCases(success);
        execution.setFailedCases(failed);
        execution.setPassRate(RATE_FORMAT.format((double) success / (double) total));
        execution.setEndTime(LocalDateTime.now());
        execution.setExecuteSeconds(Math.max(1L, java.time.Duration.between(execution.getBeginTime(), execution.getEndTime()).toSeconds()));
        execution.setStatus(failed == 0 ? ExecutionStatus.DONE : ExecutionStatus.FAILED);
        execution.setDetails(buildDetails(allCases, failed));
        store.putExecution(execution);
    }

    private List<CaseExecutionDetail> buildDetails(List<AiCase> cases, int failedCount) {
        if (cases.isEmpty()) {
            CaseExecutionDetail detail = new CaseExecutionDetail();
            detail.setCaseId(0L);
            detail.setCaseName("默认演示案例");
            detail.setCaseResult("Pass");
            detail.setCaseMsg("{\"message\":\"no cases configured\"}");
            return List.of(detail);
        }
        int boundedFailed = Math.max(0, Math.min(failedCount, cases.size()));
        int failureStart = boundedFailed == 0 ? 0 : random.nextInt(0, cases.size());
        return java.util.stream.IntStream.range(0, cases.size()).mapToObj(index -> {
            AiCase item = cases.get(index);
            boolean failed = boundedFailed > 0 && isFailureIndex(index, cases.size(), failureStart, boundedFailed);
            CaseExecutionDetail detail = new CaseExecutionDetail();
            detail.setCaseId(item.getCaseId());
            detail.setCaseName(item.getCaseName());
            detail.setCaseResult(failed ? "Fail" : "Pass");
            detail.setCaseMsg("{\"funcNo\":\"" + item.getFuncNo() + "\",\"module\":\"" + item.getModuleName() + "\"}");
            return detail;
        }).toList();
    }

    private boolean isFailureIndex(int index, int total, int start, int failedCount) {
        int end = start + failedCount;
        if (end <= total) {
            return index >= start && index < end;
        }
        int overflow = end - total;
        return index >= start || index < overflow;
    }
}
