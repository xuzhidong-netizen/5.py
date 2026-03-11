package com.autotest.platform.dashboard;

public record DashboardResponse(
    String username,
    long totalCases,
    long enabledCases,
    long totalExecutions,
    long passedExecutions,
    long failedExecutions,
    String latestRunId
) {
}
