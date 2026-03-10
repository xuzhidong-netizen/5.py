package com.xuzhidong.aitest.api;

import com.xuzhidong.aitest.model.AiFunction;
import com.xuzhidong.aitest.service.PlatformStore;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class FunctionApiController {

    private final PlatformStore store;

    public FunctionApiController(PlatformStore store) {
        this.store = store;
    }

    @GetMapping("/api/functions")
    public List<AiFunction> listFunctions() {
        return store.listFunctions();
    }

    @PostMapping("/api/functions")
    public ApiResponse<AiFunction> createFunction(@Valid @RequestBody FunctionCreateRequest request) {
        try {
            AiFunction function = request.toModel();
            AiFunction saved = store.addFunction(function);
            return ApiResponse.ok("接口新增成功", saved);
        } catch (IllegalArgumentException ex) {
            return ApiResponse.fail(ex.getMessage());
        }
    }

    @PostMapping("/prod-api/aitest/aifunc/add")
    public ApiResponse<AiFunction> createFunctionCompat(@Valid @RequestBody FunctionCreateRequest request) {
        return createFunction(request);
    }

    public record FunctionCreateRequest(
        @NotBlank String sysId,
        @NotBlank String sysName,
        @NotBlank String funcNo,
        @NotBlank String funcName,
        @NotBlank String funcType,
        String subFuncType,
        String funcParamMatch,
        String funcHttpUrl,
        String funcRequestMethod,
        String funcRemark
    ) {
        AiFunction toModel() {
            AiFunction model = new AiFunction();
            model.setSysId(sysId);
            model.setSysName(sysName);
            model.setFuncNo(funcNo);
            model.setFuncName(funcName);
            model.setFuncType(funcType);
            model.setSubFuncType(subFuncType);
            model.setFuncParamMatch(funcParamMatch);
            model.setFuncHttpUrl(funcHttpUrl);
            model.setFuncRequestMethod(funcRequestMethod == null ? "POST" : funcRequestMethod);
            model.setFuncRemark(funcRemark);
            return model;
        }
    }
}
