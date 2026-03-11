package com.autotest.platform.execution;

import com.autotest.platform.common.ApiResponse;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/executions")
public class ExecutionController {

    private final ExecutionService executionService;

    public ExecutionController(ExecutionService executionService) {
        this.executionService = executionService;
    }

    @PostMapping
    public ApiResponse<ExecutionSummaryResponse> run(Principal principal, @Valid @RequestBody ExecutionStartRequest request) {
        return ApiResponse.ok("执行任务已完成", executionService.run(principal.getName(), request.caseIds()));
    }

    @GetMapping
    public ApiResponse<List<ExecutionSummaryResponse>> list(Principal principal) {
        return ApiResponse.ok(executionService.list(principal.getName()));
    }

    @GetMapping("/{runId}")
    public ApiResponse<ExecutionDetailResponse> detail(Principal principal, @PathVariable String runId) {
        return ApiResponse.ok(executionService.detail(principal.getName(), runId));
    }
}
