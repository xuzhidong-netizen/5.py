package com.xuzhidong.aitest.ai.service;

import com.xuzhidong.aitest.ai.dto.ApiDefinitionDTO;
import com.xuzhidong.aitest.ai.dto.ApiDocumentDTO;
import com.xuzhidong.aitest.ai.dto.ApiParamDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ApiDocumentService {

    public static final String AI_ENGINE_REMOTE_LLM = "REMOTE_LLM";
    public static final String AI_ENGINE_LOCAL_FALLBACK = "LOCAL_RULE_AI";

    private final LlmClient llmClient;

    public ApiDocumentService(LlmClient llmClient) {
        this.llmClient = llmClient;
    }

    public ApiDocumentDTO generate(ApiDefinitionDTO definition) {
        return generateWithAiTrace(definition).getDocument();
    }

    public AiDocGenerationTrace generateWithAiTrace(ApiDefinitionDTO definition) {
        String prompt = buildPrompt(definition);
        String aiEngine = AI_ENGINE_LOCAL_FALLBACK;
        String markdown = buildLocalMarkdown(definition);
        String aiResponse = "";

        try {
            aiResponse = llmClient.chat(prompt);
        } catch (Exception ignored) {
            aiResponse = "";
        }
        String remoteMarkdown = normalizeMarkdown(aiResponse);
        if (!remoteMarkdown.isBlank()) {
            markdown = remoteMarkdown;
            aiEngine = AI_ENGINE_REMOTE_LLM;
        }

        ApiDocumentDTO document = new ApiDocumentDTO();
        document.setApiName(definition.getApiName());
        document.setApiPath(definition.getApiPath());
        document.setMethod(normalizeMethod(definition.getMethod()));
        document.setGeneratedAt(LocalDateTime.now());
        document.setAiParticipated(true);
        document.setAiEngine(aiEngine);
        document.setRemoteLlmConfigured(llmClient.isConfigured());
        document.setRemoteLlmUsed(AI_ENGINE_REMOTE_LLM.equals(aiEngine));
        document.setMarkdown(markdown);
        document.setOpenApi(buildOpenApi(definition));
        return new AiDocGenerationTrace(
            document,
            aiEngine,
            prompt,
            llmClient.isConfigured(),
            AI_ENGINE_REMOTE_LLM.equals(aiEngine)
        );
    }

    private String buildPrompt(ApiDefinitionDTO definition) {
        String requestParams = definition.getRequestParams().stream()
            .map(this::toParamText)
            .collect(Collectors.joining("; "));
        String responseParams = definition.getResponseParams().stream()
            .map(this::toParamText)
            .collect(Collectors.joining("; "));
        return """
            你是接口文档专家。请根据接口定义输出简洁清晰的 Markdown 接口文档。
            要包含：接口名称、请求路径、请求方法、请求参数表、响应参数表、示例说明。
            接口名称: %s
            请求路径: %s
            请求方法: %s
            请求参数: %s
            响应参数: %s
            """.formatted(
            definition.getApiName(),
            definition.getApiPath(),
            normalizeMethod(definition.getMethod()),
            requestParams.isBlank() ? "无" : requestParams,
            responseParams.isBlank() ? "无" : responseParams
        );
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

    private String normalizeMarkdown(String aiResponse) {
        if (aiResponse == null || aiResponse.isBlank()) {
            return "";
        }
        String trimmed = aiResponse.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            int lastFence = trimmed.lastIndexOf("```");
            if (firstNewline > -1 && lastFence > firstNewline) {
                return trimmed.substring(firstNewline + 1, lastFence).trim();
            }
        }
        return trimmed;
    }

    private String buildLocalMarkdown(ApiDefinitionDTO definition) {
        StringBuilder sb = new StringBuilder();
        sb.append("## ").append(definition.getApiName()).append('\n');
        sb.append("- 路径: `").append(definition.getApiPath()).append("`\n");
        sb.append("- 方法: `").append(normalizeMethod(definition.getMethod())).append("`\n\n");

        sb.append("### 请求参数\n");
        if (definition.getRequestParams().isEmpty()) {
            sb.append("- 无\n");
        } else {
            for (ApiParamDTO item : definition.getRequestParams()) {
                sb.append("- `")
                    .append(valueOrDefault(item.getName(), "field"))
                    .append("` (")
                    .append(valueOrDefault(item.getType(), "string"))
                    .append("), required=")
                    .append(Boolean.TRUE.equals(item.getRequired()))
                    .append(", desc=")
                    .append(valueOrDefault(item.getDescription(), "-"))
                    .append('\n');
            }
        }

        sb.append("\n### 响应参数\n");
        if (definition.getResponseParams().isEmpty()) {
            sb.append("- 无\n");
        } else {
            for (ApiParamDTO item : definition.getResponseParams()) {
                sb.append("- `")
                    .append(valueOrDefault(item.getName(), "field"))
                    .append("` (")
                    .append(valueOrDefault(item.getType(), "string"))
                    .append("), desc=")
                    .append(valueOrDefault(item.getDescription(), "-"))
                    .append('\n');
            }
        }
        return sb.toString();
    }

    private Map<String, Object> buildOpenApi(ApiDefinitionDTO definition) {
        Map<String, Object> openApi = new LinkedHashMap<>();
        openApi.put("openapi", "3.0.3");
        openApi.put("info", Map.of(
            "title", valueOrDefault(definition.getApiName(), "API"),
            "version", "1.0.0"
        ));

        Map<String, Object> paths = new LinkedHashMap<>();
        Map<String, Object> methodNode = new LinkedHashMap<>();
        methodNode.put("summary", valueOrDefault(definition.getApiName(), "API接口"));
        methodNode.put("requestBody", Map.of(
            "required", true,
            "content", Map.of(
                "application/json", Map.of(
                    "schema", buildJsonSchema(definition.getRequestParams())
                )
            )
        ));
        methodNode.put("responses", Map.of(
            "200", Map.of(
                "description", "success",
                "content", Map.of(
                    "application/json", Map.of(
                        "schema", buildJsonSchema(definition.getResponseParams())
                    )
                )
            )
        ));
        paths.put(valueOrDefault(definition.getApiPath(), "/api/demo"), Map.of(
            normalizeMethod(definition.getMethod()).toLowerCase(Locale.ROOT), methodNode
        ));
        openApi.put("paths", paths);
        return openApi;
    }

    private Map<String, Object> buildJsonSchema(List<ApiParamDTO> params) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        Map<String, Object> properties = new LinkedHashMap<>();
        List<String> required = new ArrayList<>();

        for (ApiParamDTO param : params) {
            String name = valueOrDefault(param.getName(), "field");
            properties.put(name, Map.of(
                "type", mapType(param.getType()),
                "description", valueOrDefault(param.getDescription(), ""),
                "example", valueOrDefault(param.getExample(), "")
            ));
            if (Boolean.TRUE.equals(param.getRequired())) {
                required.add(name);
            }
        }
        schema.put("properties", properties);
        if (!required.isEmpty()) {
            schema.put("required", required);
        }
        return schema;
    }

    private String mapType(String sourceType) {
        if (sourceType == null) {
            return "string";
        }
        return switch (sourceType.toLowerCase(Locale.ROOT)) {
            case "int", "integer", "long" -> "integer";
            case "double", "float", "decimal", "number" -> "number";
            case "boolean", "bool" -> "boolean";
            case "array", "list" -> "array";
            case "object", "map" -> "object";
            default -> "string";
        };
    }

    private String normalizeMethod(String method) {
        if (method == null || method.isBlank()) {
            return "POST";
        }
        return method.toUpperCase(Locale.ROOT);
    }

    private String valueOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }

    public static class AiDocGenerationTrace {
        private final ApiDocumentDTO document;
        private final String aiEngine;
        private final String prompt;
        private final boolean remoteConfigured;
        private final boolean remoteResponseUsed;

        public AiDocGenerationTrace(ApiDocumentDTO document, String aiEngine, String prompt, boolean remoteConfigured, boolean remoteResponseUsed) {
            this.document = document;
            this.aiEngine = aiEngine;
            this.prompt = prompt;
            this.remoteConfigured = remoteConfigured;
            this.remoteResponseUsed = remoteResponseUsed;
        }

        public ApiDocumentDTO getDocument() {
            return document;
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
