package com.autotest.platform.aitest;

import com.autotest.platform.other.log.PlatformLogService;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AiTestService {

    private final PlatformLogService platformLogService;

    public AiTestService(PlatformLogService platformLogService) {
        this.platformLogService = platformLogService;
    }

    public AiDocumentResponse generateDocument(String owner, AiDocumentRequest request) {
        Instant started = Instant.now();
        try {
            String markdown = "## " + request.apiName() + "\n"
                + "- Path: `" + request.apiPath() + "`\n"
                + "- Method: `" + request.method().toUpperCase() + "`\n"
                + "\n### Request\n" + (request.requestSchema() == null ? "{}" : request.requestSchema())
                + "\n### Response\n" + (request.responseSchema() == null ? "{}" : request.responseSchema());

            String openapi = "{\"openapi\":\"3.0.3\",\"info\":{\"title\":\"" + request.apiName()
                + "\",\"version\":\"1.0.0\"},\"paths\":{\"" + request.apiPath() + "\":{\""
                + request.method().toLowerCase() + "\":{}}}}";

            AiDocumentResponse response = new AiDocumentResponse(markdown, openapi, true, "RULE_BASED_ENGINE");
            int durationMs = (int) Duration.between(started, Instant.now()).toMillis();

            platformLogService.recordAiGeneration(
                owner,
                "DOCUMENT",
                "DOC_TEMPLATE_DEFAULT",
                response.aiEngine(),
                request.apiName() + " " + request.apiPath(),
                markdown.length() > 300 ? markdown.substring(0, 300) : markdown,
                1,
                true,
                0,
                durationMs,
                null
            );
            platformLogService.recordApiCall(
                owner,
                "AI_TEST",
                "/api/v1/ai/generate-docs",
                "POST",
                request.toString(),
                "success",
                200,
                durationMs,
                true,
                null
            );
            platformLogService.recordOperation(
                owner,
                "AI_TEST",
                "GENERATE_DOCUMENT",
                request.toString(),
                "aiEngine=" + response.aiEngine(),
                "SUCCESS",
                "生成接口文档"
            );
            return response;
        } catch (Exception ex) {
            int durationMs = (int) Duration.between(started, Instant.now()).toMillis();
            platformLogService.recordAiGeneration(
                owner,
                "DOCUMENT",
                "DOC_TEMPLATE_DEFAULT",
                "RULE_BASED_ENGINE",
                request.toString(),
                null,
                0,
                false,
                0,
                durationMs,
                ex.getMessage()
            );
            platformLogService.recordApiCall(
                owner,
                "AI_TEST",
                "/api/v1/ai/generate-docs",
                "POST",
                request.toString(),
                null,
                500,
                durationMs,
                false,
                ex.getMessage()
            );
            throw ex;
        }
    }

    public AiCaseResponse generateCases(String owner, AiCaseGenerationRequest request) {
        Instant started = Instant.now();
        try {
            String prefix = request.apiName() + "-" + request.method().toUpperCase();
            AiCaseResponse response = new AiCaseResponse(
                List.of(
                    prefix + " 正常参数返回 200",
                    prefix + " 缺失必填参数返回 400",
                    prefix + " 非法权限返回 401"
                ),
                true,
                "RULE_BASED_ENGINE"
            );

            int durationMs = (int) Duration.between(started, Instant.now()).toMillis();
            platformLogService.recordAiGeneration(
                owner,
                "CASE",
                "CASE_GEN_DEFAULT",
                response.aiEngine(),
                request.apiName() + " " + request.apiPath(),
                String.join(" | ", response.cases()),
                response.cases().size(),
                true,
                0,
                durationMs,
                null
            );
            platformLogService.recordApiCall(
                owner,
                "AI_TEST",
                "/api/v1/ai/generate-cases",
                "POST",
                request.toString(),
                "caseCount=" + response.cases().size(),
                200,
                durationMs,
                true,
                null
            );
            platformLogService.recordOperation(
                owner,
                "AI_TEST",
                "GENERATE_CASES",
                request.toString(),
                "caseCount=" + response.cases().size(),
                "SUCCESS",
                "生成测试案例"
            );
            return response;
        } catch (Exception ex) {
            int durationMs = (int) Duration.between(started, Instant.now()).toMillis();
            platformLogService.recordAiGeneration(
                owner,
                "CASE",
                "CASE_GEN_DEFAULT",
                "RULE_BASED_ENGINE",
                request.toString(),
                null,
                0,
                false,
                0,
                durationMs,
                ex.getMessage()
            );
            platformLogService.recordApiCall(
                owner,
                "AI_TEST",
                "/api/v1/ai/generate-cases",
                "POST",
                request.toString(),
                null,
                500,
                durationMs,
                false,
                ex.getMessage()
            );
            throw ex;
        }
    }
}
