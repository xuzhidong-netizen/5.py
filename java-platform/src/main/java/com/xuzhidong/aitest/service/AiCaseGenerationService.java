package com.xuzhidong.aitest.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xuzhidong.aitest.model.AiCase;
import com.xuzhidong.aitest.model.AiFunction;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class AiCaseGenerationService {

    private static final DateTimeFormatter CASE_ID_FORMATTER = DateTimeFormatter.ofPattern("yyMMddHHmmss");

    private final PlatformStore store;
    private final ObjectMapper objectMapper;

    public AiCaseGenerationService(PlatformStore store, ObjectMapper objectMapper) {
        this.store = store;
        this.objectMapper = objectMapper;
    }

    public GenerationResult generate(GenerationRequest request) {
        AiFunction function = store.findFunction(request.sysId(), request.funcNo())
            .orElseThrow(() -> new IllegalArgumentException("功能号不存在，请先在 T_AI_FUNCTION 中新增接口"));

        long caseId = request.caseId() == null ? nextCaseId() : request.caseId();
        String moduleName = blankOrValue(request.moduleName(), "AI自动生成模块");
        String scenario = blankOrValue(request.scenario(), "标准交易场景");
        String businessGoal = blankOrValue(request.businessGoal(), "校验接口功能返回结果");
        String sysName = blankOrValue(request.sysName(), function.getSysName());
        String env = blankOrValue(request.environment(), "50000");

        String caseName = "AI生成_" + moduleName + "_" + scenario + "_" + function.getFuncNo();
        String caseKvBase = toJson(Map.of(
            "env", env,
            "funcno", function.getFuncNo(),
            "funcName", function.getFuncName(),
            "requestMethod", blankOrValue(function.getFuncRequestMethod(), "POST"),
            "httpUrl", blankOrValue(function.getFuncHttpUrl(), ""),
            "businessGoal", businessGoal,
            "param", Map.of(
                "module", moduleName,
                "scenario", scenario
            )
        ));
        String caseKvDynamic = toJson(Map.of(
            "i_resource", "0",
            "i_sysid", sysName,
            "i_sysver", blankOrValue(request.version(), "latest"),
            "i_request_data", "aitest_devops_batch",
            "i_func_no", function.getFuncNo()
        ));

        AiCase generated = new AiCase();
        generated.setSysId(request.sysId());
        generated.setSysName(sysName);
        generated.setCaseId(caseId);
        generated.setCaseName(caseName);
        generated.setCaseType("正例");
        generated.setRunFlag("1");
        generated.setCaseKvBase(caseKvBase);
        generated.setCaseKvDynamic(caseKvDynamic);
        generated.setCaseCheckFunction("517184");
        generated.setCaseRemark("由AI策略自动生成，目标：" + businessGoal);
        generated.setFuncNo(function.getFuncNo());
        generated.setFuncName(function.getFuncName());
        generated.setFuncType(function.getFuncType());
        generated.setSubFuncType(function.getSubFuncType());
        generated.setModuleName(moduleName);

        boolean saved = false;
        if (Boolean.TRUE.equals(request.autoSave())) {
            generated = store.addCase(generated);
            saved = true;
        }

        Map<String, Object> promptPayload = new LinkedHashMap<>();
        promptPayload.put("sysId", generated.getSysId());
        promptPayload.put("funcNo", generated.getFuncNo());
        promptPayload.put("moduleName", generated.getModuleName());
        promptPayload.put("scenario", scenario);
        promptPayload.put("businessGoal", businessGoal);
        promptPayload.put("environment", env);
        String generationPrompt = "根据输入生成接口测试正例，输出结构化caseKvBase/caseKvDynamic并保证可执行。输入：" + toJson(promptPayload);

        return new GenerationResult(generated, saved, generationPrompt, "RuleBased-LLM-Adapter");
    }

    private long nextCaseId() {
        String base = CASE_ID_FORMATTER.format(LocalDateTime.now());
        int suffix = ThreadLocalRandom.current().nextInt(100, 1000);
        return Long.parseLong(base + suffix);
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("JSON 序列化失败", e);
        }
    }

    private String blankOrValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    public record GenerationRequest(
        String sysId,
        String sysName,
        String funcNo,
        Long caseId,
        String moduleName,
        String scenario,
        String businessGoal,
        String environment,
        String version,
        Boolean autoSave
    ) {
    }

    public record GenerationResult(
        AiCase generatedCase,
        boolean saved,
        String generationPrompt,
        String model
    ) {
    }
}
