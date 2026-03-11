package com.autotest.platform.casecenter;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record CaseBatchRequest(
    @NotEmpty List<Long> ids,
    Boolean force
) {

    public boolean forceOrFalse() {
        return Boolean.TRUE.equals(force);
    }
}
