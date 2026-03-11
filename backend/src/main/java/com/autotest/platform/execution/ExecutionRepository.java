package com.autotest.platform.execution;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExecutionRepository extends JpaRepository<ExecutionEntity, Long> {

    List<ExecutionEntity> findByOwnerOrderByStartedAtDesc(String owner);

    @EntityGraph(attributePaths = "details")
    Optional<ExecutionEntity> findByRunIdAndOwner(String runId, String owner);
}
