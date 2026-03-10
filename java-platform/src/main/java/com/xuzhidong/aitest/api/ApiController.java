package com.xuzhidong.aitest.api;

import com.xuzhidong.aitest.ai.dto.ApiDefinitionDTO;
import com.xuzhidong.aitest.ai.dto.ExecuteRequestDTO;
import com.xuzhidong.aitest.ai.dto.ExecutionResultDTO;
import com.xuzhidong.aitest.ai.dto.TestCaseDTO;
import com.xuzhidong.aitest.ai.service.TaskExecutionFacade;
import com.xuzhidong.aitest.ai.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/test")
public class ApiController {

    private final TestCaseService testCaseService;
    private final TaskExecutionFacade taskExecutionFacade;

    public ApiController(TestCaseService testCaseService, TaskExecutionFacade taskExecutionFacade) {
        this.testCaseService = testCaseService;
        this.taskExecutionFacade = taskExecutionFacade;
    }

    @PostMapping("/generate")
    public ResponseEntity<List<TestCaseDTO>> generateTestCases(@Valid @RequestBody ApiDefinitionDTO apiDefinition) {
        List<TestCaseDTO> generatedCases = testCaseService.generateTestCases(apiDefinition);
        return ResponseEntity.ok(generatedCases);
    }

    @PostMapping("/execute")
    public ResponseEntity<List<ExecutionResultDTO>> executeGeneratedTestCases(@Valid @RequestBody ExecuteRequestDTO request) {
        List<TestCaseDTO> testCases = testCaseService.findByIds(request.getCaseIds());
        List<ExecutionResultDTO> results = taskExecutionFacade.executeTestCases(testCases);
        return ResponseEntity.ok(results);
    }
}
