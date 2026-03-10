package com.xuzhidong.aitest.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xuzhidong.aitest.ai.dto.ApiDefinitionDTO;
import com.xuzhidong.aitest.ai.dto.ApiParamDTO;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ApiDefinitionImportService {

    private static final Set<String> HTTP_METHODS = new HashSet<>(
        Arrays.asList("get", "post", "put", "delete", "patch", "head", "options")
    );

    private final ObjectMapper objectMapper;
    private final Yaml yaml = new Yaml();

    public ApiDefinitionImportService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public List<ApiDefinitionDTO> parse(String documentContent, String format) {
        Object root = parseToObject(documentContent, format);
        if (root == null) {
            return List.of();
        }

        if (root instanceof List<?> listNode) {
            return parseListOfDefinitions(listNode);
        }
        if (!(root instanceof Map<?, ?> mapNodeRaw)) {
            return List.of();
        }

        Map<String, Object> mapNode = castMap(mapNodeRaw);
        if (mapNode.containsKey("paths")) {
            return parseOpenApi(mapNode);
        }
        ApiDefinitionDTO single = parseSingleDefinitionMap(mapNode);
        return single == null ? List.of() : List.of(single);
    }

    private Object parseToObject(String content, String format) {
        String normalized = format == null ? "auto" : format.trim().toLowerCase(Locale.ROOT);
        try {
            if ("yaml".equals(normalized) || "yml".equals(normalized)) {
                return yaml.load(content);
            }
            if ("json".equals(normalized)) {
                return objectMapper.readValue(content, new TypeReference<Object>() {
                });
            }
            try {
                return objectMapper.readValue(content, new TypeReference<Object>() {
                });
            } catch (Exception ignored) {
                return yaml.load(content);
            }
        } catch (Exception ignored) {
            return null;
        }
    }

    private List<ApiDefinitionDTO> parseListOfDefinitions(List<?> listNode) {
        List<ApiDefinitionDTO> definitions = new ArrayList<>();
        for (Object item : listNode) {
            if (!(item instanceof Map<?, ?> raw)) {
                continue;
            }
            ApiDefinitionDTO dto = parseSingleDefinitionMap(castMap(raw));
            if (dto != null) {
                definitions.add(dto);
            }
        }
        return definitions;
    }

    private ApiDefinitionDTO parseSingleDefinitionMap(Map<String, Object> map) {
        String apiName = asText(map.get("apiName"));
        String apiPath = asText(map.get("apiPath"));
        String method = asText(map.get("method"));
        if (isBlank(apiName) || isBlank(apiPath) || isBlank(method)) {
            return null;
        }

        ApiDefinitionDTO dto = new ApiDefinitionDTO();
        dto.setApiName(apiName);
        dto.setApiPath(apiPath);
        dto.setMethod(method.toUpperCase(Locale.ROOT));
        dto.setRequestParams(parseApiParams(map.get("requestParams")));
        dto.setResponseParams(parseApiParams(map.get("responseParams")));
        return dto;
    }

    private List<ApiDefinitionDTO> parseOpenApi(Map<String, Object> root) {
        Map<String, Object> paths = asMap(root.get("paths"));
        if (paths.isEmpty()) {
            return List.of();
        }

        List<ApiDefinitionDTO> definitions = new ArrayList<>();
        for (Map.Entry<String, Object> pathEntry : paths.entrySet()) {
            String apiPath = pathEntry.getKey();
            Map<String, Object> methodMap = asMap(pathEntry.getValue());
            if (methodMap.isEmpty()) {
                continue;
            }

            for (Map.Entry<String, Object> methodEntry : methodMap.entrySet()) {
                String method = methodEntry.getKey();
                if (!HTTP_METHODS.contains(method.toLowerCase(Locale.ROOT))) {
                    continue;
                }
                Map<String, Object> operation = asMap(methodEntry.getValue());
                String apiName = valueOrDefault(
                    asText(operation.get("summary")),
                    valueOrDefault(asText(operation.get("operationId")), method.toUpperCase(Locale.ROOT) + " " + apiPath)
                );

                ApiDefinitionDTO dto = new ApiDefinitionDTO();
                dto.setApiName(apiName);
                dto.setApiPath(apiPath);
                dto.setMethod(method.toUpperCase(Locale.ROOT));
                dto.setRequestParams(parseRequestParams(operation));
                dto.setResponseParams(parseResponseParams(operation));
                definitions.add(dto);
            }
        }
        return definitions;
    }

    private List<ApiParamDTO> parseRequestParams(Map<String, Object> operation) {
        List<ApiParamDTO> params = new ArrayList<>();

        Object paramNode = operation.get("parameters");
        if (paramNode instanceof List<?> list) {
            for (Object item : list) {
                Map<String, Object> map = asMap(item);
                if (map.isEmpty()) {
                    continue;
                }
                ApiParamDTO dto = new ApiParamDTO();
                dto.setName(asText(map.get("name")));
                dto.setType(asText(asMap(map.get("schema")).get("type")));
                dto.setRequired(asBoolean(map.get("required")));
                dto.setDescription(asText(map.get("description")));
                dto.setExample(toExample(asMap(map.get("schema")).get("example"), map.get("example")));
                if (!isBlank(dto.getName())) {
                    params.add(dto);
                }
            }
        }

        Map<String, Object> requestBody = asMap(operation.get("requestBody"));
        Map<String, Object> jsonContent = getJsonContent(requestBody);
        Map<String, Object> schema = asMap(jsonContent.get("schema"));
        params.addAll(parseSchemaToParams(schema, true));
        return params;
    }

    private List<ApiParamDTO> parseResponseParams(Map<String, Object> operation) {
        Map<String, Object> responses = asMap(operation.get("responses"));
        if (responses.isEmpty()) {
            return List.of();
        }
        Map<String, Object> success = firstNonEmpty(
            asMap(responses.get("200")),
            asMap(responses.get("201")),
            asMap(responses.get("default"))
        );
        if (success.isEmpty()) {
            return List.of();
        }
        Map<String, Object> jsonContent = getJsonContent(success);
        Map<String, Object> schema = asMap(jsonContent.get("schema"));
        return parseSchemaToParams(schema, false);
    }

    private List<ApiParamDTO> parseSchemaToParams(Map<String, Object> schema, boolean allowRequired) {
        Map<String, Object> properties = asMap(schema.get("properties"));
        if (properties.isEmpty()) {
            return List.of();
        }
        Set<String> requiredSet = asList(schema.get("required")).stream()
            .map(this::asText)
            .collect(Collectors.toSet());

        List<ApiParamDTO> params = new ArrayList<>();
        for (Map.Entry<String, Object> entry : properties.entrySet()) {
            String name = entry.getKey();
            Map<String, Object> field = asMap(entry.getValue());
            ApiParamDTO dto = new ApiParamDTO();
            dto.setName(name);
            dto.setType(valueOrDefault(asText(field.get("type")), "string"));
            dto.setRequired(allowRequired && requiredSet.contains(name));
            dto.setDescription(asText(field.get("description")));
            dto.setExample(toExample(field.get("example")));
            params.add(dto);
        }
        return params;
    }

    @SafeVarargs
    private final Map<String, Object> firstNonEmpty(Map<String, Object>... candidates) {
        for (Map<String, Object> item : candidates) {
            if (item != null && !item.isEmpty()) {
                return item;
            }
        }
        return Map.of();
    }

    private Map<String, Object> getJsonContent(Map<String, Object> node) {
        Map<String, Object> content = asMap(node.get("content"));
        if (content.isEmpty()) {
            return Map.of();
        }
        return firstNonEmpty(
            asMap(content.get("application/json")),
            asMap(content.get("application/*+json")),
            asMap(content.get("text/json"))
        );
    }

    private String toExample(Object... candidates) {
        for (Object item : candidates) {
            if (item == null) {
                continue;
            }
            if (item instanceof String text) {
                if (!text.isBlank()) {
                    return text;
                }
                continue;
            }
            try {
                return objectMapper.writeValueAsString(item);
            } catch (Exception ignored) {
                return String.valueOf(item);
            }
        }
        return "";
    }

    private List<ApiParamDTO> parseApiParams(Object value) {
        if (!(value instanceof List<?> list)) {
            return List.of();
        }
        List<ApiParamDTO> result = new ArrayList<>();
        for (Object item : list) {
            Map<String, Object> map = asMap(item);
            if (map.isEmpty()) {
                continue;
            }
            ApiParamDTO dto = new ApiParamDTO();
            dto.setName(asText(map.get("name")));
            dto.setType(valueOrDefault(asText(map.get("type")), "string"));
            dto.setRequired(asBoolean(map.get("required")));
            dto.setDescription(asText(map.get("description")));
            dto.setExample(asText(map.get("example")));
            result.add(dto);
        }
        return result;
    }

    private Map<String, Object> castMap(Map<?, ?> raw) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : raw.entrySet()) {
            map.put(String.valueOf(entry.getKey()), entry.getValue());
        }
        return map;
    }

    private Map<String, Object> asMap(Object raw) {
        if (!(raw instanceof Map<?, ?> map)) {
            return Map.of();
        }
        return castMap(map);
    }

    private List<Object> asList(Object raw) {
        if (raw instanceof List<?> list) {
            return new ArrayList<>(list);
        }
        return List.of();
    }

    private String asText(Object value) {
        if (value == null) {
            return "";
        }
        return String.valueOf(value);
    }

    private Boolean asBoolean(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        if (value instanceof Number number) {
            return number.intValue() != 0;
        }
        String text = asText(value).trim();
        if (text.isEmpty()) {
            return false;
        }
        return "true".equalsIgnoreCase(text) || "1".equals(text) || "yes".equalsIgnoreCase(text);
    }

    private String valueOrDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
