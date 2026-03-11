package com.autotest.platform.other.config;

import com.autotest.platform.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/other/ai-config")
public class AiConfigController {

    private final AiConfigService aiConfigService;

    public AiConfigController(AiConfigService aiConfigService) {
        this.aiConfigService = aiConfigService;
    }

    @GetMapping("/{type}")
    public ApiResponse<List<AiConfigItemResponse>> list(Principal principal, @PathVariable AiConfigType type) {
        return ApiResponse.ok(aiConfigService.list(principal.getName(), type));
    }

    @PostMapping("/{type}")
    public ApiResponse<AiConfigItemResponse> create(
        Principal principal,
        @PathVariable AiConfigType type,
        @Valid @RequestBody AiConfigItemRequest request
    ) {
        return ApiResponse.ok("配置新增成功", aiConfigService.create(principal.getName(), type, request));
    }

    @PutMapping("/{type}/{id}")
    public ApiResponse<AiConfigItemResponse> update(
        Principal principal,
        @PathVariable AiConfigType type,
        @PathVariable Long id,
        @Valid @RequestBody AiConfigItemRequest request
    ) {
        return ApiResponse.ok("配置更新成功", aiConfigService.update(principal.getName(), type, id, request));
    }

    @DeleteMapping("/{type}/{id}")
    public ApiResponse<Void> delete(Principal principal, @PathVariable AiConfigType type, @PathVariable Long id) {
        aiConfigService.delete(principal.getName(), type, id);
        return ApiResponse.ok("配置删除成功", null);
    }
}
