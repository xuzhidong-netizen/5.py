package com.autotest.platform.casecenter;

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
@RequestMapping("/api/v1/cases")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @GetMapping
    public ApiResponse<List<TestCaseResponse>> list(Principal principal) {
        return ApiResponse.ok(testCaseService.listLegacyPublished(principal.getName()));
    }

    @PostMapping
    public ApiResponse<TestCaseResponse> create(Principal principal, @Valid @RequestBody TestCaseRequest request) {
        return ApiResponse.ok("创建成功", testCaseService.createLegacyPublished(principal.getName(), request));
    }

    @PutMapping("/{id}")
    public ApiResponse<TestCaseResponse> update(
        Principal principal,
        @PathVariable Long id,
        @Valid @RequestBody TestCaseRequest request
    ) {
        return ApiResponse.ok("更新成功", testCaseService.updateLegacyPublished(id, principal.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(Principal principal, @PathVariable Long id) {
        testCaseService.deleteLegacyPublished(id, principal.getName());
        return ApiResponse.ok("删除成功", null);
    }
}
