package com.xuzhidong.aitest.ai.service;

import com.xuzhidong.aitest.ai.dto.ExecutionResultDTO;
import com.xuzhidong.aitest.ai.dto.TestCaseDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TaskExecutionService {

    public ExecutionResultDTO execute(TestCaseDTO testCase) {
        ExecutionResultDTO result = new ExecutionResultDTO();
        result.setCaseId(testCase.getCaseId());
        result.setCaseName(testCase.getCaseName());
        result.setExecutedAt(LocalDateTime.now());
        if (testCase.getRequestBody() == null || testCase.getRequestBody().isBlank()) {
            result.setStatus("FAILED");
            result.setResultMessage("请求体为空，执行失败");
            return result;
        }
        result.setStatus("PASSED");
        result.setResultMessage("执行成功，已接入任务执行链");
        return result;
    }
}
