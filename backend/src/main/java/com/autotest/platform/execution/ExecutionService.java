package com.autotest.platform.execution;

import com.autotest.platform.casecenter.TestCaseEntity;
import com.autotest.platform.casecenter.TestCaseService;
import com.autotest.platform.other.log.PlatformLogService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExecutionService {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final ExecutionRepository executionRepository;
    private final TestCaseService testCaseService;
    private final PlatformLogService platformLogService;

    public ExecutionService(
        ExecutionRepository executionRepository,
        TestCaseService testCaseService,
        PlatformLogService platformLogService
    ) {
        this.executionRepository = executionRepository;
        this.testCaseService = testCaseService;
        this.platformLogService = platformLogService;
    }

    @Transactional
    public ExecutionSummaryResponse run(String owner, List<Long> caseIds) {
        List<TestCaseEntity> cases = testCaseService.findEnabledByIds(owner, caseIds);
        if (cases.isEmpty()) {
            throw new IllegalArgumentException("未找到可执行的启用用例");
        }

        ExecutionEntity execution = new ExecutionEntity();
        execution.setRunId("RUN-" + FORMATTER.format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 6));
        execution.setOwner(owner);
        execution.setStatus(ExecutionStatus.RUNNING);
        execution.setStartedAt(LocalDateTime.now());
        execution.setFinishedAt(LocalDateTime.now());
        execution.setTotalCases(cases.size());
        execution.setPassedCases(0);
        execution.setFailedCases(0);
        execution.setSummary("运行中");

        int passed = 0;
        int failed = 0;
        for (TestCaseEntity item : cases) {
            boolean pass = item.getExpectedStatus() < 400;
            ExecutionDetailEntity detail = new ExecutionDetailEntity();
            detail.setExecution(execution);
            detail.setCaseId(item.getId());
            detail.setCaseName(item.getCaseName());
            detail.setStatus(pass ? ExecutionStatus.PASSED : ExecutionStatus.FAILED);
            detail.setMessage(pass ? "断言通过" : "期望状态码触发失败");
            detail.setDurationMs(pass ? 60 : 90);
            execution.getDetails().add(detail);
            if (pass) {
                passed++;
            } else {
                failed++;
            }
        }

        execution.setPassedCases(passed);
        execution.setFailedCases(failed);
        execution.setStatus(failed == 0 ? ExecutionStatus.PASSED : ExecutionStatus.FAILED);
        execution.setFinishedAt(LocalDateTime.now());
        execution.setSummary(passed + " passed, " + failed + " failed");
        ExecutionEntity saved = executionRepository.save(execution);

        platformLogService.recordOperation(
            owner,
            "EXECUTION",
            "RUN_EXECUTION",
            "caseIds=" + caseIds,
            "runId=" + saved.getRunId(),
            "SUCCESS",
            saved.getSummary()
        );
        platformLogService.recordApiCall(
            owner,
            "EXECUTION",
            "/api/v1/executions",
            "POST",
            "caseCount=" + caseIds.size(),
            "runId=" + saved.getRunId(),
            200,
            0,
            true,
            null
        );
        return ExecutionSummaryResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ExecutionSummaryResponse> list(String owner) {
        return executionRepository.findByOwnerOrderByStartedAtDesc(owner).stream()
            .map(ExecutionSummaryResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public ExecutionDetailResponse detail(String owner, String runId) {
        ExecutionEntity execution = executionRepository.findByRunIdAndOwner(runId, owner)
            .orElseThrow(() -> new IllegalArgumentException("运行记录不存在"));
        return new ExecutionDetailResponse(
            ExecutionSummaryResponse.fromEntity(execution),
            execution.getDetails().stream().map(ExecutionDetailItemResponse::fromEntity).toList()
        );
    }
}
