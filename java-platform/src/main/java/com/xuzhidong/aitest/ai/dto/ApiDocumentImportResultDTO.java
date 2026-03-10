package com.xuzhidong.aitest.ai.dto;

import java.util.ArrayList;
import java.util.List;

public class ApiDocumentImportResultDTO {

    private int apiCount;
    private int caseCount;
    private List<ApiDefinitionDTO> apiDefinitions = new ArrayList<>();
    private List<TestCaseDTO> generatedCases = new ArrayList<>();

    public int getApiCount() {
        return apiCount;
    }

    public void setApiCount(int apiCount) {
        this.apiCount = apiCount;
    }

    public int getCaseCount() {
        return caseCount;
    }

    public void setCaseCount(int caseCount) {
        this.caseCount = caseCount;
    }

    public List<ApiDefinitionDTO> getApiDefinitions() {
        return apiDefinitions;
    }

    public void setApiDefinitions(List<ApiDefinitionDTO> apiDefinitions) {
        this.apiDefinitions = apiDefinitions == null ? new ArrayList<>() : apiDefinitions;
    }

    public List<TestCaseDTO> getGeneratedCases() {
        return generatedCases;
    }

    public void setGeneratedCases(List<TestCaseDTO> generatedCases) {
        this.generatedCases = generatedCases == null ? new ArrayList<>() : generatedCases;
    }
}
