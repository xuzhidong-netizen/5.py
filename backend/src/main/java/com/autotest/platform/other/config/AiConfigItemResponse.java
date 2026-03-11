package com.autotest.platform.other.config;

import java.time.LocalDateTime;

public record AiConfigItemResponse(
    Long id,
    AiConfigType type,
    String name,
    String configKey,
    String scope,
    String content,
    Boolean enabled,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {

    static AiConfigItemResponse fromEntity(AiConfigEntity entity) {
        return new AiConfigItemResponse(
            entity.getId(),
            entity.getType(),
            entity.getName(),
            entity.getConfigKey(),
            entity.getScope(),
            entity.getContent(),
            entity.getEnabled(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
