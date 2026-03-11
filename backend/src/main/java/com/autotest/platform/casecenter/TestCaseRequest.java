package com.autotest.platform.casecenter;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TestCaseRequest(
    @NotBlank @Size(max = 120) String caseName,
    @NotBlank @Size(max = 80) String moduleName,
    @NotBlank @Size(max = 10) String method,
    @NotBlank @Size(max = 255) String apiPath,
    String requestBody,
    @NotNull @Min(100) @Max(599) Integer expectedStatus,
    @NotNull Boolean enabled
) {
}
