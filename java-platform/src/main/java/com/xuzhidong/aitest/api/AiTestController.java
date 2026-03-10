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
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@RestController
public class AiTestController {

    private final ApiDefinitionImportService apiDefinitionImportService;
    private final ApiDocumentService apiDocumentService;
    private final TestCaseService testCaseService;
    private final AiExecutionService aiExecutionService;

    public AiTestController(ApiDefinitionImportService apiDefinitionImportService,
                            ApiDocumentService apiDocumentService,
                            TestCaseService testCaseService,
                            AiExecutionService aiExecutionService) {
        this.apiDefinitionImportService = apiDefinitionImportService;
        this.apiDocumentService = apiDocumentService;
        this.testCaseService = testCaseService;
        this.aiExecutionService = aiExecutionService;
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
        List<TestCaseDTO> testCases = testCaseService.findByIds(request.getCaseIds());
        if (testCases.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "未找到可执行测试用例");
        }
        return ResponseEntity.ok(aiExecutionService.executeCases(testCases));
    }

    @GetMapping("/api/results")
    public ResponseEntity<List<ExecutionBatchResultDTO>> queryResults(@RequestParam(required = false) String runId) {
        return ResponseEntity.ok(aiExecutionService.queryResults(runId));
    }
}
