package com.xuzhidong.aitest.ai.service;

import com.xuzhidong.aitest.ai.dto.ExecutionBatchResultDTO;
import com.xuzhidong.aitest.ai.dto.ExecutionResultDTO;
import com.xuzhidong.aitest.ai.dto.TestCaseDTO;
import com.xuzhidong.aitest.ai.entity.TestExecutionEntity;
import com.xuzhidong.aitest.ai.repository.TestExecutionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AiExecutionService {

    private static final DateTimeFormatter RUN_ID_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final TaskExecutionFacade taskExecutionFacade;
    private final TestExecutionRepository testExecutionRepository;

    public AiExecutionService(TaskExecutionFacade taskExecutionFacade, TestExecutionRepository testExecutionRepository) {
        this.taskExecutionFacade = taskExecutionFacade;
        this.testExecutionRepository = testExecutionRepository;
    }

    @Transactional
    public ExecutionBatchResultDTO executeCases(List<TestCaseDTO> testCases) {
        String runId = buildRunId();
        List<ExecutionResultDTO> results = taskExecutionFacade.executeTestCases(testCases);
        List<TestExecutionEntity> entities = results.stream().map(item -> toEntity(runId, item)).toList();
        testExecutionRepository.saveAll(entities);
        return buildBatch(runId, results);
    }

    @Transactional(readOnly = true)
    public List<ExecutionBatchResultDTO> queryResults(String runId) {
        if (runId != null && !runId.isBlank()) {
            List<TestExecutionEntity> entities = testExecutionRepository.findByRunIdOrderByIdAsc(runId);
            if (entities.isEmpty()) {
                return List.of();
            }
            return List.of(buildBatch(runId, entities.stream().map(this::toDto).toList()));
        }

        List<TestExecutionEntity> all = testExecutionRepository.findTop500ByOrderByExecutedAtDescIdDesc();
        Map<String, List<ExecutionResultDTO>> grouped = new LinkedHashMap<>();
        for (TestExecutionEntity item : all) {
            grouped.computeIfAbsent(item.getRunId(), ignored -> new ArrayList<>()).add(toDto(item));
        }
        return grouped.entrySet().stream()
            .map(entry -> buildBatch(entry.getKey(), entry.getValue()))
            .toList();
    }

    private ExecutionBatchResultDTO buildBatch(String runId, List<ExecutionResultDTO> results) {
        int passed = (int) results.stream().filter(item -> "PASSED".equalsIgnoreCase(item.getStatus())).count();
        int failed = results.size() - passed;
        LocalDateTime executedAt = results.stream()
            .map(ExecutionResultDTO::getExecutedAt)
            .filter(item -> item != null)
            .max(LocalDateTime::compareTo)
            .orElse(LocalDateTime.now());

        ExecutionBatchResultDTO batch = new ExecutionBatchResultDTO();
        batch.setRunId(runId);
        batch.setResults(results);
        batch.setTotal(results.size());
        batch.setPassed(passed);
        batch.setFailed(failed);
        batch.setStatus(failed == 0 ? "PASSED" : "FAILED");
        batch.setExecutedAt(executedAt);
        return batch;
    }

    private TestExecutionEntity toEntity(String runId, ExecutionResultDTO result) {
        TestExecutionEntity entity = new TestExecutionEntity();
        entity.setRunId(runId);
        entity.setCaseId(result.getCaseId());
        entity.setCaseName(result.getCaseName());
        entity.setStatus(result.getStatus());
        entity.setResultMessage(result.getResultMessage());
        entity.setExecutedAt(result.getExecutedAt() == null ? LocalDateTime.now() : result.getExecutedAt());
        return entity;
    }

    private ExecutionResultDTO toDto(TestExecutionEntity entity) {
        ExecutionResultDTO dto = new ExecutionResultDTO();
        dto.setCaseId(entity.getCaseId());
        dto.setCaseName(entity.getCaseName());
        dto.setStatus(entity.getStatus());
        dto.setResultMessage(entity.getResultMessage());
        dto.setExecutedAt(entity.getExecutedAt());
        return dto;
    }

    private String buildRunId() {
        return RUN_ID_FORMATTER.format(LocalDateTime.now()) + UUID.randomUUID().toString().replace("-", "").substring(0, 6);
    }
}
