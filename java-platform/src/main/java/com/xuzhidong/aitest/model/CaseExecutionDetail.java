package com.xuzhidong.aitest.model;

public class CaseExecutionDetail {
    private Long caseId;
    private String caseName;
    private String caseResult;
    private String caseMsg;

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public String getCaseName() {
        return caseName;
    }

    public void setCaseName(String caseName) {
        this.caseName = caseName;
    }

    public String getCaseResult() {
        return caseResult;
    }

    public void setCaseResult(String caseResult) {
        this.caseResult = caseResult;
    }

    public String getCaseMsg() {
        return caseMsg;
    }

    public void setCaseMsg(String caseMsg) {
        this.caseMsg = caseMsg;
    }
}
