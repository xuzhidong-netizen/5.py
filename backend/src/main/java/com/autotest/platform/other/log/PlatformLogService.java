package com.autotest.platform.other.log;

import java.io.PrintWriter;
import java.io.StringWriter;
import org.springframework.stereotype.Service;

@Service
public class PlatformLogService {

    private final OperationLogRepository operationLogRepository;
    private final ApiCallLogRepository apiCallLogRepository;
    private final AiGenerateLogRepository aiGenerateLogRepository;
    private final ExceptionLogRepository exceptionLogRepository;

    public PlatformLogService(
        OperationLogRepository operationLogRepository,
        ApiCallLogRepository apiCallLogRepository,
        AiGenerateLogRepository aiGenerateLogRepository,
        ExceptionLogRepository exceptionLogRepository
    ) {
        this.operationLogRepository = operationLogRepository;
        this.apiCallLogRepository = apiCallLogRepository;
        this.aiGenerateLogRepository = aiGenerateLogRepository;
        this.exceptionLogRepository = exceptionLogRepository;
    }

    public void recordOperation(
        String owner,
        String moduleName,
        String actionType,
        String requestPayload,
        String responsePayload,
        String result,
        String message
    ) {
        try {
            OperationLogEntity entity = new OperationLogEntity();
            entity.setOwner(normalizeOwner(owner));
            entity.setModuleName(moduleName);
            entity.setActionType(actionType);
            entity.setRequestPayload(requestPayload);
            entity.setResponsePayload(responsePayload);
            entity.setResult(result == null ? "SUCCESS" : result);
            entity.setMessage(message);
            operationLogRepository.save(entity);
        } catch (Exception ignored) {
            // Logging must not break business flow.
        }
    }

    public void recordApiCall(
        String owner,
        String moduleName,
        String endpoint,
        String httpMethod,
        String requestPayload,
        String responsePayload,
        Integer statusCode,
        Integer durationMs,
        boolean success,
        String errorMessage
    ) {
        try {
            ApiCallLogEntity entity = new ApiCallLogEntity();
            entity.setOwner(normalizeOwner(owner));
            entity.setModuleName(moduleName);
            entity.setEndpoint(endpoint);
            entity.setHttpMethod(httpMethod);
            entity.setRequestPayload(requestPayload);
            entity.setResponsePayload(responsePayload);
            entity.setStatusCode(statusCode);
            entity.setDurationMs(durationMs);
            entity.setSuccess(success);
            entity.setErrorMessage(errorMessage);
            apiCallLogRepository.save(entity);
        } catch (Exception ignored) {
            // Logging must not break business flow.
        }
    }

    public void recordAiGeneration(
        String owner,
        String generateType,
        String templateName,
        String modelName,
        String inputSummary,
        String outputSummary,
        Integer generatedCount,
        boolean success,
        Integer tokenUsage,
        Integer durationMs,
        String errorMessage
    ) {
        try {
            AiGenerateLogEntity entity = new AiGenerateLogEntity();
            entity.setOwner(normalizeOwner(owner));
            entity.setGenerateType(generateType);
            entity.setTemplateName(templateName);
            entity.setModelName(modelName);
            entity.setInputSummary(inputSummary);
            entity.setOutputSummary(outputSummary);
            entity.setGeneratedCount(generatedCount == null ? 0 : generatedCount);
            entity.setSuccess(success);
            entity.setTokenUsage(tokenUsage == null ? 0 : tokenUsage);
            entity.setDurationMs(durationMs == null ? 0 : durationMs);
            entity.setErrorMessage(errorMessage);
            aiGenerateLogRepository.save(entity);
        } catch (Exception ignored) {
            // Logging must not break business flow.
        }
    }

    public void recordException(String owner, String moduleName, Exception ex) {
        try {
            ExceptionLogEntity entity = new ExceptionLogEntity();
            entity.setOwner(normalizeOwner(owner));
            entity.setModuleName(moduleName);
            entity.setExceptionType(ex.getClass().getSimpleName());
            entity.setErrorMessage(ex.getMessage());
            entity.setStackTrace(toStackTrace(ex));
            exceptionLogRepository.save(entity);
        } catch (Exception ignored) {
            // Logging must not break business flow.
        }
    }

    private String normalizeOwner(String owner) {
        if (owner == null || owner.isBlank()) {
            return "anonymous";
        }
        return owner;
    }

    private String toStackTrace(Exception ex) {
        StringWriter sw = new StringWriter();
        try (PrintWriter pw = new PrintWriter(sw)) {
            ex.printStackTrace(pw);
            return sw.toString();
        }
    }
}
