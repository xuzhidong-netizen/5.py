package com.xuzhidong.aitest.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class VersionExecution {
    private String hisId;
    private String runName;
    private String versionName;
    private String versionNumber;
    private ExecutionMode mode;
    private ExecutionStatus status;
    private int totalCases;
    private int successCases;
    private int failedCases;
    private String passRate;
    private long executeSeconds;
    private LocalDateTime beginTime;
    private LocalDateTime endTime;
    private String message;
    private List<CaseExecutionDetail> details = new ArrayList<>();

    public String getHisId() {
        return hisId;
    }

    public void setHisId(String hisId) {
        this.hisId = hisId;
    }

    public String getRunName() {
        return runName;
    }

    public void setRunName(String runName) {
        this.runName = runName;
    }

    public String getVersionName() {
        return versionName;
    }

    public void setVersionName(String versionName) {
        this.versionName = versionName;
    }

    public String getVersionNumber() {
        return versionNumber;
    }

    public void setVersionNumber(String versionNumber) {
        this.versionNumber = versionNumber;
    }

    public ExecutionMode getMode() {
        return mode;
    }

    public void setMode(ExecutionMode mode) {
        this.mode = mode;
    }

    public ExecutionStatus getStatus() {
        return status;
    }

    public void setStatus(ExecutionStatus status) {
        this.status = status;
    }

    public int getTotalCases() {
        return totalCases;
    }

    public void setTotalCases(int totalCases) {
        this.totalCases = totalCases;
    }

    public int getSuccessCases() {
        return successCases;
    }

    public void setSuccessCases(int successCases) {
        this.successCases = successCases;
    }

    public int getFailedCases() {
        return failedCases;
    }

    public void setFailedCases(int failedCases) {
        this.failedCases = failedCases;
    }

    public String getPassRate() {
        return passRate;
    }

    public void setPassRate(String passRate) {
        this.passRate = passRate;
    }

    public long getExecuteSeconds() {
        return executeSeconds;
    }

    public void setExecuteSeconds(long executeSeconds) {
        this.executeSeconds = executeSeconds;
    }

    public LocalDateTime getBeginTime() {
        return beginTime;
    }

    public void setBeginTime(LocalDateTime beginTime) {
        this.beginTime = beginTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<CaseExecutionDetail> getDetails() {
        return details;
    }

    public void setDetails(List<CaseExecutionDetail> details) {
        this.details = details;
    }
}
