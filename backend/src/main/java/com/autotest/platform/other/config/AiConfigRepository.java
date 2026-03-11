package com.autotest.platform.other.config;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiConfigRepository extends JpaRepository<AiConfigEntity, Long> {

    List<AiConfigEntity> findByOwnerAndTypeOrderByUpdatedAtDesc(String owner, AiConfigType type);

    Optional<AiConfigEntity> findByIdAndOwnerAndType(Long id, String owner, AiConfigType type);

    long countByOwnerAndType(String owner, AiConfigType type);
}
