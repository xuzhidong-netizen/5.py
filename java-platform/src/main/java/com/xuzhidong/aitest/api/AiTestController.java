package com.xuzhidong.aitest.api;

import com.xuzhidong.aitest.ai.dto.ApiDefinitionDTO;
import com.xuzhidong.aitest.ai.dto.ApiDocumentDTO;
import com.xuzhidong.aitest.ai.dto.ExecuteRequestDTO;
import com.xuzhidong.aitest.ai.dto.ExecutionBatchResultDTO;
import com.xuzhidong.aitest.ai.dto.TestCaseDTO;
import com.xuzhidong.aitest.ai.service.AiExecutionService;
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

import java.util.List;

@RestController
public class AiTestController {

    private final ApiDocumentService apiDocumentService;
    private final TestCaseService testCaseService;
    private final AiExecutionService aiExecutionService;

    public AiTestController(ApiDocumentService apiDocumentService, TestCaseService testCaseService, AiExecutionService aiExecutionService) {
        this.apiDocumentService = apiDocumentService;
        this.testCaseService = testCaseService;
        this.aiExecutionService = aiExecutionService;
    }

    @PostMapping("/api/generate-docs")
    public ResponseEntity<ApiDocumentDTO> generateDocs(@Valid @RequestBody ApiDefinitionDTO apiDefinition) {
        return ResponseEntity.ok(apiDocumentService.generate(apiDefinition));
    }

    @PostMapping("/api/generate-cases")
    public ResponseEntity<List<TestCaseDTO>> generateCases(@Valid @RequestBody ApiDefinitionDTO apiDefinition) {
        return ResponseEntity.ok(testCaseService.generateTestCases(apiDefinition));
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
