package com.xuzhidong.aitest.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xuzhidong.aitest.ai.dto.ApiDefinitionDTO;
import com.xuzhidong.aitest.ai.dto.ApiParamDTO;
import com.xuzhidong.aitest.ai.dto.TestCaseDTO;
import com.xuzhidong.aitest.ai.entity.TestCaseEntity;
import com.xuzhidong.aitest.ai.repository.TestCaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TestCaseService {

    public static final String AI_ENGINE_REMOTE_LLM = "REMOTE_LLM";
    public static final String AI_ENGINE_LOCAL_FALLBACK = "LOCAL_RULE_AI";

    private final LlmClient llmClient;
    private final TestCaseRepository testCaseRepository;
    private final ObjectMapper objectMapper;

    public TestCaseService(LlmClient llmClient, TestCaseRepository testCaseRepository, ObjectMapper objectMapper) {
        this.llmClient = llmClient;
        this.testCaseRepository = testCaseRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public List<TestCaseDTO> generateTestCases(ApiDefinitionDTO apiDefinition) {
        return generateTestCasesWithAiTrace(apiDefinition).getCases();
    }

    @Transactional
    public AiGenerationTrace generateTestCasesWithAiTrace(ApiDefinitionDTO apiDefinition) {
        String prompt = buildPrompt(apiDefinition);
        String aiEngine = AI_ENGINE_LOCAL_FALLBACK;
        String aiResponse = "";
        try {
            aiResponse = llmClient.chat(prompt);
        } catch (Exception ignored) {
            aiResponse = "";
        }

        List<TestCaseDTO> testCases = parseAiResponse(aiResponse, apiDefinition);
        if (!testCases.isEmpty()) {
            aiEngine = AI_ENGINE_REMOTE_LLM;
        } else {
            testCases = buildFallbackCases(apiDefinition);
        }

        List<TestCaseEntity> entities = testCases.stream()
            .map(this::toEntity)
            .toList();
        List<TestCaseEntity> saved = testCaseRepository.saveAll(entities);
        List<TestCaseDTO> resultCases = saved.stream().map(this::toDto).toList();
        return new AiGenerationTrace(
            resultCases,
            aiEngine,
            prompt,
            llmClient.isConfigured(),
            AI_ENGINE_REMOTE_LLM.equals(aiEngine)
        );
    }

    public List<TestCaseDTO> findByIds(List<Long> caseIds) {
        return testCaseRepository.findAllById(caseIds).stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<TestCaseDTO> listAll() {
        return testCaseRepository.findAll().stream().map(this::toDto).toList();
    }

    private String buildPrompt(ApiDefinitionDTO apiDefinition) {
        String requestParams = apiDefinition.getRequestParams().stream()
            .map(this::toParamText)
            .collect(Collectors.joining("; "));
        String responseParams = apiDefinition.getResponseParams().stream()
            .map(this::toParamText)
            .collect(Collectors.joining("; "));
        return """
            你是接口测试专家。请根据以下接口定义生成 JSON 数组格式测试用例。
            每个元素字段：caseName, caseType(normal/boundary/invalid), requestBody, expectedResult, checkRule。
            请至少生成3条（正常、边界、异常）。
            接口名称: %s
            请求路径: %s
            请求方法: %s
            请求参数: %s
            响应参数: %s
            """.formatted(
            apiDefinition.getApiName(),
            apiDefinition.getApiPath(),
            apiDefinition.getMethod(),
            requestParams.isBlank() ? "无" : requestParams,
            responseParams.isBlank() ? "无" : responseParams
        );
    }

    private List<TestCaseDTO> parseAiResponse(String aiResponse, ApiDefinitionDTO apiDefinition) {
        if (aiResponse == null || aiResponse.isBlank()) {
            return List.of();
        }
        String jsonArray = extractJsonArray(aiResponse);
        if (jsonArray == null || jsonArray.isBlank()) {
            return List.of();
        }
        try {
            List<TestCaseDTO> parsed = objectMapper.readValue(jsonArray, new TypeReference<List<TestCaseDTO>>() {
            });
            return parsed.stream().map(item -> normalizeCase(item, apiDefinition)).toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    private List<TestCaseDTO> buildFallbackCases(ApiDefinitionDTO apiDefinition) {
        List<TestCaseDTO> list = new ArrayList<>();
        list.add(buildCase(apiDefinition, "正常场景", "normal", "接口返回成功", "status=200 且业务成功"));
        list.add(buildCase(apiDefinition, "边界场景", "boundary", "边界参数处理正确", "status=200 且字段边界合法"));
        list.add(buildCase(apiDefinition, "异常场景", "invalid", "错误码符合预期", "status=4xx/业务错误码符合定义"));
        return list;
    }

    private TestCaseDTO buildCase(ApiDefinitionDTO apiDefinition, String suffix, String caseType, String expected, String checkRule) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setApiName(apiDefinition.getApiName());
        dto.setApiPath(apiDefinition.getApiPath());
        dto.setMethod(apiDefinition.getMethod());
        dto.setCaseName(apiDefinition.getApiName() + "_" + suffix);
        dto.setCaseType(caseType);
        dto.setRequestBody(buildRequestBodyTemplate(apiDefinition, caseType));
        dto.setExpectedResult(expected);
        dto.setCheckRule(checkRule);
        dto.setStatus("NEW");
        dto.setSource("AI");
        return dto;
    }

    private TestCaseDTO normalizeCase(TestCaseDTO input, ApiDefinitionDTO apiDefinition) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setApiName(apiDefinition.getApiName());
        dto.setApiPath(apiDefinition.getApiPath());
        dto.setMethod(apiDefinition.getMethod());
        dto.setCaseName(valueOrDefault(input.getCaseName(), apiDefinition.getApiName() + "_AI用例"));
        String caseType = valueOrDefault(input.getCaseType(), "normal").toLowerCase(Locale.ROOT);
        dto.setCaseType(caseType);
        dto.setRequestBody(valueOrDefault(input.getRequestBody(), buildRequestBodyTemplate(apiDefinition, caseType)));
        dto.setExpectedResult(valueOrDefault(input.getExpectedResult(), "接口返回成功"));
        dto.setCheckRule(valueOrDefault(input.getCheckRule(), "status=200"));
        dto.setStatus("NEW");
        dto.setSource("AI");
        return dto;
    }

    private String buildRequestBodyTemplate(ApiDefinitionDTO apiDefinition, String caseType) {
        try {
            Map<String, Object> payload = apiDefinition.getRequestParams().stream()
                .collect(Collectors.toMap(
                    item -> valueOrDefault(item.getName(), "field"),
                    item -> buildExampleValue(item, caseType),
                    (left, right) -> left
                ));
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }

    private Object buildExampleValue(ApiParamDTO param, String caseType) {
        String example = param.getExample();
        if (example != null && !example.isBlank()) {
            return "invalid".equalsIgnoreCase(caseType) ? "INVALID_" + example : example;
        }
        return switch (valueOrDefault(param.getType(), "string").toLowerCase(Locale.ROOT)) {
            case "int", "integer", "long" -> "invalid".equalsIgnoreCase(caseType) ? -1 : 1;
            case "double", "float", "decimal" -> "invalid".equalsIgnoreCase(caseType) ? -0.01 : 99.9;
            case "boolean" -> !"invalid".equalsIgnoreCase(caseType);
            default -> "invalid".equalsIgnoreCase(caseType) ? "" : "sample";
        };
    }

    private String toParamText(ApiParamDTO item) {
        return "%s(%s,required=%s,desc=%s,example=%s)".formatted(
            valueOrDefault(item.getName(), "-"),
            valueOrDefault(item.getType(), "string"),
            item.getRequired() != null && item.getRequired(),
            valueOrDefault(item.getDescription(), "-"),
            valueOrDefault(item.getExample(), "-")
        );
    }

    private String extractJsonArray(String aiResponse) {
        String trimmed = aiResponse.trim();
        if (trimmed.startsWith("[")) {
            return trimmed;
        }
        int firstArray = trimmed.indexOf('[');
        int lastArray = trimmed.lastIndexOf(']');
        if (firstArray >= 0 && lastArray > firstArray) {
            return trimmed.substring(firstArray, lastArray + 1);
        }
        return null;
    }

    private TestCaseEntity toEntity(TestCaseDTO dto) {
        TestCaseEntity entity = new TestCaseEntity();
        entity.setApiName(dto.getApiName());
        entity.setApiPath(dto.getApiPath());
        entity.setMethod(dto.getMethod());
        entity.setCaseName(dto.getCaseName());
        entity.setCaseType(dto.getCaseType());
        entity.setParams(dto.getRequestBody());
        entity.setExpectedResult(dto.getExpectedResult());
        entity.setStatus(dto.getStatus());
        entity.setSource(valueOrDefault(dto.getSource(), "AI"));
        entity.setCheckRule(dto.getCheckRule());
        return entity;
    }

    private TestCaseDTO toDto(TestCaseEntity entity) {
        TestCaseDTO dto = new TestCaseDTO();
        dto.setCaseId(entity.getCaseId());
        dto.setApiName(entity.getApiName());
        dto.setApiPath(entity.getApiPath());
        dto.setMethod(entity.getMethod());
        dto.setCaseName(entity.getCaseName());
        dto.setCaseType(entity.getCaseType());
        dto.setRequestBody(entity.getParams());
        dto.setExpectedResult(entity.getExpectedResult());
        dto.setCheckRule(entity.getCheckRule());
        dto.setStatus(entity.getStatus());
        dto.setSource(entity.getSource());
        return dto;
    }

    private String valueOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    public static class AiGenerationTrace {
        private final List<TestCaseDTO> cases;
        private final String aiEngine;
        private final String prompt;
        private final boolean remoteConfigured;
        private final boolean remoteResponseUsed;

        public AiGenerationTrace(List<TestCaseDTO> cases, String aiEngine, String prompt, boolean remoteConfigured, boolean remoteResponseUsed) {
            this.cases = cases;
            this.aiEngine = aiEngine;
            this.prompt = prompt;
            this.remoteConfigured = remoteConfigured;
            this.remoteResponseUsed = remoteResponseUsed;
        }

        public List<TestCaseDTO> getCases() {
            return cases;
        }

        public String getAiEngine() {
            return aiEngine;
        }

        public String getPrompt() {
            return prompt;
        }

        public boolean isRemoteConfigured() {
            return remoteConfigured;
        }

        public boolean isRemoteResponseUsed() {
            return remoteResponseUsed;
        }
    }
}
