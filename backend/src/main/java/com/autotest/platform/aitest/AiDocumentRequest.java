package com.autotest.platform.aitest;

import jakarta.validation.constraints.NotBlank;

public record AiDocumentRequest(
    @NotBlank String apiName,
    @NotBlank String apiPath,
    @NotBlank String method,
    String requestSchema,
    String responseSchema
) {
}
