package com.autotest.platform.aitest;

import com.autotest.platform.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiTestController {

    private final AiTestService aiTestService;

    public AiTestController(AiTestService aiTestService) {
        this.aiTestService = aiTestService;
    }

    @PostMapping("/generate-docs")
    public ApiResponse<AiDocumentResponse> generateDocs(Principal principal, @Valid @RequestBody AiDocumentRequest request) {
        return ApiResponse.ok(aiTestService.generateDocument(principal.getName(), request));
    }

    @PostMapping("/generate-cases")
    public ApiResponse<AiCaseResponse> generateCases(Principal principal, @Valid @RequestBody AiCaseGenerationRequest request) {
        return ApiResponse.ok(aiTestService.generateCases(principal.getName(), request));
    }
}
