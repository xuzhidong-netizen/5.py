package com.autotest.platform.other.report;

import com.autotest.platform.casecenter.CaseAuditLogEntity;
import com.autotest.platform.casecenter.CaseAuditLogRepository;
import com.autotest.platform.casecenter.TestCaseEntity;
import com.autotest.platform.casecenter.TestCaseRepository;
import com.autotest.platform.casecenter.TestCaseStatus;
import com.autotest.platform.execution.ExecutionDetailEntity;
import com.autotest.platform.execution.ExecutionDetailRepository;
import com.autotest.platform.execution.ExecutionEntity;
import com.autotest.platform.execution.ExecutionRepository;
import com.autotest.platform.execution.ExecutionStatus;
import com.autotest.platform.other.log.AiGenerateLogEntity;
import com.autotest.platform.other.log.AiGenerateLogRepository;
import com.autotest.platform.other.log.OperationLogRepository;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportCenterService {

    private final TestCaseRepository testCaseRepository;
    private final CaseAuditLogRepository caseAuditLogRepository;
    private final ExecutionRepository executionRepository;
    private final ExecutionDetailRepository executionDetailRepository;
    private final AiGenerateLogRepository aiGenerateLogRepository;
    private final OperationLogRepository operationLogRepository;

    public ReportCenterService(
        TestCaseRepository testCaseRepository,
        CaseAuditLogRepository caseAuditLogRepository,
        ExecutionRepository executionRepository,
        ExecutionDetailRepository executionDetailRepository,
        AiGenerateLogRepository aiGenerateLogRepository,
        OperationLogRepository operationLogRepository
    ) {
        this.testCaseRepository = testCaseRepository;
        this.caseAuditLogRepository = caseAuditLogRepository;
        this.executionRepository = executionRepository;
        this.executionDetailRepository = executionDetailRepository;
        this.aiGenerateLogRepository = aiGenerateLogRepository;
        this.operationLogRepository = operationLogRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> documentReport(String owner) {
        List<AiGenerateLogEntity> logs = aiGenerateLogRepository.findByOwnerAndGenerateTypeOrderByCreatedAtDesc(owner, "DOCUMENT");
        long total = logs.size();
        long successCount = logs.stream().filter(item -> Boolean.TRUE.equals(item.getSuccess())).count();
        long failureCount = total - successCount;

        Map<String, Long> failureReasonTop = logs.stream()
            .filter(item -> !Boolean.TRUE.equals(item.getSuccess()))
            .collect(Collectors.groupingBy(
                item -> item.getErrorMessage() == null || item.getErrorMessage().isBlank() ? "UNKNOWN" : item.getErrorMessage(),
                Collectors.counting()
            ));

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("generationCount", total);
        report.put("successCount", successCount);
        report.put("failureCount", failureCount);
        report.put("successRate", percent(successCount, total));
        report.put("exportCount", operationLogRepository.countByOwnerAndActionType(owner, "EXPORT_DOCUMENT"));
        report.put("failureReasonTop", topMap(failureReasonTop, 10));
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> caseGenerationReport(String owner) {
        List<AiGenerateLogEntity> logs = aiGenerateLogRepository.findByOwnerAndGenerateTypeOrderByCreatedAtDesc(owner, "CASE");
        long totalRuns = logs.size();
        long aiGeneratedCaseCount = logs.stream().mapToLong(item -> item.getGeneratedCount() == null ? 0 : item.getGeneratedCount()).sum();

        long publishedCount = testCaseRepository.countByOwnerAndCaseStatus(owner, TestCaseStatus.PUBLISHED);
        long draftCount = testCaseRepository.countByOwnerAndCaseStatus(owner, TestCaseStatus.DRAFT);

        long deleteOps = caseAuditLogRepository.countByOwnerAndActionIn(owner, List.of("DELETE_DRAFT", "DELETE_PUBLISHED"));

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("aiGeneratedCaseCount", aiGeneratedCaseCount);
        report.put("textGeneratedCount", totalRuns);
        report.put("excelGeneratedCount", 0);
        report.put("averageCasesPerRun", totalRuns == 0 ? 0 : round2((double) aiGeneratedCaseCount / totalRuns));
        report.put("adoptionRate", percent(publishedCount, draftCount + publishedCount));
        report.put("storageRate", percent(publishedCount, aiGeneratedCaseCount));
        report.put("deleteRate", percent(deleteOps, draftCount + publishedCount + deleteOps));
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> caseStorageReport(String owner) {
        List<TestCaseEntity> published = testCaseRepository.findByOwnerAndCaseStatusOrderByUpdatedAtDesc(owner, TestCaseStatus.PUBLISHED);
        long draftCount = testCaseRepository.countByOwnerAndCaseStatus(owner, TestCaseStatus.DRAFT);
        long publishedCount = published.size();

        long cancelCount = caseAuditLogRepository.countByOwnerAndAction(owner, "CANCEL_PUBLISH");
        long modifyCount = caseAuditLogRepository.countByOwnerAndActionIn(owner, List.of("UPDATE_DRAFT", "UPDATE_PUBLISHED"));
        long deleteCount = caseAuditLogRepository.countByOwnerAndActionIn(owner, List.of("DELETE_DRAFT", "DELETE_PUBLISHED"));

        Map<String, Long> byApi = published.stream()
            .collect(Collectors.groupingBy(
                item -> item.getApiName() == null || item.getApiName().isBlank() ? "UNKNOWN" : item.getApiName(),
                Collectors.counting()
            ));

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("draftCount", draftCount);
        report.put("publishedCount", publishedCount);
        report.put("cancelPublishCount", cancelCount);
        report.put("modifyCount", modifyCount);
        report.put("deleteCount", deleteCount);
        report.put("apiDistribution", topMap(byApi, 20));
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> executionReport(String owner) {
        List<ExecutionEntity> executions = executionRepository.findByOwnerOrderByStartedAtDesc(owner);
        List<ExecutionDetailEntity> details = executionDetailRepository.findByExecution_OwnerOrderByCreatedAtDesc(owner);

        long total = executions.size();
        long passed = executions.stream().filter(item -> item.getStatus() == ExecutionStatus.PASSED).count();
        long failed = executions.stream().filter(item -> item.getStatus() == ExecutionStatus.FAILED).count();
        double avgDurationMs = executions.isEmpty()
            ? 0
            : executions.stream()
                .mapToLong(item -> Duration.between(item.getStartedAt(), item.getFinishedAt()).toMillis())
                .average()
                .orElse(0);

        Map<Long, String> caseIdToApi = buildCaseIdToApiMap(owner, details);

        Map<String, Long> byApi = details.stream().collect(Collectors.groupingBy(
            item -> caseIdToApi.getOrDefault(item.getCaseId(), "UNKNOWN_API"),
            Collectors.counting()
        ));

        Map<String, Long> byCase = details.stream().collect(Collectors.groupingBy(
            item -> item.getCaseName() == null || item.getCaseName().isBlank() ? "UNKNOWN_CASE" : item.getCaseName(),
            Collectors.counting()
        ));

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalExecutions", total);
        report.put("passedExecutions", passed);
        report.put("failedExecutions", failed);
        report.put("failureRate", percent(failed, total));
        report.put("avgDurationMs", round2(avgDurationMs));
        report.put("byApi", topMap(byApi, 20));
        report.put("byCase", topMap(byCase, 20));
        return report;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> resultTrendReport(String owner) {
        List<ExecutionEntity> executions = executionRepository.findByOwnerOrderByStartedAtDesc(owner);
        List<ExecutionDetailEntity> details = executionDetailRepository.findByExecution_OwnerOrderByCreatedAtDesc(owner);

        LocalDate today = LocalDate.now();
        List<Map<String, Object>> dailyTrend = new ArrayList<>();
        for (int i = 13; i >= 0; i--) {
            LocalDate day = today.minusDays(i);
            List<ExecutionEntity> dayRuns = executions.stream()
                .filter(item -> item.getStartedAt().toLocalDate().isEqual(day))
                .toList();

            long total = dayRuns.size();
            long passed = dayRuns.stream().filter(item -> item.getStatus() == ExecutionStatus.PASSED).count();
            long failed = dayRuns.stream().filter(item -> item.getStatus() == ExecutionStatus.FAILED).count();

            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", day.toString());
            point.put("total", total);
            point.put("passed", passed);
            point.put("failed", failed);
            point.put("passRate", percent(passed, total));
            dailyTrend.add(point);
        }

        List<ExecutionEntity> weeklyRuns = executions.stream()
            .filter(item -> !item.getStartedAt().toLocalDate().isBefore(today.minusDays(6)))
            .toList();

        List<ExecutionEntity> monthlyRuns = executions.stream()
            .filter(item -> !item.getStartedAt().toLocalDate().isBefore(today.minusDays(29)))
            .toList();

        Map<Long, String> caseIdToApi = buildCaseIdToApiMap(owner, details);

        Map<String, Long> topFailedApis = details.stream()
            .filter(item -> item.getStatus() == ExecutionStatus.FAILED)
            .collect(Collectors.groupingBy(
                item -> caseIdToApi.getOrDefault(item.getCaseId(), "UNKNOWN_API"),
                Collectors.counting()
            ));

        Map<String, Long> topFailedCases = details.stream()
            .filter(item -> item.getStatus() == ExecutionStatus.FAILED)
            .collect(Collectors.groupingBy(
                item -> item.getCaseName() == null || item.getCaseName().isBlank() ? "UNKNOWN_CASE" : item.getCaseName(),
                Collectors.counting()
            ));

        Map<String, Object> report = new LinkedHashMap<>();
        report.put("dailyTrend", dailyTrend);
        report.put(
            "weeklyPassRate",
            percent(
                weeklyRuns.stream().filter(item -> item.getStatus() == ExecutionStatus.PASSED).count(),
                weeklyRuns.size()
            )
        );
        report.put(
            "monthlyFailureRate",
            percent(
                monthlyRuns.stream().filter(item -> item.getStatus() == ExecutionStatus.FAILED).count(),
                monthlyRuns.size()
            )
        );
        report.put("topFailedApis", topMap(topFailedApis, 10));
        report.put("topFailedCases", topMap(topFailedCases, 10));
        return report;
    }

    private Map<Long, String> buildCaseIdToApiMap(String owner, List<ExecutionDetailEntity> details) {
        Set<Long> ids = details.stream().map(ExecutionDetailEntity::getCaseId).collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }

        return testCaseRepository.findByIdInAndOwner(new ArrayList<>(ids), owner).stream()
            .collect(Collectors.toMap(TestCaseEntity::getId, TestCaseEntity::getApiPath, (left, right) -> left));
    }

    private List<Map<String, Object>> topMap(Map<String, Long> source, int limit) {
        return source.entrySet().stream()
            .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
            .limit(limit)
            .map(item -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("name", item.getKey());
                row.put("value", item.getValue());
                return row;
            })
            .toList();
    }

    private double percent(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0;
        }
        return round2((double) numerator * 100 / denominator);
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
