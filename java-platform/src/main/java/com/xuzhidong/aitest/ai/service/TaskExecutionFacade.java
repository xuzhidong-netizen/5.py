package com.xuzhidong.aitest.ai.service;

import com.xuzhidong.aitest.ai.dto.ExecutionResultDTO;
import com.xuzhidong.aitest.ai.dto.TestCaseDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskExecutionFacade {

    private final TaskExecutionService taskExecutionService;

    public TaskExecutionFacade(TaskExecutionService taskExecutionService) {
        this.taskExecutionService = taskExecutionService;
    }

    public List<ExecutionResultDTO> executeTestCases(List<TestCaseDTO> testCases) {
        return testCases.stream().map(taskExecutionService::execute).toList();
    }
}
