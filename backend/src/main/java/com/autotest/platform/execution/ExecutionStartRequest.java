package com.autotest.platform.execution;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record ExecutionStartRequest(@NotEmpty List<Long> caseIds) {
}
