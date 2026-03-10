package com.xuzhidong.aitest.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.xuzhidong.aitest.service.AiInterfaceCaseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/interface-cases")
public class AiInterfaceCaseApiController {

    private final AiInterfaceCaseService aiInterfaceCaseService;

    public AiInterfaceCaseApiController(AiInterfaceCaseService aiInterfaceCaseService) {
        this.aiInterfaceCaseService = aiInterfaceCaseService;
    }

    @PostMapping("/generate")
    public ApiResponse<AiInterfaceCaseService.GenerateResult> generate(@Valid @RequestBody GenerateRequest request) {
        try {
            AiInterfaceCaseService.GenerateResult result = aiInterfaceCaseService.generate(
                new AiInterfaceCaseService.GenerateRequest(request.textInput(), request.importRows())
            );
            return ApiResponse.ok("AI候选案例生成成功", result);
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    @PostMapping("/save")
    public ApiResponse<AiInterfaceCaseService.SaveResult> save(@Valid @RequestBody SaveRequest request) {
        try {
            AiInterfaceCaseService.SaveResult result = aiInterfaceCaseService.save(
                new AiInterfaceCaseService.SaveRequest(
                    request.generationId(),
                    request.candidateIds(),
                    request.autoExecute()
                )
            );
            String message = result.getExecutionHisId() == null
                ? "入库完成"
                : "入库并触发自动执行成功，hisId=" + result.getExecutionHisId();
            return ApiResponse.ok(message, result);
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    public record GenerateRequest(
        @JsonProperty("textInput") @JsonAlias({"text_input"}) String textInput,
        @JsonProperty("importRows") @JsonAlias({"rows", "excelRows", "import_rows"}) List<Map<String, Object>> importRows
    ) {
    }

    public record SaveRequest(
        @NotBlank String generationId,
        @JsonProperty("candidateIds") @JsonAlias({"candidate_ids"}) List<String> candidateIds,
        @JsonProperty("autoExecute") @JsonAlias({"auto_execute"}) Boolean autoExecute
    ) {
    }
}
