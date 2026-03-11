package com.autotest.platform.casecenter;

public record CaseActionRequest(Boolean force) {

    public boolean forceOrFalse() {
        return Boolean.TRUE.equals(force);
    }
}
