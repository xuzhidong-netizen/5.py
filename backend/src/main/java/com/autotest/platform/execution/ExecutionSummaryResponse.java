package com.autotest.platform.execution;

import java.time.LocalDateTime;

public record ExecutionSummaryResponse(
    String runId,
    ExecutionStatus status,
    Integer totalCases,
    Integer passedCases,
    Integer failedCases,
    String summary,
    LocalDateTime startedAt,
    LocalDateTime finishedAt
) {
    static ExecutionSummaryResponse fromEntity(ExecutionEntity entity) {
        return new ExecutionSummaryResponse(
            entity.getRunId(),
            entity.getStatus(),
            entity.getTotalCases(),
            entity.getPassedCases(),
            entity.getFailedCases(),
            entity.getSummary(),
            entity.getStartedAt(),
            entity.getFinishedAt()
        );
    }
}
