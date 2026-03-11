package com.autotest.platform.other.log;

import com.autotest.platform.common.ApiResponse;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/other/logs")
public class LogCenterController {

    private final LogCenterService logCenterService;

    public LogCenterController(LogCenterService logCenterService) {
        this.logCenterService = logCenterService;
    }

    @GetMapping("/operations")
    public ApiResponse<List<Map<String, Object>>> operations(
        Principal principal,
        @RequestParam(defaultValue = "100") int limit
    ) {
        return ApiResponse.ok(logCenterService.listOperationLogs(principal.getName(), sanitizeLimit(limit)));
    }

    @GetMapping("/api-calls")
    public ApiResponse<List<Map<String, Object>>> apiCalls(
        Principal principal,
        @RequestParam(defaultValue = "100") int limit
    ) {
        return ApiResponse.ok(logCenterService.listApiCallLogs(principal.getName(), sanitizeLimit(limit)));
    }

    @GetMapping("/ai-generations")
    public ApiResponse<List<Map<String, Object>>> aiGenerations(
        Principal principal,
        @RequestParam(defaultValue = "100") int limit
    ) {
        return ApiResponse.ok(logCenterService.listAiGenerationLogs(principal.getName(), sanitizeLimit(limit)));
    }

    @GetMapping("/executions")
    public ApiResponse<List<Map<String, Object>>> executions(
        Principal principal,
        @RequestParam(defaultValue = "100") int limit
    ) {
        return ApiResponse.ok(logCenterService.listExecutionLogs(principal.getName(), sanitizeLimit(limit)));
    }

    @GetMapping("/exceptions")
    public ApiResponse<List<Map<String, Object>>> exceptions(
        Principal principal,
        @RequestParam(defaultValue = "100") int limit
    ) {
        return ApiResponse.ok(logCenterService.listExceptionLogs(principal.getName(), sanitizeLimit(limit)));
    }

    private int sanitizeLimit(int limit) {
        if (limit < 1) {
            return 10;
        }
        return Math.min(limit, 500);
    }
}
