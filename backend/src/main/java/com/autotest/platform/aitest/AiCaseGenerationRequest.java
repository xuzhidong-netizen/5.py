package com.autotest.platform.aitest;

import jakarta.validation.constraints.NotBlank;

public record AiCaseGenerationRequest(
    @NotBlank String apiName,
    @NotBlank String apiPath,
    @NotBlank String method,
    String businessRule
) {
}
