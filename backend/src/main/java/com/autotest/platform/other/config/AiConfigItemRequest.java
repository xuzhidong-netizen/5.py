package com.autotest.platform.other.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AiConfigItemRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 80) String configKey,
    @Size(max = 160) String scope,
    String content,
    Boolean enabled
) {
}
