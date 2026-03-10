package com.xuzhidong.aitest.ai.dto;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

public class ApiDocumentDTO {

    private String apiName;
    private String apiPath;
    private String method;
    private LocalDateTime generatedAt;
    private boolean aiParticipated;
    private String aiEngine;
    private boolean remoteLlmConfigured;
    private boolean remoteLlmUsed;
    private String markdown;
    private Map<String, Object> openApi = new LinkedHashMap<>();

    public String getApiName() {
        return apiName;
    }

    public void setApiName(String apiName) {
        this.apiName = apiName;
    }

    public String getApiPath() {
        return apiPath;
    }

    public void setApiPath(String apiPath) {
        this.apiPath = apiPath;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(LocalDateTime generatedAt) {
        this.generatedAt = generatedAt;
    }

    public boolean isAiParticipated() {
        return aiParticipated;
    }

    public void setAiParticipated(boolean aiParticipated) {
        this.aiParticipated = aiParticipated;
    }

    public String getAiEngine() {
        return aiEngine;
    }

    public void setAiEngine(String aiEngine) {
        this.aiEngine = aiEngine;
    }

    public boolean isRemoteLlmConfigured() {
        return remoteLlmConfigured;
    }

    public void setRemoteLlmConfigured(boolean remoteLlmConfigured) {
        this.remoteLlmConfigured = remoteLlmConfigured;
    }

    public boolean isRemoteLlmUsed() {
        return remoteLlmUsed;
    }

    public void setRemoteLlmUsed(boolean remoteLlmUsed) {
        this.remoteLlmUsed = remoteLlmUsed;
    }

    public String getMarkdown() {
        return markdown;
    }

    public void setMarkdown(String markdown) {
        this.markdown = markdown;
    }

    public Map<String, Object> getOpenApi() {
        return openApi;
    }

    public void setOpenApi(Map<String, Object> openApi) {
        this.openApi = openApi == null ? new LinkedHashMap<>() : openApi;
    }
}
