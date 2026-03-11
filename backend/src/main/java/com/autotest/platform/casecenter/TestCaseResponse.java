package com.autotest.platform.casecenter;

import java.time.LocalDateTime;

public record TestCaseResponse(
    Long id,
    String caseName,
    String apiName,
    String moduleName,
    String requestMethod,
    String method,
    String apiPath,
    String requestHeaders,
    String requestParams,
    String requestBody,
    Integer expectedStatus,
    String expectedResult,
    String assertType,
    String remark,
    Boolean enabled,
    TestCaseStatus caseStatus,
    String owner,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime publishedAt
) {
    static TestCaseResponse fromEntity(TestCaseEntity entity) {
        return new TestCaseResponse(
            entity.getId(),
            entity.getCaseName(),
            entity.getApiName(),
            entity.getModuleName(),
            entity.getMethod(),
            entity.getMethod(),
            entity.getApiPath(),
            entity.getRequestHeaders(),
            entity.getRequestParams(),
            entity.getRequestBody(),
            entity.getExpectedStatus(),
            entity.getExpectedResult(),
            entity.getAssertType(),
            entity.getRemark(),
            entity.getEnabled(),
            entity.getCaseStatus(),
            entity.getOwner(),
            entity.getCreatedAt(),
            entity.getUpdatedAt(),
            entity.getPublishedAt()
        );
    }
}
