package com.autotest.platform.other.log;

import com.autotest.platform.casecenter.CaseAuditLogEntity;
import com.autotest.platform.casecenter.CaseAuditLogRepository;
import com.autotest.platform.execution.ExecutionEntity;
import com.autotest.platform.execution.ExecutionRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LogCenterService {

    private final OperationLogRepository operationLogRepository;
    private final ApiCallLogRepository apiCallLogRepository;
    private final AiGenerateLogRepository aiGenerateLogRepository;
    private final ExceptionLogRepository exceptionLogRepository;
    private final CaseAuditLogRepository caseAuditLogRepository;
    private final ExecutionRepository executionRepository;

    public LogCenterService(
        OperationLogRepository operationLogRepository,
        ApiCallLogRepository apiCallLogRepository,
        AiGenerateLogRepository aiGenerateLogRepository,
        ExceptionLogRepository exceptionLogRepository,
        CaseAuditLogRepository caseAuditLogRepository,
        ExecutionRepository executionRepository
    ) {
        this.operationLogRepository = operationLogRepository;
        this.apiCallLogRepository = apiCallLogRepository;
        this.aiGenerateLogRepository = aiGenerateLogRepository;
        this.exceptionLogRepository = exceptionLogRepository;
        this.caseAuditLogRepository = caseAuditLogRepository;
        this.executionRepository = executionRepository;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listOperationLogs(String owner, int limit) {
        List<Map<String, Object>> merged = new ArrayList<>();

        operationLogRepository.findByOwnerOrderByCreatedAtDesc(owner).forEach(item -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", item.getId());
            row.put("module", item.getModuleName());
            row.put("action", item.getActionType());
            row.put("result", item.getResult());
            row.put("message", item.getMessage());
            row.put("createdAt", item.getCreatedAt());
            row.put("requestPayload", item.getRequestPayload());
            row.put("responsePayload", item.getResponsePayload());
            merged.add(row);
        });

        caseAuditLogRepository.findByOwnerOrderByCreatedAtDesc(owner).forEach(item -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", "CASE-" + item.getId());
            row.put("module", "CASE_CENTER_AUDIT");
            row.put("action", item.getAction());
            row.put("result", "SUCCESS");
            row.put("message", item.getNote());
            row.put("createdAt", item.getCreatedAt());
            row.put("requestPayload", item.getBeforeContent());
            row.put("responsePayload", item.getAfterContent());
            merged.add(row);
        });

        return merged.stream()
            .sorted(Comparator.comparing(item -> String.valueOf(item.get("createdAt")), Comparator.reverseOrder()))
            .limit(limit)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listApiCallLogs(String owner, int limit) {
        return apiCallLogRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
            .limit(limit)
            .map(item -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", item.getId());
                row.put("module", item.getModuleName());
                row.put("endpoint", item.getEndpoint());
                row.put("httpMethod", item.getHttpMethod());
                row.put("statusCode", item.getStatusCode());
                row.put("durationMs", item.getDurationMs());
                row.put("success", item.getSuccess());
                row.put("errorMessage", item.getErrorMessage());
                row.put("createdAt", item.getCreatedAt());
                return row;
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listAiGenerationLogs(String owner, int limit) {
        return aiGenerateLogRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
            .limit(limit)
            .map(item -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", item.getId());
                row.put("generateType", item.getGenerateType());
                row.put("templateName", item.getTemplateName());
                row.put("modelName", item.getModelName());
                row.put("generatedCount", item.getGeneratedCount());
                row.put("success", item.getSuccess());
                row.put("tokenUsage", item.getTokenUsage());
                row.put("durationMs", item.getDurationMs());
                row.put("errorMessage", item.getErrorMessage());
                row.put("createdAt", item.getCreatedAt());
                return row;
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listExecutionLogs(String owner, int limit) {
        return executionRepository.findByOwnerOrderByStartedAtDesc(owner).stream()
            .limit(limit)
            .map(this::toExecutionLog)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listExceptionLogs(String owner, int limit) {
        return exceptionLogRepository.findByOwnerOrderByCreatedAtDesc(owner).stream()
            .limit(limit)
            .map(item -> {
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", item.getId());
                row.put("module", item.getModuleName());
                row.put("exceptionType", item.getExceptionType());
                row.put("errorMessage", item.getErrorMessage());
                row.put("stackTrace", item.getStackTrace());
                row.put("createdAt", item.getCreatedAt());
                return row;
            })
            .toList();
    }

    private Map<String, Object> toExecutionLog(ExecutionEntity entity) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("runId", entity.getRunId());
        row.put("status", entity.getStatus());
        row.put("totalCases", entity.getTotalCases());
        row.put("passedCases", entity.getPassedCases());
        row.put("failedCases", entity.getFailedCases());
        row.put("summary", entity.getSummary());
        row.put("startedAt", entity.getStartedAt());
        row.put("finishedAt", entity.getFinishedAt());
        row.put("createdAt", entity.getCreatedAt());
        return row;
    }
}
