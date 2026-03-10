package com.xuzhidong.aitest.ai.dto;

import java.util.ArrayList;
import java.util.List;

public class ApiDocumentBatchResultDTO {

    private int apiCount;
    private boolean aiParticipated;
    private int remoteLlmUsedCount;
    private int fallbackAiUsedCount;
    private List<String> aiEngines = new ArrayList<>();
    private List<ApiDefinitionDTO> apiDefinitions = new ArrayList<>();
    private List<ApiDocumentDTO> documents = new ArrayList<>();

    public int getApiCount() {
        return apiCount;
    }

    public void setApiCount(int apiCount) {
        this.apiCount = apiCount;
    }

    public boolean isAiParticipated() {
        return aiParticipated;
    }

    public void setAiParticipated(boolean aiParticipated) {
        this.aiParticipated = aiParticipated;
    }

    public int getRemoteLlmUsedCount() {
        return remoteLlmUsedCount;
    }

    public void setRemoteLlmUsedCount(int remoteLlmUsedCount) {
        this.remoteLlmUsedCount = remoteLlmUsedCount;
    }

    public int getFallbackAiUsedCount() {
        return fallbackAiUsedCount;
    }

    public void setFallbackAiUsedCount(int fallbackAiUsedCount) {
        this.fallbackAiUsedCount = fallbackAiUsedCount;
    }

    public List<String> getAiEngines() {
        return aiEngines;
    }

    public void setAiEngines(List<String> aiEngines) {
        this.aiEngines = aiEngines == null ? new ArrayList<>() : aiEngines;
    }

    public List<ApiDefinitionDTO> getApiDefinitions() {
        return apiDefinitions;
    }

    public void setApiDefinitions(List<ApiDefinitionDTO> apiDefinitions) {
        this.apiDefinitions = apiDefinitions == null ? new ArrayList<>() : apiDefinitions;
    }

    public List<ApiDocumentDTO> getDocuments() {
        return documents;
    }

    public void setDocuments(List<ApiDocumentDTO> documents) {
        this.documents = documents == null ? new ArrayList<>() : documents;
    }
}
