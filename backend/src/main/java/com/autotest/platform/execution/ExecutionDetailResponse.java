package com.autotest.platform.execution;

import java.util.List;

public record ExecutionDetailResponse(
    ExecutionSummaryResponse summary,
    List<ExecutionDetailItemResponse> details
) {
}
