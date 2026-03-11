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
@RequestMapping("/api/case")
public class CaseManagementController {

    private final TestCaseService testCaseService;

    public CaseManagementController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @GetMapping("/draft/list")
    public ApiResponse<List<TestCaseResponse>> listDraft(Principal principal) {
        return ApiResponse.ok(testCaseService.listDraftByOwner(principal.getName()));
    }

    @PostMapping("/draft")
    public ApiResponse<TestCaseResponse> createDraft(Principal principal, @Valid @RequestBody CaseFormRequest request) {
        return ApiResponse.ok("草稿创建成功", testCaseService.createDraft(principal.getName(), request));
    }

    @PutMapping("/draft/{id}")
    public ApiResponse<TestCaseResponse> updateDraft(
        Principal principal,
        @PathVariable Long id,
        @Valid @RequestBody CaseFormRequest request
    ) {
        return ApiResponse.ok("草稿更新成功", testCaseService.updateDraft(id, principal.getName(), request));
    }

    @PutMapping("/draft/{id}/publish")
    public ApiResponse<TestCaseResponse> publishDraft(Principal principal, @PathVariable Long id) {
        return ApiResponse.ok("采纳入库成功", testCaseService.publishDraft(id, principal.getName()));
    }

    @DeleteMapping("/draft/{id}")
    public ApiResponse<Void> deleteDraft(Principal principal, @PathVariable Long id) {
        testCaseService.deleteDraft(id, principal.getName());
        return ApiResponse.ok("删除成功", null);
    }

    @GetMapping("/published/list")
    public ApiResponse<List<TestCaseResponse>> listPublished(Principal principal) {
        return ApiResponse.ok(testCaseService.listPublishedByOwner(principal.getName()));
    }

    @PostMapping("/published")
    public ApiResponse<TestCaseResponse> createPublished(Principal principal, @Valid @RequestBody CaseFormRequest request) {
        return ApiResponse.ok("案例新增成功", testCaseService.createPublished(principal.getName(), request));
    }

    @PutMapping("/published/{id}")
    public ApiResponse<TestCaseResponse> updatePublished(
        Principal principal,
        @PathVariable Long id,
        @Valid @RequestBody CaseFormRequest request
    ) {
        return ApiResponse.ok("修改成功", testCaseService.updatePublished(id, principal.getName(), request));
    }

    @DeleteMapping("/published/{id}")
    public ApiResponse<Void> deletePublished(Principal principal, @PathVariable Long id) {
        testCaseService.deletePublished(id, principal.getName());
        return ApiResponse.ok("删除成功", null);
    }

    @PutMapping("/published/{id}/cancel-publish")
    public ApiResponse<TestCaseResponse> cancelPublish(
        Principal principal,
        @PathVariable Long id,
        @RequestBody(required = false) CaseActionRequest request
    ) {
        boolean force = request != null && request.forceOrFalse();
        return ApiResponse.ok("取消入库成功", testCaseService.cancelPublish(id, principal.getName(), force));
    }

    @PutMapping("/published/cancel-publish/batch")
    public ApiResponse<CaseBatchResult> batchCancelPublish(
        Principal principal,
        @Valid @RequestBody CaseBatchRequest request
    ) {
        return ApiResponse.ok(
            "批量取消入库完成",
            testCaseService.batchCancelPublish(principal.getName(), request.ids(), request.forceOrFalse())
        );
    }

    @PutMapping("/published/delete/batch")
    public ApiResponse<CaseBatchResult> batchDeletePublished(
        Principal principal,
        @Valid @RequestBody CaseBatchRequest request
    ) {
        return ApiResponse.ok(
            "批量删除完成",
            testCaseService.batchDeletePublished(principal.getName(), request.ids())
        );
    }
}
