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

@Service
public class ApiDocumentService {

    public ApiDocumentDTO generate(ApiDefinitionDTO definition) {
        ApiDocumentDTO document = new ApiDocumentDTO();
        document.setApiName(definition.getApiName());
        document.setApiPath(definition.getApiPath());
        document.setMethod(normalizeMethod(definition.getMethod()));
        document.setGeneratedAt(LocalDateTime.now());
        document.setMarkdown(buildMarkdown(definition));
        document.setOpenApi(buildOpenApi(definition));
        return document;
    }

    private String buildMarkdown(ApiDefinitionDTO definition) {
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
}
