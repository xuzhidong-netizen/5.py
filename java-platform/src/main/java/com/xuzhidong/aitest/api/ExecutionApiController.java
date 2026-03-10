package com.xuzhidong.aitest.api;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.xuzhidong.aitest.model.VersionExecution;
import com.xuzhidong.aitest.service.ExecutionService;
import com.xuzhidong.aitest.service.PlatformStore;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@RestController
public class ExecutionApiController {

    private final ExecutionService executionService;
    private final PlatformStore store;

    public ExecutionApiController(ExecutionService executionService, PlatformStore store) {
        this.executionService = executionService;
        this.store = store;
    }

    @GetMapping("/api/executions")
    public List<VersionExecution> listExecutions() {
        return store.listExecutions();
    }

    @PostMapping("/api/executions/agent")
    public ApiResponse<VersionExecution> runAgent(@RequestBody AgentExecutionRequest request) {
        VersionExecution execution = executionService.startAgentExecution(
            request.iVersionName() == null || request.iVersionName().isBlank() ? "长江e号" : request.iVersionName(),
            request.iVersionNumber() == null || request.iVersionNumber().isBlank() ? "latest" : request.iVersionNumber()
        );
        return ApiResponse.ok("任务已创建", execution);
    }

    @PostMapping("/prod-api/api/v1/forward/517506")
    public ApiResponse<VersionExecution> runAgentCompat(@RequestBody AgentExecutionRequest request) {
        return runAgent(request);
    }

    @GetMapping("/api/executions/{hisId}/status")
    public ApiResponse<VersionExecution> status(@PathVariable String hisId) {
        VersionExecution execution = executionService.statusByHisId(hisId);
        if (execution == null) {
            return ApiResponse.fail("您输入的运行id不存在，请确定后重新输入");
        }
        return ApiResponse.ok("查询成功", execution);
    }

    @PostMapping("/prod-api/aitest/his/list/hisId")
    public ApiResponse<VersionExecution> statusCompat(@RequestBody HisIdRequest request) {
        return status(request.hisId());
    }

    @GetMapping("/api/executions/{hisId}/result")
    public ApiResponse<Map<String, Object>> result(@PathVariable String hisId) {
        VersionExecution execution = executionService.statusByHisId(hisId);
        if (execution == null) {
            return ApiResponse.fail("您输入的运行id不存在，请确定后重新输入");
        }
        return ApiResponse.ok("查询成功", Map.of("total", execution.getDetails().size(), "rows", execution.getDetails()));
    }

    @PostMapping("/prod-api/aitest/upload/detail/list/his/hisId")
    public ApiResponse<Map<String, Object>> resultCompat(@RequestBody HisIdRequest request) {
        return result(request.hisId());
    }

    @PostMapping("/api/executions/devops/authorization")
    public ApiResponse<Map<String, String>> authorization() {
        String token = executionService.generateAuthorizationToken();
        return ApiResponse.ok("操作成功", Map.of("authorization", token));
    }

    @PostMapping("/api/executions/devops/batch")
    public ApiResponse<VersionExecution> devopsBatch(@RequestBody DevopsBatchRequest request) {
        VersionExecution execution = executionService.startDevopsBatch(request.iSysid(), request.iSysver(), request.iResource());
        return ApiResponse.ok("操作成功", execution);
    }

    @PostMapping("/prod-api/aitest/upload/devops/batchCheckData")
    public ApiResponse<VersionExecution> devopsBatchCompat(@RequestBody DevopsBatchRequest request) {
        return devopsBatch(request);
    }

    @GetMapping("/api/executions/devops/status/latest")
    public ApiResponse<VersionExecution> devopsLatestStatus() {
        VersionExecution execution = executionService.latestDevopsStatus();
        if (execution == null) {
            return ApiResponse.fail("当前没有任务正在执行可以执行任务");
        }
        return ApiResponse.ok("操作成功", execution);
    }

    @PostMapping("/prod-api/aitest/his/devops/list/hisId/latest")
    public ApiResponse<VersionExecution> devopsLatestStatusCompat() {
        return devopsLatestStatus();
    }

    @GetMapping("/api/executions/devops/status/{hisId}")
    public ApiResponse<VersionExecution> devopsStatusById(@PathVariable String hisId) {
        return status(hisId);
    }

    @PostMapping("/prod-api/aitest/his/devops/list/{hisId}")
    public ApiResponse<VersionExecution> devopsStatusByIdCompat(@PathVariable String hisId) {
        return status(hisId);
    }

    @GetMapping("/api/executions/devops/result/latest")
    public ApiResponse<Map<String, Object>> devopsLatestResult() {
        VersionExecution execution = executionService.latestDevopsStatus();
        if (execution == null) {
            return ApiResponse.fail("没有可查询的执行结果");
        }
        return result(execution.getHisId());
    }

    @PostMapping("/prod-api/aitest/upload/devops/list/his/detail")
    public ApiResponse<Map<String, Object>> devopsResultCompat(@RequestBody(required = false) HisIdRequest request) {
        if (request == null || request.hisId() == null || request.hisId().isBlank()) {
            return devopsLatestResult();
        }
        return result(request.hisId());
    }

    @GetMapping("/api/executions/devops/result/{hisId}")
    public ApiResponse<Map<String, Object>> devopsResultById(@PathVariable String hisId) {
        return result(hisId);
    }

    @PostMapping("/prod-api/api/v1/forward/517268")
    public ApiResponse<?> devopsBus(@RequestBody DevopsBusRequest request) {
        String requestData = request.iRequestData();
        if (requestData == null || requestData.isBlank()) {
            return ApiResponse.fail("i_request_data 不能为空");
        }
        String normalized = requestData.trim().toLowerCase(Locale.ROOT);
        if ("authorization".equals(normalized)) {
            return authorization();
        }
        if ("aitest_devops_batch".equals(normalized)) {
            return devopsBatch(new DevopsBatchRequest(request.iResource(), request.iSysid(), request.iSysver()));
        }
        if (normalized.startsWith("aitest_devops_hisid")) {
            String[] parts = requestData.split(":", 2);
            if (parts.length == 2 && !parts[1].isBlank()) {
                return devopsStatusById(parts[1].trim());
            }
            return devopsLatestStatus();
        }
        if (normalized.startsWith("aitest_devops_detail")) {
            String[] parts = requestData.split(":", 2);
            if (parts.length == 2 && !parts[1].isBlank()) {
                return devopsResultById(parts[1].trim());
            }
            return devopsLatestResult();
        }
        return ApiResponse.fail("不支持的请求类型: " + requestData);
    }

    public record AgentExecutionRequest(
        @JsonProperty("i_version_name") @JsonAlias({"iVersionName"}) String iVersionName,
        @JsonProperty("i_version_number") @JsonAlias({"iVersionNumber"}) String iVersionNumber
    ) {
    }

    public record HisIdRequest(@NotBlank String hisId) {
    }

    public record DevopsBatchRequest(
        @JsonProperty("i_resource") @JsonAlias({"iResource"}) String iResource,
        @JsonProperty("i_sysid") @JsonAlias({"iSysid"}) String iSysid,
        @JsonProperty("i_sysver") @JsonAlias({"iSysver"}) String iSysver
    ) {
    }

    public record DevopsBusRequest(
        @JsonProperty("i_request_data") @JsonAlias({"iRequestData"}) String iRequestData,
        @JsonProperty("i_resource") @JsonAlias({"iResource"}) String iResource,
        @JsonProperty("i_sysid") @JsonAlias({"iSysid"}) String iSysid,
        @JsonProperty("i_sysver") @JsonAlias({"iSysver"}) String iSysver
    ) {
    }
}
