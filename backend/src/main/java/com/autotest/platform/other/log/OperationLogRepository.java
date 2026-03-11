package com.autotest.platform.other.log;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OperationLogRepository extends JpaRepository<OperationLogEntity, Long> {

    List<OperationLogEntity> findByOwnerOrderByCreatedAtDesc(String owner);

    long countByOwnerAndActionType(String owner, String actionType);
}
