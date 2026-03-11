package com.autotest.platform.casecenter;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestCaseRepository extends JpaRepository<TestCaseEntity, Long> {

    List<TestCaseEntity> findByOwnerAndCaseStatusOrderByUpdatedAtDesc(String owner, TestCaseStatus caseStatus);

    Optional<TestCaseEntity> findByIdAndOwnerAndCaseStatus(Long id, String owner, TestCaseStatus caseStatus);

    Optional<TestCaseEntity> findByIdAndOwner(Long id, String owner);

    List<TestCaseEntity> findByIdInAndOwnerAndCaseStatus(List<Long> ids, String owner, TestCaseStatus caseStatus);

    List<TestCaseEntity> findByIdInAndOwner(List<Long> ids, String owner);

    long countByOwnerAndCaseStatus(String owner, TestCaseStatus caseStatus);
}
