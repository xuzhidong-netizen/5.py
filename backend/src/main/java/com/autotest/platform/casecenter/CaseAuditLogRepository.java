package com.autotest.platform.casecenter;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CaseAuditLogRepository extends JpaRepository<CaseAuditLogEntity, Long> {

    List<CaseAuditLogEntity> findByOwnerOrderByCreatedAtDesc(String owner);

    long countByOwnerAndAction(String owner, String action);

    long countByOwnerAndActionIn(String owner, List<String> actions);
}
