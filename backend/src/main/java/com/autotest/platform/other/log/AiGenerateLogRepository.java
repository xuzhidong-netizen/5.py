package com.autotest.platform.other.log;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AiGenerateLogRepository extends JpaRepository<AiGenerateLogEntity, Long> {

    List<AiGenerateLogEntity> findByOwnerOrderByCreatedAtDesc(String owner);

    List<AiGenerateLogEntity> findByOwnerAndGenerateTypeOrderByCreatedAtDesc(String owner, String generateType);
}
