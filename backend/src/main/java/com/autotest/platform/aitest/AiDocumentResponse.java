package com.autotest.platform.aitest;

public record AiDocumentResponse(
    String markdown,
    String openapi,
    boolean aiParticipated,
    String aiEngine
) {
}
