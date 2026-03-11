package com.autotest.platform.other.log;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApiCallLogRepository extends JpaRepository<ApiCallLogEntity, Long> {

    List<ApiCallLogEntity> findByOwnerOrderByCreatedAtDesc(String owner);
}
