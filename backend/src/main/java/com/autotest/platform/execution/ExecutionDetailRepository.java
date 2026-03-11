package com.autotest.platform.execution;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExecutionDetailRepository extends JpaRepository<ExecutionDetailEntity, Long> {

    boolean existsByCaseIdAndExecution_OwnerAndExecution_Status(Long caseId, String owner, ExecutionStatus status);

    boolean existsByCaseIdAndExecution_Owner(Long caseId, String owner);

    List<ExecutionDetailEntity> findByExecution_OwnerOrderByCreatedAtDesc(String owner);
}
