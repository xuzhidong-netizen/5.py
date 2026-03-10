package com.xuzhidong.aitest.ai.repository;

import com.xuzhidong.aitest.ai.entity.TestExecutionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestExecutionRepository extends JpaRepository<TestExecutionEntity, Long> {

    List<TestExecutionEntity> findByRunIdOrderByIdAsc(String runId);

    List<TestExecutionEntity> findTop500ByOrderByExecutedAtDescIdDesc();
}
