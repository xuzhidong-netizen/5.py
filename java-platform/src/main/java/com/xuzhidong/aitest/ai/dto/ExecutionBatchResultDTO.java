package com.xuzhidong.aitest.ai.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ExecutionBatchResultDTO {

    private String runId;
    private String status;
    private int total;
    private int passed;
    private int failed;
    private LocalDateTime executedAt;
    private List<ExecutionResultDTO> results = new ArrayList<>();

    public String getRunId() {
        return runId;
    }

    public void setRunId(String runId) {
        this.runId = runId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getPassed() {
        return passed;
    }

    public void setPassed(int passed) {
        this.passed = passed;
    }

    public int getFailed() {
        return failed;
    }

    public void setFailed(int failed) {
        this.failed = failed;
    }

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }

    public List<ExecutionResultDTO> getResults() {
        return results;
    }

    public void setResults(List<ExecutionResultDTO> results) {
        this.results = results == null ? new ArrayList<>() : results;
    }
}
