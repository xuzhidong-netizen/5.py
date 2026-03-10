package com.xuzhidong.aitest.api;

import com.xuzhidong.aitest.ai.dto.ApiDefinitionDTO;
import com.xuzhidong.aitest.ai.dto.ApiDocumentBatchResultDTO;
import com.xuzhidong.aitest.ai.dto.ApiDocumentImportRequestDTO;
import com.xuzhidong.aitest.ai.dto.ApiDocumentImportResultDTO;
import com.xuzhidong.aitest.ai.dto.ApiDocumentDTO;
import com.xuzhidong.aitest.ai.dto.ExecuteRequestDTO;
import com.xuzhidong.aitest.ai.dto.ExecutionBatchResultDTO;
import com.xuzhidong.aitest.ai.dto.TestCaseDTO;
import com.xuzhidong.aitest.ai.service.AiExecutionService;
import com.xuzhidong.aitest.ai.service.ApiDefinitionImportService;
import com.xuzhidong.aitest.ai.service.ApiDocumentService;
import com.xuzhidong.aitest.ai.service.TestCaseService;
import com.xuzhidong.aitest.model.AiCase;
import com.xuzhidong.aitest.service.AiInterfaceCaseService;
import com.xuzhidong.aitest.service.PlatformStore;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
public class AiTestController {

    private final ApiDefinitionImportService apiDefinitionImportService;
    private final ApiDocumentService apiDocumentService;
    private final TestCaseService testCaseService;
    private final AiExecutionService aiExecutionService;
    private final PlatformStore platformStore;

    public AiTestController(ApiDefinitionImportService apiDefinitionImportService,
                            ApiDocumentService apiDocumentService,
                            TestCaseService testCaseService,
                            AiExecutionService aiExecutionService,
                            PlatformStore platformStore) {
        this.apiDefinitionImportService = apiDefinitionImportService;
        this.apiDocumentService = apiDocumentService;
        this.testCaseService = testCaseService;
        this.aiExecutionService = aiExecutionService;
        this.platformStore = platformStore;
    }

    @PostMapping("/api/generate-docs")
    public ResponseEntity<ApiDocumentDTO> generateDocs(@Valid @RequestBody ApiDefinitionDTO apiDefinition) {
        return ResponseEntity.ok(apiDocumentService.generate(apiDefinition));
    }

    @PostMapping("/api/generate-docs/import")
    public ResponseEntity<ApiDocumentBatchResultDTO> generateDocsByImportedDocument(@Valid @RequestBody ApiDocumentImportRequestDTO request) {
        List<ApiDefinitionDTO> definitions = apiDefinitionImportService.parse(request.getDocumentContent(), request.getFormat());
        if (definitions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "导入文档未识别到可用接口定义");
        }

        List<ApiDocumentDTO> documents = new ArrayList<>();
        Set<String> aiEngines = new LinkedHashSet<>();
        int remoteCount = 0;
        int fallbackCount = 0;
        for (ApiDefinitionDTO definition : definitions) {
            ApiDocumentService.AiDocGenerationTrace trace = apiDocumentService.generateWithAiTrace(definition);
            documents.add(trace.getDocument());
            aiEngines.add(trace.getAiEngine());
            if (ApiDocumentService.AI_ENGINE_REMOTE_LLM.equals(trace.getAiEngine())) {
                remoteCount += 1;
            } else {
                fallbackCount += 1;
            }
        }

        ApiDocumentBatchResultDTO result = new ApiDocumentBatchResultDTO();
        result.setApiDefinitions(definitions);
        result.setDocuments(documents);
        result.setApiCount(definitions.size());
        result.setAiParticipated(true);
        result.setAiEngines(new ArrayList<>(aiEngines));
        result.setRemoteLlmUsedCount(remoteCount);
        result.setFallbackAiUsedCount(fallbackCount);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/generate-cases")
    public ResponseEntity<List<TestCaseDTO>> generateCases(@Valid @RequestBody ApiDefinitionDTO apiDefinition) {
        return ResponseEntity.ok(testCaseService.generateTestCases(apiDefinition));
    }

    @PostMapping("/api/generate-cases/import")
    public ResponseEntity<ApiDocumentImportResultDTO> generateCasesByImportedDocument(@Valid @RequestBody ApiDocumentImportRequestDTO request) {
        List<ApiDefinitionDTO> definitions = apiDefinitionImportService.parse(request.getDocumentContent(), request.getFormat());
        if (definitions.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "导入文档未识别到可用接口定义");
        }

        List<TestCaseDTO> generatedCases = new ArrayList<>();
        Set<String> aiEngines = new LinkedHashSet<>();
        int remoteCount = 0;
        int fallbackCount = 0;
        for (ApiDefinitionDTO definition : definitions) {
            TestCaseService.AiGenerationTrace trace = testCaseService.generateTestCasesWithAiTrace(definition);
            generatedCases.addAll(trace.getCases());
            aiEngines.add(trace.getAiEngine());
            if (TestCaseService.AI_ENGINE_REMOTE_LLM.equals(trace.getAiEngine())) {
                remoteCount += 1;
            } else {
                fallbackCount += 1;
            }
        }

        ApiDocumentImportResultDTO result = new ApiDocumentImportResultDTO();
        result.setApiDefinitions(definitions);
        result.setGeneratedCases(generatedCases);
        result.setApiCount(definitions.size());
        result.setCaseCount(generatedCases.size());
        result.setAiParticipated(true);
        result.setAiEngines(new ArrayList<>(aiEngines));
        result.setRemoteLlmUsedCount(remoteCount);
        result.setFallbackAiUsedCount(fallbackCount);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/execute-cases")
    public ResponseEntity<ExecutionBatchResultDTO> executeCases(@Valid @RequestBody ExecuteRequestDTO request) {
        List<Long> requestedIds = request.getCaseIds().stream()
            .filter(item -> item != null)
            .distinct()
            .toList();
        List<TestCaseDTO> testCases = resolveExecutableCases(requestedIds);
        if (testCases.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "未找到可执行测试用例");
        }
        return ResponseEntity.ok(aiExecutionService.executeCases(testCases));
    }

    @GetMapping("/api/execute-cases")
    public ResponseEntity<List<TestCaseDTO>> listExecutableCases() {
        List<TestCaseDTO> generatedCases = testCaseService.listAll();
        Map<Long, TestCaseDTO> merged = new LinkedHashMap<>();
        for (TestCaseDTO item : generatedCases) {
            if (item.getCaseId() != null) {
                merged.put(item.getCaseId(), item);
            }
        }
        for (AiCase item : platformStore.listCases()) {
            if (item.getCaseId() != null && isAiInterfaceCase(item)) {
                merged.putIfAbsent(item.getCaseId(), toExecutionCase(item));
            }
        }
        return ResponseEntity.ok(new ArrayList<>(merged.values()));
    }

    @GetMapping("/api/results")
    public ResponseEntity<List<ExecutionBatchResultDTO>> queryResults(@RequestParam(required = false) String runId) {
        return ResponseEntity.ok(aiExecutionService.queryResults(runId));
    }

    private List<TestCaseDTO> resolveExecutableCases(List<Long> caseIds) {
        List<TestCaseDTO> generated = testCaseService.findByIds(caseIds);
        Map<Long, TestCaseDTO> mapped = new LinkedHashMap<>();
        for (TestCaseDTO item : generated) {
            if (item.getCaseId() != null) {
                mapped.put(item.getCaseId(), item);
            }
        }
        if (mapped.size() < caseIds.size()) {
            Map<Long, AiCase> platformCaseMap = new LinkedHashMap<>();
            for (AiCase item : platformStore.listCases()) {
                if (item.getCaseId() != null && isAiInterfaceCase(item)) {
                    platformCaseMap.put(item.getCaseId(), item);
                }
            }
            for (Long caseId : caseIds) {
                if (caseId != null && !mapped.containsKey(caseId)) {
                    AiCase platformCase = platformCaseMap.get(caseId);
                    if (platformCase != null) {
                        mapped.put(caseId, toExecutionCase(platformCase));
                    }
                }
            }
        }

        List<TestCaseDTO> ordered = new ArrayList<>();
        for (Long caseId : caseIds) {
            TestCaseDTO dto = mapped.get(caseId);
            if (dto != null) {
                ordered.add(dto);
            }
        }
        return ordered;
    }

    private TestCaseDTO toExecutionCase(AiCase aiCase) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setCaseId(aiCase.getCaseId());
        dto.setApiName(aiCase.getFuncName());
        dto.setApiPath(aiCase.getFuncNo());
        dto.setMethod("POST");
        dto.setCaseName(aiCase.getCaseName());
        dto.setCaseType(aiCase.getCaseType());
        dto.setRequestBody(aiCase.getCaseKvBase());
        dto.setExpectedResult(aiCase.getCaseExpectResult());
        dto.setCheckRule(aiCase.getCaseCheckFunction());
        dto.setStatus("1".equals(aiCase.getRunFlag()) ? "ENABLED" : "DISABLED");
        dto.setSource("AI_INTERFACE_CASE");
        return dto;
    }

    private boolean isAiInterfaceCase(AiCase aiCase) {
        return aiCase.getCaseRemark() != null
            && aiCase.getCaseRemark().contains(AiInterfaceCaseService.AI_INTERFACE_CASE_TAG);
    }
}
