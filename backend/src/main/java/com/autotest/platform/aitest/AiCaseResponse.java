package com.autotest.platform.aitest;

import java.util.List;

public record AiCaseResponse(
    List<String> cases,
    boolean aiParticipated,
    String aiEngine
) {
}
