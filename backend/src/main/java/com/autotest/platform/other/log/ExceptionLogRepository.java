package com.autotest.platform.other.log;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExceptionLogRepository extends JpaRepository<ExceptionLogEntity, Long> {

    List<ExceptionLogEntity> findByOwnerOrderByCreatedAtDesc(String owner);
}
