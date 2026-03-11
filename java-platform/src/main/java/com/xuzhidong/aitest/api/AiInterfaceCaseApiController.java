package com.xuzhidong.aitest.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.xuzhidong.aitest.service.AiInterfaceCaseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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

    @GetMapping("/temp")
    public ApiResponse<List<AiInterfaceCaseService.PreGeneratedCase>> listTempCases(
        @RequestParam(required = false) Integer status
    ) {
        return ApiResponse.ok("查询成功", aiInterfaceCaseService.listTempCases(status));
    }

    @PostMapping("/temp/update")
    public ApiResponse<AiInterfaceCaseService.PreGeneratedCase> updateTempCase(@RequestBody TempUpdateRequest request) {
        try {
            AiInterfaceCaseService.PreGeneratedCase result = aiInterfaceCaseService.updateTempCase(
                new AiInterfaceCaseService.TempCaseUpdateRequest(
                    request.tempId(),
                    request.sysId(),
                    request.sysName(),
                    request.funcNo(),
                    request.funcName(),
                    request.funcType(),
                    request.subFuncType(),
                    request.funcParamMatch(),
                    request.funcHttpUrl(),
                    request.funcRequestMethod(),
                    request.funcRemark(),
                    request.caseId(),
                    request.caseName(),
                    request.caseType(),
                    request.runFlag(),
                    request.caseKvBase(),
                    request.caseKvDynamic(),
                    request.caseCheckFunction(),
                    request.moduleName(),
                    request.caseRemark(),
                    request.businessGoal(),
                    request.scenario()
                )
            );
            return ApiResponse.ok("修改成功", result);
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    @PostMapping("/temp/delete")
    public ApiResponse<AiInterfaceCaseService.BatchActionResult> deleteTempCases(@RequestBody TempIdsRequest request) {
        try {
            return ApiResponse.ok("删除成功", aiInterfaceCaseService.deleteTempCases(request.tempIds()));
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    @PostMapping("/temp/cancel-store")
    public ApiResponse<AiInterfaceCaseService.BatchActionResult> cancelStoreTempCases(@RequestBody TempIdsRequest request) {
        try {
            return ApiResponse.ok("取消入库成功", aiInterfaceCaseService.cancelStoreTempCases(request.tempIds()));
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    @PostMapping("/temp/regenerate")
    public ApiResponse<AiInterfaceCaseService.BatchActionResult> regenerateTempCases(@RequestBody TempRegenerateRequest request) {
        try {
            return ApiResponse.ok(
                "再生成功",
                aiInterfaceCaseService.regenerateTempCases(request.tempIds(), request.copiesPerCase())
            );
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    @PostMapping("/temp/store")
    public ApiResponse<AiInterfaceCaseService.SaveResult> storeTempCases(@RequestBody TempStoreRequest request) {
        try {
            AiInterfaceCaseService.SaveResult result = aiInterfaceCaseService.storeTempCases(
                new AiInterfaceCaseService.TempStoreRequest(
                    request.generationId(),
                    request.tempIds(),
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

    public record TempIdsRequest(
        @JsonProperty("tempIds") @JsonAlias({"temp_ids"}) List<Long> tempIds
    ) {
    }

    public record TempRegenerateRequest(
        @JsonProperty("tempIds") @JsonAlias({"temp_ids"}) List<Long> tempIds,
        @JsonProperty("copiesPerCase") @JsonAlias({"copies_per_case"}) Integer copiesPerCase
    ) {
    }

    public record TempStoreRequest(
        String generationId,
        @JsonProperty("tempIds") @JsonAlias({"temp_ids"}) List<Long> tempIds,
        @JsonProperty("autoExecute") @JsonAlias({"auto_execute"}) Boolean autoExecute
    ) {
    }

    public record TempUpdateRequest(
        Long tempId,
        String sysId,
        String sysName,
        String funcNo,
        String funcName,
        String funcType,
        String subFuncType,
        String funcParamMatch,
        String funcHttpUrl,
        String funcRequestMethod,
        String funcRemark,
        Long caseId,
        String caseName,
        String caseType,
        String runFlag,
        String caseKvBase,
        String caseKvDynamic,
        String caseCheckFunction,
        String moduleName,
        String caseRemark,
        String businessGoal,
        String scenario
    ) {
    }
}
