package com.xuzhidong.aitest.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xuzhidong.aitest.ai.service.LlmClient;
import com.xuzhidong.aitest.model.AiCase;
import com.xuzhidong.aitest.model.AiFunction;
import com.xuzhidong.aitest.model.ExecutionMode;
import com.xuzhidong.aitest.model.VersionExecution;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class AiInterfaceCaseService {

    private static final DateTimeFormatter CASE_ID_FORMATTER = DateTimeFormatter.ofPattern("yyMMddHHmmss");
    public static final String AI_INTERFACE_CASE_TAG = "[AI_INTERFACE_CASE]";

    private final PlatformStore store;
    private final LlmClient llmClient;
    private final ObjectMapper objectMapper;
    private final ExecutionService executionService;

    private final Map<String, GenerationSession> generationSessions = new ConcurrentHashMap<>();
    private final AtomicLong tempCaseIdGenerator = new AtomicLong(300000);
    private final Map<Long, PreGeneratedCase> tempCases = new ConcurrentHashMap<>();
    private final List<Long> tempCaseOrder = new CopyOnWriteArrayList<>();

    public AiInterfaceCaseService(PlatformStore store,
                                  LlmClient llmClient,
                                  ObjectMapper objectMapper,
                                  ExecutionService executionService) {
        this.store = store;
        this.llmClient = llmClient;
        this.objectMapper = objectMapper;
        this.executionService = executionService;
    }

    public GenerateResult generate(GenerateRequest request) {
        List<Map<String, Object>> parsedRows = new ArrayList<>();
        if (request.importRows() != null) {
            for (Map<String, Object> row : request.importRows()) {
                if (row != null && !row.isEmpty()) {
                    parsedRows.add(row);
                }
            }
        }
        if (!isBlank(request.textInput())) {
            parsedRows.addAll(parseTextInput(request.textInput()));
        }
        if (parsedRows.isEmpty()) {
            throw new IllegalArgumentException("请先输入文本信息或导入Excel内容");
        }

        Candidate seed = buildSeedCandidate();
        List<Candidate> parsedCandidates = new ArrayList<>();
        for (int i = 0; i < parsedRows.size(); i++) {
            parsedCandidates.add(buildCandidate(parsedRows.get(i), i, "IMPORT_PARSED", seed));
        }

        String prompt = buildPrompt(seed, parsedCandidates, request.textInput());
        List<Candidate> aiCandidates = generateAiCandidates(prompt, parsedCandidates, seed);
        List<Candidate> merged = mergeCandidates(parsedCandidates, aiCandidates);

        String generationId = "gen_" + UUID.randomUUID().toString().replace("-", "");
        GenerationSession session = new GenerationSession(generationId, merged, prompt);
        generationSessions.put(generationId, session);
        List<PreGeneratedCase> generatedTempCases = cachePreGeneratedCases(generationId, merged);

        return new GenerateResult(
            generationId,
            merged,
            prompt,
            llmClient.isConfigured(),
            !aiCandidates.isEmpty(),
            !aiCandidates.isEmpty() ? "REMOTE_LLM" : "LOCAL_RULE_AI",
            seed,
            parsedRows.size(),
            generatedTempCases
        );
    }

    public SaveResult save(SaveRequest request) {
        GenerationSession session = generationSessions.get(request.generationId());
        if (session == null) {
            throw new IllegalArgumentException("生成会话不存在，请重新执行AI生成");
        }

        Set<String> selectedIds = new LinkedHashSet<>();
        if (request.candidateIds() != null) {
            for (String id : request.candidateIds()) {
                if (!isBlank(id)) {
                    selectedIds.add(id.trim());
                }
            }
        }

        List<Candidate> selected = session.candidates().stream()
            .filter(item -> selectedIds.isEmpty() || selectedIds.contains(item.getCandidateId()))
            .toList();
        if (selected.isEmpty()) {
            throw new IllegalArgumentException("未选中可入库候选案例");
        }

        List<SaveItemResult> items = new ArrayList<>();
        int functionCreatedCount = 0;
        int caseCreatedCount = 0;

        for (Candidate candidate : selected) {
            SaveItemResult item = new SaveItemResult();
            item.setCandidateId(candidate.getCandidateId());
            item.setFuncNo(candidate.getFuncNo());
            item.setCaseId(candidate.getCaseId());
            item.setCaseName(candidate.getCaseName());

            if (!candidate.isValid()) {
                item.setSuccess(false);
                item.setMessage("候选数据不完整：" + valueOrDefault(candidate.getValidationMessage(), "缺少必填字段"));
                items.add(item);
                continue;
            }

            boolean functionCreated = false;
            try {
                if (store.findFunction(candidate.getSysId(), candidate.getFuncNo()).isEmpty()) {
                    AiFunction function = toFunction(candidate);
                    store.addFunction(function);
                    functionCreated = true;
                }
            } catch (IllegalArgumentException ex) {
                if (store.findFunction(candidate.getSysId(), candidate.getFuncNo()).isEmpty()) {
                    item.setSuccess(false);
                    item.setMessage("接口入库失败：" + ex.getMessage());
                    items.add(item);
                    continue;
                }
            }

            try {
                AiCase aiCase = toCase(candidate);
                AiCase savedCase = store.addCase(aiCase);
                item.setSuccess(true);
                item.setFunctionCreated(functionCreated);
                item.setCaseRecordId(savedCase.getId());
                item.setMessage("入库成功");
                items.add(item);

                if (functionCreated) {
                    functionCreatedCount += 1;
                }
                caseCreatedCount += 1;
            } catch (IllegalArgumentException ex) {
                item.setSuccess(false);
                item.setFunctionCreated(functionCreated);
                item.setMessage("案例入库失败：" + ex.getMessage());
                items.add(item);
            }
        }

        String executionHisId = null;
        VersionExecution execution = null;
        if (Boolean.TRUE.equals(request.autoExecute()) && caseCreatedCount > 0) {
            execution = executionService.createAndRunExecution(
                "AI接口自动化",
                "latest",
                ExecutionMode.AGENT,
                "AI生成接口案例自动入库触发执行"
            );
            executionHisId = execution.getHisId();
        }

        SaveResult result = new SaveResult();
        result.setGenerationId(request.generationId());
        result.setItems(items);
        result.setSelectedCount(selected.size());
        result.setFunctionCreatedCount(functionCreatedCount);
        result.setCaseCreatedCount(caseCreatedCount);
        result.setExecutionHisId(executionHisId);
        result.setExecution(execution);
        return result;
    }

    public List<PreGeneratedCase> listTempCases(Integer status) {
        return tempCaseOrder.stream()
            .map(tempCases::get)
            .filter(item -> item != null)
            .filter(item -> status == null || status < 0 || item.getStatus() == status)
            .sorted(Comparator.comparing(PreGeneratedCase::getTempId).reversed())
            .toList();
    }

    public PreGeneratedCase updateTempCase(TempCaseUpdateRequest request) {
        if (request.tempId() == null) {
            throw new IllegalArgumentException("tempId不能为空");
        }
        PreGeneratedCase tempCase = tempCases.get(request.tempId());
        if (tempCase == null) {
            throw new IllegalArgumentException("预生成案例不存在: " + request.tempId());
        }
        boolean wasStored = tempCase.getStatus() == 1;
        String originalSysId = tempCase.getSysId();
        Long originalCaseId = tempCase.getCaseId();
        Long originalCaseRecordId = tempCase.getCaseRecordId();

        patchText(request.sysId(), tempCase::setSysId);
        patchText(request.sysName(), tempCase::setSysName);
        patchText(request.funcNo(), tempCase::setFuncNo);
        patchText(request.funcName(), tempCase::setFuncName);
        patchText(request.funcType(), tempCase::setFuncType);
        patchText(request.subFuncType(), tempCase::setSubFuncType);
        patchText(request.funcParamMatch(), tempCase::setFuncParamMatch);
        patchText(request.funcHttpUrl(), tempCase::setFuncHttpUrl);
        patchText(request.funcRequestMethod(), tempCase::setFuncRequestMethod);
        patchText(request.funcRemark(), tempCase::setFuncRemark);
        if (request.caseId() != null) {
            tempCase.setCaseId(request.caseId());
        }
        patchText(request.caseName(), tempCase::setCaseName);
        patchText(request.caseType(), tempCase::setCaseType);
        patchText(request.runFlag(), tempCase::setRunFlag);
        patchText(request.caseKvBase(), tempCase::setCaseKvBase);
        patchText(request.caseKvDynamic(), tempCase::setCaseKvDynamic);
        patchText(request.caseCheckFunction(), tempCase::setCaseCheckFunction);
        patchText(request.moduleName(), tempCase::setModuleName);
        patchText(request.caseRemark(), tempCase::setCaseRemark);
        patchText(request.businessGoal(), tempCase::setBusinessGoal);
        patchText(request.scenario(), tempCase::setScenario);
        tempCase.setUpdatedAt(LocalDateTime.now());

        Candidate candidate = toCandidate(tempCase);
        validateCandidate(candidate);
        tempCase.setValid(candidate.isValid());
        tempCase.setValidationMessage(candidate.getValidationMessage());
        if (wasStored) {
            if (!candidate.isValid()) {
                throw new IllegalArgumentException("已入库案例修改后必填字段不完整，无法保存");
            }
            AiCase updatedCase = toCase(candidate);
            Long syncedRecordId = syncStoredCase(tempCase, updatedCase, originalCaseRecordId, originalSysId, originalCaseId);
            tempCase.setCaseRecordId(syncedRecordId);
            tempCase.setStatus(1);
            tempCase.setStatusMessage("已入库(已更新)");
        } else {
            tempCase.setStatus(0);
            tempCase.setStatusMessage("待人工审核");
        }
        return tempCase;
    }

    public BatchActionResult deleteTempCases(List<Long> tempIds) {
        if (tempIds == null || tempIds.isEmpty()) {
            throw new IllegalArgumentException("请选择要删除的预生成案例");
        }
        int deleted = 0;
        for (Long tempId : tempIds) {
            if (tempId == null) {
                continue;
            }
            PreGeneratedCase removed = tempCases.remove(tempId);
            if (removed != null) {
                if (removed.getStatus() == 1) {
                    deleteStoredCase(removed);
                }
                tempCaseOrder.remove(tempId);
                deleted += 1;
            }
        }
        BatchActionResult result = new BatchActionResult();
        result.setAction("delete");
        result.setAffectedCount(deleted);
        result.setMessage("删除完成");
        return result;
    }

    public BatchActionResult regenerateTempCases(List<Long> tempIds, Integer copiesPerCase) {
        int copies = copiesPerCase == null || copiesPerCase < 1 ? 1 : Math.min(copiesPerCase, 3);
        List<PreGeneratedCase> source = filterTempCasesByIds(tempIds, false);
        if (source.isEmpty()) {
            throw new IllegalArgumentException("未找到可再生的预生成案例");
        }
        int created = 0;
        for (PreGeneratedCase item : source) {
            for (int i = 0; i < copies; i++) {
                Candidate base = toCandidate(item);
                base.setCandidateId("cand_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
                base.setSource("REGENERATED");
                base.setCaseId(nextCaseId());
                base.setCaseName(base.getCaseName() + "_再生" + (i + 1));
                base.setScenario(valueOrDefault(base.getScenario(), "标准交易场景") + "_再生");
                validateCandidate(base);
                cachePreGeneratedCase(item.getGenerationId(), base);
                created += 1;
            }
        }
        BatchActionResult result = new BatchActionResult();
        result.setAction("regenerate");
        result.setAffectedCount(created);
        result.setMessage("再生完成");
        return result;
    }

    public SaveResult storeTempCases(TempStoreRequest request) {
        List<PreGeneratedCase> selected = filterTempCasesByIds(request.tempIds(), true);
        if (selected.isEmpty()) {
            throw new IllegalArgumentException("未选中待入库的预生成案例");
        }

        List<SaveItemResult> items = new ArrayList<>();
        int functionCreatedCount = 0;
        int caseCreatedCount = 0;

        for (PreGeneratedCase tempCase : selected) {
            Candidate candidate = toCandidate(tempCase);
            validateCandidate(candidate);
            tempCase.setValid(candidate.isValid());
            tempCase.setValidationMessage(candidate.getValidationMessage());
            SaveItemResult item = persistCandidate(candidate);
            item.setTempId(tempCase.getTempId());
            items.add(item);

            tempCase.setUpdatedAt(LocalDateTime.now());
            if (item.isSuccess()) {
                tempCase.setStatus(1);
                tempCase.setStatusMessage("已入库");
                tempCase.setCaseRecordId(item.getCaseRecordId());
                if (item.isFunctionCreated()) {
                    functionCreatedCount += 1;
                }
                caseCreatedCount += 1;
            } else {
                tempCase.setStatus(0);
                tempCase.setStatusMessage(item.getMessage());
            }
        }

        String executionHisId = null;
        VersionExecution execution = null;
        if (Boolean.TRUE.equals(request.autoExecute()) && caseCreatedCount > 0) {
            execution = executionService.createAndRunExecution(
                "AI接口自动化",
                "latest",
                ExecutionMode.AGENT,
                "AI预生成案例人工确认后入库执行"
            );
            executionHisId = execution.getHisId();
        }

        SaveResult result = new SaveResult();
        result.setGenerationId(request.generationId());
        result.setItems(items);
        result.setSelectedCount(selected.size());
        result.setFunctionCreatedCount(functionCreatedCount);
        result.setCaseCreatedCount(caseCreatedCount);
        result.setExecutionHisId(executionHisId);
        result.setExecution(execution);
        return result;
    }

    public BatchActionResult cancelStoreTempCases(List<Long> tempIds) {
        if (tempIds == null || tempIds.isEmpty()) {
            throw new IllegalArgumentException("请选择要取消入库的案例");
        }
        int affected = 0;
        for (Long tempId : tempIds) {
            if (tempId == null) {
                continue;
            }
            PreGeneratedCase tempCase = tempCases.get(tempId);
            if (tempCase == null || tempCase.getStatus() != 1) {
                continue;
            }
            deleteStoredCase(tempCase);
            tempCase.setStatus(0);
            tempCase.setStatusMessage("待人工审核(已取消入库)");
            tempCase.setCaseRecordId(null);
            tempCase.setUpdatedAt(LocalDateTime.now());
            affected += 1;
        }
        BatchActionResult result = new BatchActionResult();
        result.setAction("cancelStore");
        result.setAffectedCount(affected);
        result.setMessage("取消入库完成");
        return result;
    }

    private Long syncStoredCase(
        PreGeneratedCase tempCase,
        AiCase updatedCase,
        Long originalCaseRecordId,
        String originalSysId,
        Long originalCaseId
    ) {
        Optional<AiFunction> existing = store.findFunction(updatedCase.getSysId(), updatedCase.getFuncNo());
        if (existing.isEmpty()) {
            throw new IllegalArgumentException("请先在接口表 T_AI_FUNCTION 中补充功能号信息");
        }
        AiFunction function = existing.get();
        updatedCase.setFuncName(function.getFuncName());
        updatedCase.setFuncType(function.getFuncType());
        updatedCase.setSubFuncType(function.getSubFuncType());

        AiCase saved;
        if (originalCaseRecordId != null) {
            saved = store.updateCase(originalCaseRecordId, updatedCase);
        } else {
            Optional<AiCase> byBusinessKey = store.findCaseByBusinessKey(originalSysId, originalCaseId);
            if (byBusinessKey.isPresent()) {
                saved = store.updateCase(byBusinessKey.get().getId(), updatedCase);
            } else {
                saved = store.addCase(updatedCase);
            }
        }
        tempCase.setCaseId(saved.getCaseId());
        return saved.getId();
    }

    private void deleteStoredCase(PreGeneratedCase tempCase) {
        boolean removed = false;
        if (tempCase.getCaseRecordId() != null) {
            removed = store.deleteCaseByRecordId(tempCase.getCaseRecordId());
        }
        if (!removed) {
            store.deleteCaseByBusinessKey(tempCase.getSysId(), tempCase.getCaseId());
        }
    }

    private SaveItemResult persistCandidate(Candidate candidate) {
        SaveItemResult item = new SaveItemResult();
        item.setCandidateId(candidate.getCandidateId());
        item.setFuncNo(candidate.getFuncNo());
        item.setCaseId(candidate.getCaseId());
        item.setCaseName(candidate.getCaseName());

        if (!candidate.isValid()) {
            item.setSuccess(false);
            item.setMessage("候选数据不完整：" + valueOrDefault(candidate.getValidationMessage(), "缺少必填字段"));
            return item;
        }

        boolean functionCreated = false;
        try {
            if (store.findFunction(candidate.getSysId(), candidate.getFuncNo()).isEmpty()) {
                AiFunction function = toFunction(candidate);
                store.addFunction(function);
                functionCreated = true;
            }
        } catch (IllegalArgumentException ex) {
            if (store.findFunction(candidate.getSysId(), candidate.getFuncNo()).isEmpty()) {
                item.setSuccess(false);
                item.setMessage("接口入库失败：" + ex.getMessage());
                return item;
            }
        }

        try {
            AiCase aiCase = toCase(candidate);
            AiCase savedCase = store.addCase(aiCase);
            item.setSuccess(true);
            item.setFunctionCreated(functionCreated);
            item.setCaseRecordId(savedCase.getId());
            item.setMessage("入库成功");
            return item;
        } catch (IllegalArgumentException ex) {
            item.setSuccess(false);
            item.setFunctionCreated(functionCreated);
            item.setMessage("案例入库失败：" + ex.getMessage());
            return item;
        }
    }

    private void validateCandidate(Candidate candidate) {
        boolean valid = !isBlank(candidate.getSysId())
            && !isBlank(candidate.getSysName())
            && !isBlank(candidate.getFuncNo())
            && !isBlank(candidate.getFuncName())
            && !isBlank(candidate.getFuncType())
            && !isBlank(candidate.getModuleName())
            && candidate.getCaseId() != null
            && !isBlank(candidate.getCaseName())
            && !isBlank(candidate.getCaseKvBase());
        candidate.setValid(valid);
        candidate.setValidationMessage(valid ? "可入库" : "缺少必填字段（sysId/sysName/funcNo/funcName/funcType/caseId/caseName/caseKvBase/moduleName）");
    }

    private List<PreGeneratedCase> cachePreGeneratedCases(String generationId, List<Candidate> candidates) {
        List<PreGeneratedCase> result = new ArrayList<>();
        for (Candidate candidate : candidates) {
            result.add(cachePreGeneratedCase(generationId, candidate));
        }
        return result;
    }

    private PreGeneratedCase cachePreGeneratedCase(String generationId, Candidate candidate) {
        long tempId = tempCaseIdGenerator.incrementAndGet();
        PreGeneratedCase tempCase = new PreGeneratedCase();
        tempCase.setTempId(tempId);
        tempCase.setGenerationId(generationId);
        tempCase.setStatus(0);
        tempCase.setStatusMessage("待人工审核");
        tempCase.setCreatedAt(LocalDateTime.now());
        tempCase.setUpdatedAt(LocalDateTime.now());
        applyCandidateToTemp(tempCase, candidate);
        tempCases.put(tempId, tempCase);
        tempCaseOrder.add(0, tempId);
        return tempCase;
    }

    private List<PreGeneratedCase> filterTempCasesByIds(List<Long> tempIds, boolean onlyPending) {
        List<PreGeneratedCase> all = tempCaseOrder.stream()
            .map(tempCases::get)
            .filter(item -> item != null)
            .toList();
        if (tempIds == null || tempIds.isEmpty()) {
            if (!onlyPending) {
                return all;
            }
            return all.stream().filter(item -> item.getStatus() == 0).toList();
        }
        Set<Long> selected = new LinkedHashSet<>();
        for (Long tempId : tempIds) {
            if (tempId != null) {
                selected.add(tempId);
            }
        }
        return all.stream()
            .filter(item -> selected.contains(item.getTempId()))
            .filter(item -> !onlyPending || item.getStatus() == 0)
            .toList();
    }

    private Candidate toCandidate(PreGeneratedCase tempCase) {
        Candidate candidate = new Candidate();
        candidate.setCandidateId(tempCase.getCandidateId());
        candidate.setSource(tempCase.getSource());
        candidate.setValid(tempCase.isValid());
        candidate.setValidationMessage(tempCase.getValidationMessage());
        candidate.setSysId(tempCase.getSysId());
        candidate.setSysName(tempCase.getSysName());
        candidate.setFuncNo(tempCase.getFuncNo());
        candidate.setFuncName(tempCase.getFuncName());
        candidate.setFuncType(tempCase.getFuncType());
        candidate.setSubFuncType(tempCase.getSubFuncType());
        candidate.setFuncParamMatch(tempCase.getFuncParamMatch());
        candidate.setFuncHttpUrl(tempCase.getFuncHttpUrl());
        candidate.setFuncRequestMethod(tempCase.getFuncRequestMethod());
        candidate.setFuncRemark(tempCase.getFuncRemark());
        candidate.setCaseId(tempCase.getCaseId());
        candidate.setCaseName(tempCase.getCaseName());
        candidate.setCaseType(tempCase.getCaseType());
        candidate.setRunFlag(tempCase.getRunFlag());
        candidate.setCaseKvBase(tempCase.getCaseKvBase());
        candidate.setCaseKvDynamic(tempCase.getCaseKvDynamic());
        candidate.setCaseCheckFunction(tempCase.getCaseCheckFunction());
        candidate.setModuleName(tempCase.getModuleName());
        candidate.setCaseRemark(tempCase.getCaseRemark());
        candidate.setBusinessGoal(tempCase.getBusinessGoal());
        candidate.setScenario(tempCase.getScenario());
        return candidate;
    }

    private void applyCandidateToTemp(PreGeneratedCase tempCase, Candidate candidate) {
        tempCase.setCandidateId(candidate.getCandidateId());
        tempCase.setSource(candidate.getSource());
        tempCase.setValid(candidate.isValid());
        tempCase.setValidationMessage(candidate.getValidationMessage());
        tempCase.setSysId(candidate.getSysId());
        tempCase.setSysName(candidate.getSysName());
        tempCase.setFuncNo(candidate.getFuncNo());
        tempCase.setFuncName(candidate.getFuncName());
        tempCase.setFuncType(candidate.getFuncType());
        tempCase.setSubFuncType(candidate.getSubFuncType());
        tempCase.setFuncParamMatch(candidate.getFuncParamMatch());
        tempCase.setFuncHttpUrl(candidate.getFuncHttpUrl());
        tempCase.setFuncRequestMethod(candidate.getFuncRequestMethod());
        tempCase.setFuncRemark(candidate.getFuncRemark());
        tempCase.setCaseId(candidate.getCaseId());
        tempCase.setCaseName(candidate.getCaseName());
        tempCase.setCaseType(candidate.getCaseType());
        tempCase.setRunFlag(candidate.getRunFlag());
        tempCase.setCaseKvBase(candidate.getCaseKvBase());
        tempCase.setCaseKvDynamic(candidate.getCaseKvDynamic());
        tempCase.setCaseCheckFunction(candidate.getCaseCheckFunction());
        tempCase.setModuleName(candidate.getModuleName());
        tempCase.setCaseRemark(candidate.getCaseRemark());
        tempCase.setBusinessGoal(candidate.getBusinessGoal());
        tempCase.setScenario(candidate.getScenario());
    }

    private void patchText(String value, java.util.function.Consumer<String> consumer) {
        if (value != null) {
            consumer.accept(value);
        }
    }

    private Candidate buildSeedCandidate() {
        Candidate seed = new Candidate();
        List<AiCase> allCases = store.listCases();
        if (allCases.isEmpty()) {
            seed.setSysId("cjeh2");
            seed.setSysName("长江e号2");
            seed.setFuncNo("500.6");
            seed.setFuncName("委托确认");
            seed.setFuncType("yn");
            seed.setSubFuncType("trade");
            seed.setFuncRequestMethod("POST");
            seed.setModuleName("普通买入");
            seed.setCaseId(nextCaseId());
            seed.setCaseName("AI生成示例案例");
            seed.setCaseKvBase(buildCaseKvBase(seed.getFuncNo(), seed.getFuncName(), seed.getFuncRequestMethod(), "", "校验接口功能返回结果", seed.getModuleName(), "标准交易场景"));
            seed.setCaseKvDynamic(buildCaseKvDynamic(seed.getSysName(), seed.getFuncNo()));
            seed.setCaseCheckFunction("517184");
            seed.setCaseType("正例");
            seed.setRunFlag("1");
            seed.setValid(true);
            return seed;
        }

        AiCase sampleCase = allCases.get(0);
        Optional<AiFunction> sampleFunction = store.findFunction(sampleCase.getSysId(), sampleCase.getFuncNo());
        seed.setSysId(sampleCase.getSysId());
        seed.setSysName(sampleCase.getSysName());
        seed.setFuncNo(sampleCase.getFuncNo());
        seed.setFuncName(sampleCase.getFuncName());
        seed.setFuncType(sampleCase.getFuncType());
        seed.setSubFuncType(sampleCase.getSubFuncType());
        seed.setFuncRequestMethod(sampleFunction.map(AiFunction::getFuncRequestMethod).orElse("POST"));
        seed.setFuncHttpUrl(sampleFunction.map(AiFunction::getFuncHttpUrl).orElse(""));
        seed.setModuleName(sampleCase.getModuleName());
        seed.setCaseId(sampleCase.getCaseId());
        seed.setCaseName(sampleCase.getCaseName());
        seed.setCaseKvBase(sampleCase.getCaseKvBase());
        seed.setCaseKvDynamic(sampleCase.getCaseKvDynamic());
        seed.setCaseCheckFunction(sampleCase.getCaseCheckFunction());
        seed.setCaseType(valueOrDefault(sampleCase.getCaseType(), "正例"));
        seed.setRunFlag(valueOrDefault(sampleCase.getRunFlag(), "1"));
        seed.setValid(true);
        return seed;
    }

    private String buildPrompt(Candidate seed, List<Candidate> parsedCandidates, String textInput) {
        String seedJson = toJson(seed);
        String inputJson = toJson(parsedCandidates.stream().limit(8).toList());
        String text = valueOrDefault(textInput, "");
        return """
            你是接口自动化测试专家。请参考一条可成功执行的案例，基于输入数据生成可执行测试案例。
            目标：输出可直接用于“新增接口(T_AI_FUNCTION)+新增案例(T_AI_CASE)”入库的数据。
            输出必须是JSON数组，数组元素字段如下：
            sysId,sysName,funcNo,funcName,funcType,subFuncType,funcParamMatch,funcHttpUrl,funcRequestMethod,funcRemark,
            caseId,caseName,caseType,runFlag,caseKvBase,caseKvDynamic,caseCheckFunction,moduleName,caseRemark,businessGoal,scenario

            参考成功案例：
            %s

            输入解析后的候选数据：
            %s

            用户补充文本：
            %s
            """.formatted(seedJson, inputJson, text);
    }

    private List<Candidate> generateAiCandidates(String prompt, List<Candidate> parsedCandidates, Candidate seed) {
        if (!llmClient.isConfigured()) {
            return List.of();
        }
        String response;
        try {
            response = llmClient.chat(prompt);
        } catch (Exception ignored) {
            return List.of();
        }

        List<Map<String, Object>> rows = parseJsonRows(response);
        if (rows.isEmpty()) {
            return List.of();
        }

        List<Candidate> candidates = new ArrayList<>();
        Candidate template = parsedCandidates.stream().filter(Candidate::isValid).findFirst().orElse(seed);
        for (int i = 0; i < rows.size(); i++) {
            Candidate generated = buildCandidate(rows.get(i), i, "AI_EXPLORED", template);
            if (isBlank(generated.getFuncNo())) {
                generated.setValid(false);
                generated.setValidationMessage("funcNo为空");
            }
            candidates.add(generated);
        }
        return candidates;
    }

    private List<Candidate> mergeCandidates(List<Candidate> parsed, List<Candidate> aiGenerated) {
        Map<String, Candidate> merged = new LinkedHashMap<>();
        for (Candidate candidate : parsed) {
            merged.put(candidateKey(candidate), candidate);
        }
        for (Candidate candidate : aiGenerated) {
            merged.putIfAbsent(candidateKey(candidate), candidate);
        }
        return new ArrayList<>(merged.values());
    }

    private String candidateKey(Candidate candidate) {
        String caseId = candidate.getCaseId() == null ? candidate.getCandidateId() : String.valueOf(candidate.getCaseId());
        return valueOrDefault(candidate.getSysId(), "-") + "|" + valueOrDefault(candidate.getFuncNo(), "-") + "|" + caseId;
    }

    private Candidate buildCandidate(Map<String, Object> rawRow, int index, String source, Candidate defaults) {
        Map<String, String> row = normalizeRow(rawRow);
        Candidate candidate = new Candidate();
        candidate.setCandidateId("cand_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12));
        candidate.setSource(source);

        candidate.setSysId(pick(row, defaults.getSysId(), "sysid", "系统id", "系统标识", "isysid"));
        candidate.setSysName(pick(row, defaults.getSysName(), "sysname", "系统名称", "系统名"));

        candidate.setFuncNo(pick(row, valueOrDefault(defaults.getFuncNo(), ""), "funcno", "功能号", "接口号", "ifuncno"));
        candidate.setFuncName(pick(row, "AI生成接口_" + safeLabel(candidate.getFuncNo(), index + 1), "funcname", "功能名称", "接口名称"));
        candidate.setFuncType(pick(row, defaults.getFuncType(), "functype", "功能类型", "接口类型"));
        candidate.setSubFuncType(pick(row, valueOrDefault(defaults.getSubFuncType(), "trade"), "subfunctype", "子功能类型", "子类型"));
        candidate.setFuncParamMatch(pick(row, "", "funcparammatch", "参数映射", "参数匹配"));
        candidate.setFuncHttpUrl(pick(row, defaults.getFuncHttpUrl(), "funchttpurl", "接口地址", "httpurl", "url"));
        candidate.setFuncRequestMethod(pick(row, valueOrDefault(defaults.getFuncRequestMethod(), "POST"), "funcrequestmethod", "请求方式", "method"));
        candidate.setFuncRemark(pick(row, "", "funcremark", "接口备注"));

        candidate.setModuleName(pick(row, valueOrDefault(defaults.getModuleName(), "AI生成模块"), "modulename", "模块名称", "模块"));
        candidate.setCaseId(pickLong(row, nextCaseId(), "caseid", "案例id", "案例编号"));
        candidate.setCaseName(pick(row, "AI生成案例_" + safeLabel(candidate.getFuncNo(), index + 1), "casename", "案例名称"));
        candidate.setCaseType(pick(row, "正例", "casetype", "案例类型"));
        candidate.setRunFlag(pick(row, "1", "runflag", "是否启用"));
        candidate.setCaseCheckFunction(pick(row, "517184", "casecheckfunction", "检查功能号"));
        candidate.setCaseRemark(pick(row, "", "caseremark", "案例备注"));
        candidate.setScenario(pick(row, "标准交易场景", "scenario", "场景"));
        candidate.setBusinessGoal(pick(row, "校验接口功能返回结果", "businessgoal", "业务目标", "目标"));

        String caseKvBase = pick(row, "", "casekvbase");
        if (isBlank(caseKvBase)) {
            caseKvBase = buildCaseKvBase(
                candidate.getFuncNo(),
                candidate.getFuncName(),
                candidate.getFuncRequestMethod(),
                candidate.getFuncHttpUrl(),
                candidate.getBusinessGoal(),
                candidate.getModuleName(),
                candidate.getScenario()
            );
        }
        candidate.setCaseKvBase(caseKvBase);

        String caseKvDynamic = pick(row, "", "casekvdynamic");
        if (isBlank(caseKvDynamic)) {
            caseKvDynamic = buildCaseKvDynamic(candidate.getSysName(), candidate.getFuncNo());
        }
        candidate.setCaseKvDynamic(caseKvDynamic);

        boolean valid = !isBlank(candidate.getSysId())
            && !isBlank(candidate.getSysName())
            && !isBlank(candidate.getFuncNo())
            && !isBlank(candidate.getFuncName())
            && !isBlank(candidate.getFuncType())
            && !isBlank(candidate.getModuleName())
            && candidate.getCaseId() != null
            && !isBlank(candidate.getCaseName())
            && !isBlank(candidate.getCaseKvBase());
        candidate.setValid(valid);
        candidate.setValidationMessage(valid ? "可入库" : "缺少必填字段（sysId/sysName/funcNo/funcName/funcType/caseId/caseName/caseKvBase/moduleName）");
        return candidate;
    }

    private AiFunction toFunction(Candidate candidate) {
        AiFunction function = new AiFunction();
        function.setSysId(candidate.getSysId());
        function.setSysName(candidate.getSysName());
        function.setFuncNo(candidate.getFuncNo());
        function.setFuncName(candidate.getFuncName());
        function.setFuncType(candidate.getFuncType());
        function.setSubFuncType(valueOrDefault(candidate.getSubFuncType(), "trade"));
        function.setFuncParamMatch(candidate.getFuncParamMatch());
        function.setFuncHttpUrl(candidate.getFuncHttpUrl());
        function.setFuncRequestMethod(valueOrDefault(candidate.getFuncRequestMethod(), "POST"));
        function.setFuncRemark(candidate.getFuncRemark());
        return function;
    }

    private AiCase toCase(Candidate candidate) {
        AiCase aiCase = new AiCase();
        aiCase.setSysId(candidate.getSysId());
        aiCase.setSysName(candidate.getSysName());
        aiCase.setCaseId(candidate.getCaseId());
        aiCase.setCaseName(candidate.getCaseName());
        aiCase.setCaseType(valueOrDefault(candidate.getCaseType(), "正例"));
        aiCase.setRunFlag(valueOrDefault(candidate.getRunFlag(), "1"));
        aiCase.setCaseKvBase(candidate.getCaseKvBase());
        aiCase.setCaseKvDynamic(candidate.getCaseKvDynamic());
        aiCase.setCaseCheckFunction(valueOrDefault(candidate.getCaseCheckFunction(), "517184"));
        String caseRemark = valueOrDefault(candidate.getCaseRemark(), "");
        if (caseRemark.isBlank()) {
            caseRemark = AI_INTERFACE_CASE_TAG;
        } else if (!caseRemark.contains(AI_INTERFACE_CASE_TAG)) {
            caseRemark = AI_INTERFACE_CASE_TAG + " " + caseRemark;
        }
        aiCase.setCaseRemark(caseRemark);
        aiCase.setFuncNo(candidate.getFuncNo());
        aiCase.setFuncName(candidate.getFuncName());
        aiCase.setFuncType(candidate.getFuncType());
        aiCase.setSubFuncType(valueOrDefault(candidate.getSubFuncType(), "trade"));
        aiCase.setModuleName(candidate.getModuleName());
        return aiCase;
    }

    private String buildCaseKvBase(String funcNo,
                                   String funcName,
                                   String requestMethod,
                                   String httpUrl,
                                   String businessGoal,
                                   String moduleName,
                                   String scenario) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("env", "50000");
        payload.put("funcno", valueOrDefault(funcNo, ""));
        payload.put("funcName", valueOrDefault(funcName, ""));
        payload.put("requestMethod", valueOrDefault(requestMethod, "POST"));
        payload.put("httpUrl", valueOrDefault(httpUrl, ""));
        payload.put("businessGoal", valueOrDefault(businessGoal, "校验接口功能返回结果"));
        payload.put("param", Map.of(
            "module", valueOrDefault(moduleName, "AI生成模块"),
            "scenario", valueOrDefault(scenario, "标准交易场景")
        ));
        return toJson(payload);
    }

    private String buildCaseKvDynamic(String sysName, String funcNo) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("i_resource", "0");
        payload.put("i_sysid", valueOrDefault(sysName, "长江e号2"));
        payload.put("i_sysver", "latest");
        payload.put("i_request_data", "aitest_devops_batch");
        payload.put("i_func_no", valueOrDefault(funcNo, ""));
        return toJson(payload);
    }

    private List<Map<String, Object>> parseTextInput(String textInput) {
        List<Map<String, Object>> jsonRows = parseJsonRows(textInput);
        if (!jsonRows.isEmpty()) {
            return jsonRows;
        }
        List<Map<String, Object>> csvRows = parseCsvRows(textInput);
        if (!csvRows.isEmpty()) {
            return csvRows;
        }
        return parseKeyValueBlocks(textInput);
    }

    private List<Map<String, Object>> parseJsonRows(String content) {
        if (isBlank(content)) {
            return List.of();
        }
        try {
            Object parsed = objectMapper.readValue(content, new TypeReference<Object>() {
            });
            if (parsed instanceof List<?> list) {
                List<Map<String, Object>> rows = new ArrayList<>();
                for (Object item : list) {
                    if (item instanceof Map<?, ?> map) {
                        rows.add(castMap(map));
                    }
                }
                return rows;
            }
            if (parsed instanceof Map<?, ?> map) {
                return List.of(castMap(map));
            }
            return List.of();
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private List<Map<String, Object>> parseCsvRows(String content) {
        if (isBlank(content)) {
            return List.of();
        }
        String[] rawLines = content.split("\\r?\\n");
        List<String> lines = new ArrayList<>();
        for (String line : rawLines) {
            if (!isBlank(line)) {
                lines.add(line.trim());
            }
        }
        if (lines.size() < 2) {
            return List.of();
        }
        String delimiter = lines.get(0).contains("\t") ? "\t" : (lines.get(0).contains(",") ? "," : null);
        if (delimiter == null) {
            return List.of();
        }
        String[] headers = lines.get(0).split(delimiter, -1);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 1; i < lines.size(); i++) {
            String[] values = lines.get(i).split(delimiter, -1);
            Map<String, Object> row = new LinkedHashMap<>();
            for (int j = 0; j < headers.length; j++) {
                String key = headers[j].trim();
                if (key.isEmpty()) {
                    continue;
                }
                row.put(key, j < values.length ? values[j].trim() : "");
            }
            if (!row.isEmpty()) {
                rows.add(row);
            }
        }
        return rows;
    }

    private List<Map<String, Object>> parseKeyValueBlocks(String content) {
        if (isBlank(content)) {
            return List.of();
        }
        String[] blocks = content.trim().split("\\n\\s*\\n");
        List<Map<String, Object>> rows = new ArrayList<>();
        for (String block : blocks) {
            Map<String, Object> row = new LinkedHashMap<>();
            String[] lines = block.split("\\r?\\n");
            for (String line : lines) {
                String text = line.trim();
                if (text.isEmpty()) {
                    continue;
                }
                int index = firstSeparatorIndex(text);
                if (index <= 0 || index >= text.length() - 1) {
                    continue;
                }
                String key = text.substring(0, index).trim();
                String value = text.substring(index + 1).trim();
                if (!key.isEmpty()) {
                    row.put(key, value);
                }
            }
            if (!row.isEmpty()) {
                rows.add(row);
            }
        }
        return rows;
    }

    private int firstSeparatorIndex(String text) {
        int colon = text.indexOf(':');
        int chineseColon = text.indexOf('：');
        int equal = text.indexOf('=');
        int index = -1;
        for (int item : List.of(colon, chineseColon, equal)) {
            if (item > 0 && (index == -1 || item < index)) {
                index = item;
            }
        }
        return index;
    }

    private Map<String, Object> castMap(Map<?, ?> input) {
        Map<String, Object> map = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : input.entrySet()) {
            map.put(String.valueOf(entry.getKey()), entry.getValue());
        }
        return map;
    }

    private Map<String, String> normalizeRow(Map<String, Object> row) {
        Map<String, String> normalized = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : row.entrySet()) {
            String key = normalizeKey(entry.getKey());
            String value = entry.getValue() == null ? "" : String.valueOf(entry.getValue()).trim();
            if (!key.isEmpty()) {
                normalized.put(key, value);
            }
        }
        return normalized;
    }

    private String pick(Map<String, String> normalizedRow, String fallback, String... aliases) {
        for (String alias : aliases) {
            String value = normalizedRow.get(normalizeKey(alias));
            if (!isBlank(value)) {
                return value;
            }
        }
        return fallback;
    }

    private Long pickLong(Map<String, String> normalizedRow, Long fallback, String... aliases) {
        String text = pick(normalizedRow, "", aliases);
        if (isBlank(text)) {
            return fallback;
        }
        try {
            return Long.parseLong(text.replaceAll("[^0-9-]", ""));
        } catch (Exception ignored) {
            return fallback;
        }
    }

    private String normalizeKey(String key) {
        if (key == null) {
            return "";
        }
        return key
            .toLowerCase(Locale.ROOT)
            .replace("_", "")
            .replace("-", "")
            .replace(".", "")
            .replace(" ", "");
    }

    private long nextCaseId() {
        String base = CASE_ID_FORMATTER.format(LocalDateTime.now());
        int suffix = ThreadLocalRandom.current().nextInt(100, 1000);
        return Long.parseLong(base + suffix);
    }

    private String safeLabel(String value, int index) {
        if (!isBlank(value)) {
            return value;
        }
        return "NO_" + index;
    }

    private String toJson(Object payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (Exception ignored) {
            return "{}";
        }
    }

    private String valueOrDefault(String value, String fallback) {
        return isBlank(value) ? fallback : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record GenerateRequest(String textInput, List<Map<String, Object>> importRows) {
    }

    public record SaveRequest(String generationId, List<String> candidateIds, Boolean autoExecute) {
    }

    public record TempStoreRequest(String generationId, List<Long> tempIds, Boolean autoExecute) {
    }

    public record TempCaseUpdateRequest(
        Long tempId,
        String sysId,
        String sysName,
        String funcNo,
        String funcName,
        String funcType,
        String subFuncType,
        String funcParamMatch,
        String funcHttpUrl,
        String funcRequestMethod,
        String funcRemark,
        Long caseId,
        String caseName,
        String caseType,
        String runFlag,
        String caseKvBase,
        String caseKvDynamic,
        String caseCheckFunction,
        String moduleName,
        String caseRemark,
        String businessGoal,
        String scenario
    ) {
    }

    private record GenerationSession(
        String generationId,
        List<Candidate> candidates,
        String prompt
    ) {
    }

    public record GenerateResult(
        String generationId,
        List<Candidate> candidates,
        String prompt,
        boolean remoteLlmConfigured,
        boolean remoteLlmUsed,
        String aiEngine,
        Candidate seedCase,
        int inputRowCount,
        List<PreGeneratedCase> tempCases
    ) {
    }

    public static class BatchActionResult {
        private String action;
        private int affectedCount;
        private String message;

        public String getAction() {
            return action;
        }

        public void setAction(String action) {
            this.action = action;
        }

        public int getAffectedCount() {
            return affectedCount;
        }

        public void setAffectedCount(int affectedCount) {
            this.affectedCount = affectedCount;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class SaveResult {
        private String generationId;
        private int selectedCount;
        private int functionCreatedCount;
        private int caseCreatedCount;
        private String executionHisId;
        private VersionExecution execution;
        private List<SaveItemResult> items = List.of();

        public String getGenerationId() {
            return generationId;
        }

        public void setGenerationId(String generationId) {
            this.generationId = generationId;
        }

        public int getSelectedCount() {
            return selectedCount;
        }

        public void setSelectedCount(int selectedCount) {
            this.selectedCount = selectedCount;
        }

        public int getFunctionCreatedCount() {
            return functionCreatedCount;
        }

        public void setFunctionCreatedCount(int functionCreatedCount) {
            this.functionCreatedCount = functionCreatedCount;
        }

        public int getCaseCreatedCount() {
            return caseCreatedCount;
        }

        public void setCaseCreatedCount(int caseCreatedCount) {
            this.caseCreatedCount = caseCreatedCount;
        }

        public String getExecutionHisId() {
            return executionHisId;
        }

        public void setExecutionHisId(String executionHisId) {
            this.executionHisId = executionHisId;
        }

        public VersionExecution getExecution() {
            return execution;
        }

        public void setExecution(VersionExecution execution) {
            this.execution = execution;
        }

        public List<SaveItemResult> getItems() {
            return items;
        }

        public void setItems(List<SaveItemResult> items) {
            this.items = items;
        }
    }

    public static class SaveItemResult {
        private Long tempId;
        private String candidateId;
        private String funcNo;
        private Long caseId;
        private String caseName;
        private boolean success;
        private boolean functionCreated;
        private Long caseRecordId;
        private String message;

        public Long getTempId() {
            return tempId;
        }

        public void setTempId(Long tempId) {
            this.tempId = tempId;
        }

        public String getCandidateId() {
            return candidateId;
        }

        public void setCandidateId(String candidateId) {
            this.candidateId = candidateId;
        }

        public String getFuncNo() {
            return funcNo;
        }

        public void setFuncNo(String funcNo) {
            this.funcNo = funcNo;
        }

        public Long getCaseId() {
            return caseId;
        }

        public void setCaseId(Long caseId) {
            this.caseId = caseId;
        }

        public String getCaseName() {
            return caseName;
        }

        public void setCaseName(String caseName) {
            this.caseName = caseName;
        }

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public boolean isFunctionCreated() {
            return functionCreated;
        }

        public void setFunctionCreated(boolean functionCreated) {
            this.functionCreated = functionCreated;
        }

        public Long getCaseRecordId() {
            return caseRecordId;
        }

        public void setCaseRecordId(Long caseRecordId) {
            this.caseRecordId = caseRecordId;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    public static class PreGeneratedCase {
        private Long tempId;
        private String generationId;
        private Integer status;
        private String statusMessage;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        private String candidateId;
        private String source;
        private boolean valid;
        private String validationMessage;

        private String sysId;
        private String sysName;
        private String funcNo;
        private String funcName;
        private String funcType;
        private String subFuncType;
        private String funcParamMatch;
        private String funcHttpUrl;
        private String funcRequestMethod;
        private String funcRemark;
        private Long caseId;
        private String caseName;
        private String caseType;
        private String runFlag;
        private String caseKvBase;
        private String caseKvDynamic;
        private String caseCheckFunction;
        private String moduleName;
        private String caseRemark;
        private String businessGoal;
        private String scenario;
        private Long caseRecordId;

        public Long getTempId() {
            return tempId;
        }

        public void setTempId(Long tempId) {
            this.tempId = tempId;
        }

        public String getGenerationId() {
            return generationId;
        }

        public void setGenerationId(String generationId) {
            this.generationId = generationId;
        }

        public Integer getStatus() {
            return status;
        }

        public void setStatus(Integer status) {
            this.status = status;
        }

        public String getStatusMessage() {
            return statusMessage;
        }

        public void setStatusMessage(String statusMessage) {
            this.statusMessage = statusMessage;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }

        public LocalDateTime getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
        }

        public String getCandidateId() {
            return candidateId;
        }

        public void setCandidateId(String candidateId) {
            this.candidateId = candidateId;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public String getValidationMessage() {
            return validationMessage;
        }

        public void setValidationMessage(String validationMessage) {
            this.validationMessage = validationMessage;
        }

        public String getSysId() {
            return sysId;
        }

        public void setSysId(String sysId) {
            this.sysId = sysId;
        }

        public String getSysName() {
            return sysName;
        }

        public void setSysName(String sysName) {
            this.sysName = sysName;
        }

        public String getFuncNo() {
            return funcNo;
        }

        public void setFuncNo(String funcNo) {
            this.funcNo = funcNo;
        }

        public String getFuncName() {
            return funcName;
        }

        public void setFuncName(String funcName) {
            this.funcName = funcName;
        }

        public String getFuncType() {
            return funcType;
        }

        public void setFuncType(String funcType) {
            this.funcType = funcType;
        }

        public String getSubFuncType() {
            return subFuncType;
        }

        public void setSubFuncType(String subFuncType) {
            this.subFuncType = subFuncType;
        }

        public String getFuncParamMatch() {
            return funcParamMatch;
        }

        public void setFuncParamMatch(String funcParamMatch) {
            this.funcParamMatch = funcParamMatch;
        }

        public String getFuncHttpUrl() {
            return funcHttpUrl;
        }

        public void setFuncHttpUrl(String funcHttpUrl) {
            this.funcHttpUrl = funcHttpUrl;
        }

        public String getFuncRequestMethod() {
            return funcRequestMethod;
        }

        public void setFuncRequestMethod(String funcRequestMethod) {
            this.funcRequestMethod = funcRequestMethod;
        }

        public String getFuncRemark() {
            return funcRemark;
        }

        public void setFuncRemark(String funcRemark) {
            this.funcRemark = funcRemark;
        }

        public Long getCaseId() {
            return caseId;
        }

        public void setCaseId(Long caseId) {
            this.caseId = caseId;
        }

        public String getCaseName() {
            return caseName;
        }

        public void setCaseName(String caseName) {
            this.caseName = caseName;
        }

        public String getCaseType() {
            return caseType;
        }

        public void setCaseType(String caseType) {
            this.caseType = caseType;
        }

        public String getRunFlag() {
            return runFlag;
        }

        public void setRunFlag(String runFlag) {
            this.runFlag = runFlag;
        }

        public String getCaseKvBase() {
            return caseKvBase;
        }

        public void setCaseKvBase(String caseKvBase) {
            this.caseKvBase = caseKvBase;
        }

        public String getCaseKvDynamic() {
            return caseKvDynamic;
        }

        public void setCaseKvDynamic(String caseKvDynamic) {
            this.caseKvDynamic = caseKvDynamic;
        }

        public String getCaseCheckFunction() {
            return caseCheckFunction;
        }

        public void setCaseCheckFunction(String caseCheckFunction) {
            this.caseCheckFunction = caseCheckFunction;
        }

        public String getModuleName() {
            return moduleName;
        }

        public void setModuleName(String moduleName) {
            this.moduleName = moduleName;
        }

        public String getCaseRemark() {
            return caseRemark;
        }

        public void setCaseRemark(String caseRemark) {
            this.caseRemark = caseRemark;
        }

        public String getBusinessGoal() {
            return businessGoal;
        }

        public void setBusinessGoal(String businessGoal) {
            this.businessGoal = businessGoal;
        }

        public String getScenario() {
            return scenario;
        }

        public void setScenario(String scenario) {
            this.scenario = scenario;
        }

        public Long getCaseRecordId() {
            return caseRecordId;
        }

        public void setCaseRecordId(Long caseRecordId) {
            this.caseRecordId = caseRecordId;
        }
    }

    public static class Candidate {
        private String candidateId;
        private String source;
        private boolean valid;
        private String validationMessage;

        private String sysId;
        private String sysName;

        private String funcNo;
        private String funcName;
        private String funcType;
        private String subFuncType;
        private String funcParamMatch;
        private String funcHttpUrl;
        private String funcRequestMethod;
        private String funcRemark;

        private Long caseId;
        private String caseName;
        private String caseType;
        private String runFlag;
        private String caseKvBase;
        private String caseKvDynamic;
        private String caseCheckFunction;
        private String moduleName;
        private String caseRemark;
        private String businessGoal;
        private String scenario;

        public String getCandidateId() {
            return candidateId;
        }

        public void setCandidateId(String candidateId) {
            this.candidateId = candidateId;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public String getValidationMessage() {
            return validationMessage;
        }

        public void setValidationMessage(String validationMessage) {
            this.validationMessage = validationMessage;
        }

        public String getSysId() {
            return sysId;
        }

        public void setSysId(String sysId) {
            this.sysId = sysId;
        }

        public String getSysName() {
            return sysName;
        }

        public void setSysName(String sysName) {
            this.sysName = sysName;
        }

        public String getFuncNo() {
            return funcNo;
        }

        public void setFuncNo(String funcNo) {
            this.funcNo = funcNo;
        }

        public String getFuncName() {
            return funcName;
        }

        public void setFuncName(String funcName) {
            this.funcName = funcName;
        }

        public String getFuncType() {
            return funcType;
        }

        public void setFuncType(String funcType) {
            this.funcType = funcType;
        }

        public String getSubFuncType() {
            return subFuncType;
        }

        public void setSubFuncType(String subFuncType) {
            this.subFuncType = subFuncType;
        }

        public String getFuncParamMatch() {
            return funcParamMatch;
        }

        public void setFuncParamMatch(String funcParamMatch) {
            this.funcParamMatch = funcParamMatch;
        }

        public String getFuncHttpUrl() {
            return funcHttpUrl;
        }

        public void setFuncHttpUrl(String funcHttpUrl) {
            this.funcHttpUrl = funcHttpUrl;
        }

        public String getFuncRequestMethod() {
            return funcRequestMethod;
        }

        public void setFuncRequestMethod(String funcRequestMethod) {
            this.funcRequestMethod = funcRequestMethod;
        }

        public String getFuncRemark() {
            return funcRemark;
        }

        public void setFuncRemark(String funcRemark) {
            this.funcRemark = funcRemark;
        }

        public Long getCaseId() {
            return caseId;
        }

        public void setCaseId(Long caseId) {
            this.caseId = caseId;
        }

        public String getCaseName() {
            return caseName;
        }

        public void setCaseName(String caseName) {
            this.caseName = caseName;
        }

        public String getCaseType() {
            return caseType;
        }

        public void setCaseType(String caseType) {
            this.caseType = caseType;
        }

        public String getRunFlag() {
            return runFlag;
        }

        public void setRunFlag(String runFlag) {
            this.runFlag = runFlag;
        }

        public String getCaseKvBase() {
            return caseKvBase;
        }

        public void setCaseKvBase(String caseKvBase) {
            this.caseKvBase = caseKvBase;
        }

        public String getCaseKvDynamic() {
            return caseKvDynamic;
        }

        public void setCaseKvDynamic(String caseKvDynamic) {
            this.caseKvDynamic = caseKvDynamic;
        }

        public String getCaseCheckFunction() {
            return caseCheckFunction;
        }

        public void setCaseCheckFunction(String caseCheckFunction) {
            this.caseCheckFunction = caseCheckFunction;
        }

        public String getModuleName() {
            return moduleName;
        }

        public void setModuleName(String moduleName) {
            this.moduleName = moduleName;
        }

        public String getCaseRemark() {
            return caseRemark;
        }

        public void setCaseRemark(String caseRemark) {
            this.caseRemark = caseRemark;
        }

        public String getBusinessGoal() {
            return businessGoal;
        }

        public void setBusinessGoal(String businessGoal) {
            this.businessGoal = businessGoal;
        }

        public String getScenario() {
            return scenario;
        }

        public void setScenario(String scenario) {
            this.scenario = scenario;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o) {
                return true;
            }
            if (!(o instanceof Candidate candidate)) {
                return false;
            }
            return Objects.equals(candidateId, candidate.candidateId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(candidateId);
        }
    }
}
