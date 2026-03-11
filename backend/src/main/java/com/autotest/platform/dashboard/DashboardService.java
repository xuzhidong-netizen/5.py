package com.autotest.platform.dashboard;

import com.autotest.platform.casecenter.TestCaseRepository;
import com.autotest.platform.casecenter.TestCaseStatus;
import com.autotest.platform.execution.ExecutionRepository;
import com.autotest.platform.execution.ExecutionStatus;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final TestCaseRepository testCaseRepository;
    private final ExecutionRepository executionRepository;

    public DashboardService(TestCaseRepository testCaseRepository, ExecutionRepository executionRepository) {
        this.testCaseRepository = testCaseRepository;
        this.executionRepository = executionRepository;
    }

    public DashboardResponse summary(String username) {
        long draftCases = testCaseRepository.countByOwnerAndCaseStatus(username, TestCaseStatus.DRAFT);
        long publishedCases = testCaseRepository.countByOwnerAndCaseStatus(username, TestCaseStatus.PUBLISHED);
        var executions = executionRepository.findByOwnerOrderByStartedAtDesc(username);

        long totalCases = draftCases + publishedCases;
        long enabledCases = publishedCases;
        long totalExecutions = executions.size();
        long passedExecutions = executions.stream().filter(item -> item.getStatus() == ExecutionStatus.PASSED).count();
        long failedExecutions = executions.stream().filter(item -> item.getStatus() == ExecutionStatus.FAILED).count();
        String latestRunId = executions.isEmpty() ? null : executions.get(0).getRunId();

        return new DashboardResponse(
            username,
            totalCases,
            enabledCases,
            totalExecutions,
            passedExecutions,
            failedExecutions,
            latestRunId
        );
    }
}
