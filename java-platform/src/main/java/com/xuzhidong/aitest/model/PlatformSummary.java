package com.xuzhidong.aitest.model;

public class PlatformSummary {
    private long functionCount;
    private long caseCount;
    private long runCount;
    private String latestHisId;

    public long getFunctionCount() {
        return functionCount;
    }

    public void setFunctionCount(long functionCount) {
        this.functionCount = functionCount;
    }

    public long getCaseCount() {
        return caseCount;
    }

    public void setCaseCount(long caseCount) {
        this.caseCount = caseCount;
    }

    public long getRunCount() {
        return runCount;
    }

    public void setRunCount(long runCount) {
        this.runCount = runCount;
    }

    public String getLatestHisId() {
        return latestHisId;
    }

    public void setLatestHisId(String latestHisId) {
        this.latestHisId = latestHisId;
    }
}
