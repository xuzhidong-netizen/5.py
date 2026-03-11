package com.autotest.platform.casecenter;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CaseFormRequest(
    @NotBlank @Size(max = 120) String caseName,
    @NotBlank @Size(max = 120) String apiName,
    @NotBlank @Size(max = 255) String apiPath,
    @NotBlank @Size(max = 10) String requestMethod,
    String requestHeaders,
    String requestParams,
    String expectedResult,
    @Size(max = 64) String assertType,
    String remark,
    @NotNull @Min(100) @Max(599) Integer expectedStatus,
    Boolean enabled
) {
}
