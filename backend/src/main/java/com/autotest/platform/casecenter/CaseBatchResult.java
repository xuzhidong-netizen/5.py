package com.autotest.platform.casecenter;

import java.util.ArrayList;
import java.util.List;

public class CaseBatchResult {

    private int affectedCount;
    private List<Long> skippedIds = new ArrayList<>();
    private List<String> warnings = new ArrayList<>();

    public int getAffectedCount() {
        return affectedCount;
    }

    public void setAffectedCount(int affectedCount) {
        this.affectedCount = affectedCount;
    }

    public List<Long> getSkippedIds() {
        return skippedIds;
    }

    public void setSkippedIds(List<Long> skippedIds) {
        this.skippedIds = skippedIds;
    }

    public List<String> getWarnings() {
        return warnings;
    }

    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
}
