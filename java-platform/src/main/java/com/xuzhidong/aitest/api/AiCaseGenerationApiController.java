package com.xuzhidong.aitest.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.xuzhidong.aitest.service.AiCaseGenerationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class AiCaseGenerationApiController {

    private final AiCaseGenerationService aiCaseGenerationService;

    public AiCaseGenerationApiController(AiCaseGenerationService aiCaseGenerationService) {
        this.aiCaseGenerationService = aiCaseGenerationService;
    }

    @PostMapping("/api/ai/cases/generate")
    public ApiResponse<Map<String, Object>> generate(@Valid @RequestBody AiCaseGenerateRequest request) {
        try {
            AiCaseGenerationService.GenerationResult result = aiCaseGenerationService.generate(
                new AiCaseGenerationService.GenerationRequest(
                    request.sysId(),
                    request.sysName(),
                    request.funcNo(),
                    request.caseId(),
                    request.moduleName(),
                    request.scenario(),
                    request.businessGoal(),
                    request.environment(),
                    request.version(),
                    request.autoSave()
                )
            );
            return ApiResponse.ok(result.saved() ? "AI生成并保存成功" : "AI生成成功", Map.of(
                "saved", result.saved(),
                "model", result.model(),
                "generationPrompt", result.generationPrompt(),
                "generatedCase", result.generatedCase()
            ));
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    public record AiCaseGenerateRequest(
        @NotBlank String sysId,
        String sysName,
        @NotBlank String funcNo,
        Long caseId,
        String moduleName,
        String scenario,
        @NotBlank String businessGoal,
        String environment,
        String version,
        @JsonProperty("auto_save") @JsonAlias({"autoSave"}) Boolean autoSave
    ) {
    }
}
