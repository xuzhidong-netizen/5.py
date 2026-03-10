package com.xuzhidong.aitest.api;

import com.xuzhidong.aitest.model.AiCase;
import com.xuzhidong.aitest.service.PlatformStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class CaseApiController {

    private final PlatformStore store;

    public CaseApiController(PlatformStore store) {
        this.store = store;
    }

    @GetMapping("/api/cases")
    public List<AiCase> listCases() {
        return store.listCases();
    }

    @PostMapping("/api/cases")
    public ApiResponse<AiCase> createCase(@Valid @RequestBody CaseCreateRequest request) {
        try {
            AiCase aiCase = request.toModel();
            store.findFunction(aiCase.getSysId(), aiCase.getFuncNo()).ifPresentOrElse(function -> {
                if (isBlank(aiCase.getFuncName())) {
                    aiCase.setFuncName(function.getFuncName());
                }
                if (isBlank(aiCase.getFuncType())) {
                    aiCase.setFuncType(function.getFuncType());
                }
                if (isBlank(aiCase.getSubFuncType())) {
                    aiCase.setSubFuncType(function.getSubFuncType());
                }
            }, () -> store.firstFunctionBySysId(aiCase.getSysId()).ifPresent(function -> {
                if (isBlank(aiCase.getFuncType())) {
                    aiCase.setFuncType(function.getFuncType());
                }
            }));
            AiCase saved = store.addCase(aiCase);
            return ApiResponse.ok("案例新增成功", saved);
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    @PostMapping("/prod-api/aitest/aicase/add")
    public ApiResponse<AiCase> createCaseCompat(@Valid @RequestBody CaseCreateRequest request) {
        return createCase(request);
    }

    public record CaseCreateRequest(
        @NotBlank String sysId,
        @NotBlank String sysName,
        @NotNull Long caseId,
        @NotBlank String caseName,
        String caseType,
        String runFlag,
        @NotBlank String caseKvBase,
        String caseKvDynamic,
        String caseExpectResult,
        String caseCheckErrorNo,
        String caseCheckFunction,
        String caseRemark,
        @NotBlank String funcNo,
        String funcName,
        String funcType,
        String subFuncType,
        @NotBlank String moduleName
    ) {
        AiCase toModel() {
            AiCase model = new AiCase();
            model.setSysId(sysId);
            model.setSysName(sysName);
            model.setCaseId(caseId);
            model.setCaseName(caseName);
            model.setCaseType(caseType == null ? "正例" : caseType);
            model.setRunFlag(runFlag == null ? "1" : runFlag);
            model.setCaseKvBase(caseKvBase);
            model.setCaseKvDynamic(caseKvDynamic);
            model.setCaseExpectResult(caseExpectResult);
            model.setCaseCheckErrorNo(caseCheckErrorNo);
            model.setCaseCheckFunction(caseCheckFunction);
            model.setCaseRemark(caseRemark);
            model.setFuncNo(funcNo);
            model.setFuncName(funcName);
            model.setFuncType(funcType == null ? "yn" : funcType);
            model.setSubFuncType(subFuncType == null ? "trade" : subFuncType);
            model.setModuleName(moduleName);
            return model;
        }
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
