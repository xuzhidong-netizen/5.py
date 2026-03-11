package com.autotest.platform.execution;

public record ExecutionDetailItemResponse(
    Long caseId,
    String caseName,
    ExecutionStatus status,
    String message,
    Integer durationMs
) {
    static ExecutionDetailItemResponse fromEntity(ExecutionDetailEntity entity) {
        return new ExecutionDetailItemResponse(
            entity.getCaseId(),
            entity.getCaseName(),
            entity.getStatus(),
            entity.getMessage(),
            entity.getDurationMs()
        );
    }
}
