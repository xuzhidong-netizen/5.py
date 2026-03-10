package com.xuzhidong.aitest.api;

import com.xuzhidong.aitest.model.AiFunction;
import com.xuzhidong.aitest.model.PlatformSummary;
import com.xuzhidong.aitest.model.VersionSupport;
import com.xuzhidong.aitest.service.PlatformStore;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class QueryApiController {

    private final PlatformStore store;

    public QueryApiController(PlatformStore store) {
        this.store = store;
    }

    @GetMapping("/api/summary")
    public PlatformSummary summary() {
        return store.buildSummary();
    }

    @GetMapping("/api/versions/support")
    public List<VersionSupport> versions() {
        return store.listVersionSupports();
    }

    @GetMapping("/api/functions/lookup")
    public List<Map<String, Object>> functionLookup() {
        return store.listFunctions().stream().map(this::toLookup).toList();
    }

    @PostMapping("/prod-api/api/v1/forward/517508")
    public ApiResponse<List<VersionSupport>> querySupportedVersionCompat() {
        return ApiResponse.ok("查询成功", store.listVersionSupports());
    }

    @PostMapping("/prod-api/api/v1/forward/517504")
    public ApiResponse<List<Map<String, Object>>> queryFunctionInfoCompat() {
        return ApiResponse.ok("查询成功", functionLookup());
    }

    private Map<String, Object> toLookup(AiFunction item) {
        return Map.ofEntries(
            Map.entry("function_id", item.getId()),
            Map.entry("i_function_id", item.getId()),
            Map.entry("i_function_id_doc", item.getFuncNo()),
            Map.entry("function_id_doc", item.getFuncNo()),
            Map.entry("i_function_name", item.getFuncName()),
            Map.entry("function_name", item.getFuncName()),
            Map.entry("sys_id", item.getSysId()),
            Map.entry("i_sys_id", item.getSysId()),
            Map.entry("i_sys_ver", "latest"),
            Map.entry("i_resource", "0"),
            Map.entry("i_run_flag", "1"),
            Map.entry("function_seq", item.getId()),
            Map.entry("i_function_seq", item.getId()),
            Map.entry("sys_ver", "latest"),
            Map.entry("func_no_string", item.getFuncNo()),
            Map.entry("run_flag", "1")
        );
    }
}
