package com.autotest.platform.other.report;

import com.autotest.platform.common.ApiResponse;
import java.security.Principal;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/other/reports")
public class ReportCenterController {

    private final ReportCenterService reportCenterService;

    public ReportCenterController(ReportCenterService reportCenterService) {
        this.reportCenterService = reportCenterService;
    }

    @GetMapping("/document")
    public ApiResponse<Map<String, Object>> documentReport(Principal principal) {
        return ApiResponse.ok(reportCenterService.documentReport(principal.getName()));
    }

    @GetMapping("/case-generation")
    public ApiResponse<Map<String, Object>> caseGenerationReport(Principal principal) {
        return ApiResponse.ok(reportCenterService.caseGenerationReport(principal.getName()));
    }

    @GetMapping("/case-storage")
    public ApiResponse<Map<String, Object>> caseStorageReport(Principal principal) {
        return ApiResponse.ok(reportCenterService.caseStorageReport(principal.getName()));
    }

    @GetMapping("/execution")
    public ApiResponse<Map<String, Object>> executionReport(Principal principal) {
        return ApiResponse.ok(reportCenterService.executionReport(principal.getName()));
    }

    @GetMapping("/result-trend")
    public ApiResponse<Map<String, Object>> resultTrendReport(Principal principal) {
        return ApiResponse.ok(reportCenterService.resultTrendReport(principal.getName()));
    }
}
