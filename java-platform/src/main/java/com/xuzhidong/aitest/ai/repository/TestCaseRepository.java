package com.xuzhidong.aitest.ai.repository;

import com.xuzhidong.aitest.ai.entity.TestCaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCaseRepository extends JpaRepository<TestCaseEntity, Long> {
}
