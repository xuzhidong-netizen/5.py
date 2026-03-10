package com.xuzhidong.aitest.ai.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.ArrayList;
import java.util.List;

public class ExecuteRequestDTO {

    @NotEmpty
    private List<Long> caseIds = new ArrayList<>();

    public List<Long> getCaseIds() {
        return caseIds;
    }

    public void setCaseIds(List<Long> caseIds) {
        this.caseIds = caseIds == null ? new ArrayList<>() : caseIds;
    }
}
