package com.autotest.platform.casecenter;

import com.autotest.platform.execution.ExecutionDetailRepository;
import com.autotest.platform.execution.ExecutionStatus;
import com.autotest.platform.other.log.PlatformLogService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestCaseService {

    private static final String DELETE_RUNNING_MESSAGE = "该案例正在执行中，暂不支持删除";
    private static final String CANCEL_WARNING_MESSAGE = "该案例已关联执行计划，取消入库后可能影响执行任务，是否继续？";

    private final TestCaseRepository testCaseRepository;
    private final CaseAuditLogRepository caseAuditLogRepository;
    private final ExecutionDetailRepository executionDetailRepository;
    private final ObjectMapper objectMapper;
    private final PlatformLogService platformLogService;

    public TestCaseService(
        TestCaseRepository testCaseRepository,
        CaseAuditLogRepository caseAuditLogRepository,
        ExecutionDetailRepository executionDetailRepository,
        ObjectMapper objectMapper,
        PlatformLogService platformLogService
    ) {
        this.testCaseRepository = testCaseRepository;
        this.caseAuditLogRepository = caseAuditLogRepository;
        this.executionDetailRepository = executionDetailRepository;
        this.objectMapper = objectMapper;
        this.platformLogService = platformLogService;
    }

    @Transactional(readOnly = true)
    public List<TestCaseResponse> listDraftByOwner(String owner) {
        return testCaseRepository.findByOwnerAndCaseStatusOrderByUpdatedAtDesc(owner, TestCaseStatus.DRAFT).stream()
            .map(TestCaseResponse::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<TestCaseResponse> listPublishedByOwner(String owner) {
        return testCaseRepository.findByOwnerAndCaseStatusOrderByUpdatedAtDesc(owner, TestCaseStatus.PUBLISHED).stream()
            .map(TestCaseResponse::fromEntity)
            .toList();
    }

    @Transactional
    public TestCaseResponse createDraft(String owner, CaseFormRequest request) {
        TestCaseEntity entity = new TestCaseEntity();
        entity.setOwner(owner);
        applyForm(entity, request);
        entity.setCaseStatus(TestCaseStatus.DRAFT);
        entity.setPublishedAt(null);
        TestCaseEntity saved = testCaseRepository.save(entity);
        logChange(saved.getId(), owner, "CREATE_DRAFT", null, snapshot(saved), "草稿创建");
        return TestCaseResponse.fromEntity(saved);
    }

    @Transactional
    public TestCaseResponse createPublished(String owner, CaseFormRequest request) {
        TestCaseEntity entity = new TestCaseEntity();
        entity.setOwner(owner);
        applyForm(entity, request);
        entity.setCaseStatus(TestCaseStatus.PUBLISHED);
        entity.setPublishedAt(LocalDateTime.now());
        TestCaseEntity saved = testCaseRepository.save(entity);
        logChange(saved.getId(), owner, "CREATE_PUBLISHED", null, snapshot(saved), "直接入库创建");
        return TestCaseResponse.fromEntity(saved);
    }

    @Transactional
    public TestCaseResponse updateDraft(Long id, String owner, CaseFormRequest request) {
        TestCaseEntity entity = getCaseByStatus(id, owner, TestCaseStatus.DRAFT);
        String before = snapshot(entity);
        applyForm(entity, request);
        TestCaseEntity saved = testCaseRepository.save(entity);
        logChange(saved.getId(), owner, "UPDATE_DRAFT", before, snapshot(saved), "草稿修改");
        return TestCaseResponse.fromEntity(saved);
    }

    @Transactional
    public TestCaseResponse updatePublished(Long id, String owner, CaseFormRequest request) {
        TestCaseEntity entity = getCaseByStatus(id, owner, TestCaseStatus.PUBLISHED);
        String before = snapshot(entity);
        applyForm(entity, request);
        TestCaseEntity saved = testCaseRepository.save(entity);
        logChange(saved.getId(), owner, "UPDATE_PUBLISHED", before, snapshot(saved), "已入库案例修改");
        return TestCaseResponse.fromEntity(saved);
    }

    @Transactional
    public TestCaseResponse publishDraft(Long id, String owner) {
        TestCaseEntity entity = getCaseByStatus(id, owner, TestCaseStatus.DRAFT);
        String before = snapshot(entity);
        entity.setCaseStatus(TestCaseStatus.PUBLISHED);
        entity.setPublishedAt(LocalDateTime.now());
        TestCaseEntity saved = testCaseRepository.save(entity);
        logChange(saved.getId(), owner, "PUBLISH", before, snapshot(saved), "采纳入库");
        return TestCaseResponse.fromEntity(saved);
    }

    @Transactional
    public TestCaseResponse cancelPublish(Long id, String owner, boolean force) {
        TestCaseEntity entity = getCaseByStatus(id, owner, TestCaseStatus.PUBLISHED);
        boolean associatedExecution = executionDetailRepository.existsByCaseIdAndExecution_Owner(entity.getId(), owner);
        if (associatedExecution && !force) {
            throw new IllegalArgumentException(CANCEL_WARNING_MESSAGE);
        }

        String before = snapshot(entity);
        entity.setCaseStatus(TestCaseStatus.DRAFT);
        entity.setPublishedAt(null);
        TestCaseEntity saved = testCaseRepository.save(entity);
        logChange(saved.getId(), owner, "CANCEL_PUBLISH", before, snapshot(saved), "取消入库");
        return TestCaseResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteDraft(Long id, String owner) {
        TestCaseEntity entity = getCaseByStatus(id, owner, TestCaseStatus.DRAFT);
        String before = snapshot(entity);
        markDeleted(entity);
        testCaseRepository.save(entity);
        logChange(entity.getId(), owner, "DELETE_DRAFT", before, null, "删除草稿");
    }

    @Transactional
    public void deletePublished(Long id, String owner) {
        TestCaseEntity entity = getCaseByStatus(id, owner, TestCaseStatus.PUBLISHED);
        boolean running = executionDetailRepository.existsByCaseIdAndExecution_OwnerAndExecution_Status(
            entity.getId(),
            owner,
            ExecutionStatus.RUNNING
        );
        if (running) {
            throw new IllegalArgumentException(DELETE_RUNNING_MESSAGE);
        }

        String before = snapshot(entity);
        markDeleted(entity);
        testCaseRepository.save(entity);
        logChange(entity.getId(), owner, "DELETE_PUBLISHED", before, null, "删除已入库案例");
    }

    @Transactional
    public CaseBatchResult batchCancelPublish(String owner, List<Long> ids, boolean force) {
        validateBatchIds(ids);

        CaseBatchResult result = new CaseBatchResult();
        for (Long id : sanitizeIds(ids)) {
            try {
                cancelPublish(id, owner, force);
                result.setAffectedCount(result.getAffectedCount() + 1);
            } catch (IllegalArgumentException ex) {
                result.getSkippedIds().add(id);
                result.getWarnings().add("ID=" + id + " " + ex.getMessage());
            }
        }
        return result;
    }

    @Transactional
    public CaseBatchResult batchDeletePublished(String owner, List<Long> ids) {
        validateBatchIds(ids);

        CaseBatchResult result = new CaseBatchResult();
        for (Long id : sanitizeIds(ids)) {
            try {
                deletePublished(id, owner);
                result.setAffectedCount(result.getAffectedCount() + 1);
            } catch (IllegalArgumentException ex) {
                result.getSkippedIds().add(id);
                result.getWarnings().add("ID=" + id + " " + ex.getMessage());
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public long countByStatus(String owner, TestCaseStatus status) {
        return testCaseRepository.countByOwnerAndCaseStatus(owner, status);
    }

    @Transactional(readOnly = true)
    public List<TestCaseEntity> findEnabledByIds(String owner, List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        List<Long> uniqueIds = sanitizeIds(ids);
        return testCaseRepository.findByIdInAndOwnerAndCaseStatus(uniqueIds, owner, TestCaseStatus.PUBLISHED).stream()
            .filter(item -> Boolean.TRUE.equals(item.getEnabled()))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<TestCaseResponse> listLegacyPublished(String owner) {
        return listPublishedByOwner(owner);
    }

    @Transactional
    public TestCaseResponse createLegacyPublished(String owner, TestCaseRequest request) {
        CaseFormRequest form = toFormRequest(request);
        return createPublished(owner, form);
    }

    @Transactional
    public TestCaseResponse updateLegacyPublished(Long id, String owner, TestCaseRequest request) {
        CaseFormRequest form = toFormRequest(request);
        return updatePublished(id, owner, form);
    }

    @Transactional
    public void deleteLegacyPublished(Long id, String owner) {
        deletePublished(id, owner);
    }

    private TestCaseEntity getCaseByStatus(Long id, String owner, TestCaseStatus status) {
        return testCaseRepository.findByIdAndOwnerAndCaseStatus(id, owner, status)
            .orElseThrow(() -> new IllegalArgumentException("案例不存在或状态不匹配"));
    }

    private void applyForm(TestCaseEntity entity, CaseFormRequest request) {
        entity.setCaseName(request.caseName().trim());
        entity.setApiName(request.apiName().trim());
        entity.setModuleName(request.apiName().trim());
        entity.setMethod(request.requestMethod().trim().toUpperCase());
        entity.setApiPath(request.apiPath().trim());
        entity.setRequestHeaders(blankToNull(request.requestHeaders()));
        entity.setRequestParams(blankToNull(request.requestParams()));
        entity.setRequestBody(blankToNull(request.requestParams()));
        entity.setExpectedStatus(request.expectedStatus());
        entity.setExpectedResult(blankToNull(request.expectedResult()));
        entity.setAssertType(blankToNull(request.assertType()));
        entity.setRemark(blankToNull(request.remark()));
        entity.setEnabled(request.enabled() == null ? Boolean.TRUE : request.enabled());
    }

    private void markDeleted(TestCaseEntity entity) {
        entity.setCaseStatus(TestCaseStatus.DELETED);
        entity.setEnabled(false);
    }

    private void validateBatchIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException("ids 不能为空");
        }
    }

    private List<Long> sanitizeIds(List<Long> ids) {
        return ids.stream()
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());
    }

    private CaseFormRequest toFormRequest(TestCaseRequest request) {
        return new CaseFormRequest(
            request.caseName(),
            request.moduleName(),
            request.apiPath(),
            request.method(),
            null,
            request.requestBody(),
            request.expectedStatus() == null ? null : "HTTP_STATUS=" + request.expectedStatus(),
            "status_code",
            null,
            request.expectedStatus(),
            request.enabled()
        );
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value;
    }

    private void logChange(Long caseId, String owner, String action, String beforeContent, String afterContent, String note) {
        CaseAuditLogEntity log = new CaseAuditLogEntity();
        log.setCaseId(caseId);
        log.setOwner(owner);
        log.setAction(action);
        log.setBeforeContent(beforeContent);
        log.setAfterContent(afterContent);
        log.setNote(note);
        caseAuditLogRepository.save(log);

        platformLogService.recordOperation(
            owner,
            "CASE_CENTER",
            action,
            beforeContent,
            afterContent,
            "SUCCESS",
            note
        );
    }

    private String snapshot(TestCaseEntity entity) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("id", entity.getId());
        payload.put("caseName", entity.getCaseName());
        payload.put("apiName", entity.getApiName());
        payload.put("apiPath", entity.getApiPath());
        payload.put("requestMethod", entity.getMethod());
        payload.put("requestHeaders", entity.getRequestHeaders());
        payload.put("requestParams", entity.getRequestParams());
        payload.put("expectedStatus", entity.getExpectedStatus());
        payload.put("expectedResult", entity.getExpectedResult());
        payload.put("assertType", entity.getAssertType());
        payload.put("remark", entity.getRemark());
        payload.put("enabled", entity.getEnabled());
        payload.put("caseStatus", entity.getCaseStatus());
        payload.put("updatedAt", entity.getUpdatedAt());
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            return payload.toString();
        }
    }
}
