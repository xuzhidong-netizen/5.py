package com.autotest.platform.other.config;

import com.autotest.platform.other.log.PlatformLogService;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AiConfigService {

    private final AiConfigRepository aiConfigRepository;
    private final PlatformLogService platformLogService;

    public AiConfigService(AiConfigRepository aiConfigRepository, PlatformLogService platformLogService) {
        this.aiConfigRepository = aiConfigRepository;
        this.platformLogService = platformLogService;
    }

    @Transactional
    public List<AiConfigItemResponse> list(String owner, AiConfigType type) {
        ensureSeed(owner, type);
        return aiConfigRepository.findByOwnerAndTypeOrderByUpdatedAtDesc(owner, type).stream()
            .map(AiConfigItemResponse::fromEntity)
            .toList();
    }

    @Transactional
    public AiConfigItemResponse create(String owner, AiConfigType type, AiConfigItemRequest request) {
        AiConfigEntity entity = new AiConfigEntity();
        entity.setOwner(owner);
        entity.setType(type);
        apply(entity, request);

        AiConfigEntity saved = aiConfigRepository.save(entity);
        platformLogService.recordOperation(
            owner,
            "OTHER_AI_CONFIG",
            "CREATE_" + type.name(),
            request.toString(),
            "id=" + saved.getId(),
            "SUCCESS",
            "新增AI配置"
        );
        return AiConfigItemResponse.fromEntity(saved);
    }

    @Transactional
    public AiConfigItemResponse update(String owner, AiConfigType type, Long id, AiConfigItemRequest request) {
        AiConfigEntity entity = aiConfigRepository.findByIdAndOwnerAndType(id, owner, type)
            .orElseThrow(() -> new IllegalArgumentException("配置不存在"));

        apply(entity, request);
        AiConfigEntity saved = aiConfigRepository.save(entity);
        platformLogService.recordOperation(
            owner,
            "OTHER_AI_CONFIG",
            "UPDATE_" + type.name(),
            request.toString(),
            "id=" + saved.getId(),
            "SUCCESS",
            "更新AI配置"
        );
        return AiConfigItemResponse.fromEntity(saved);
    }

    @Transactional
    public void delete(String owner, AiConfigType type, Long id) {
        AiConfigEntity entity = aiConfigRepository.findByIdAndOwnerAndType(id, owner, type)
            .orElseThrow(() -> new IllegalArgumentException("配置不存在"));
        aiConfigRepository.delete(entity);
        platformLogService.recordOperation(
            owner,
            "OTHER_AI_CONFIG",
            "DELETE_" + type.name(),
            "id=" + id,
            null,
            "SUCCESS",
            "删除AI配置"
        );
    }

    private void apply(AiConfigEntity entity, AiConfigItemRequest request) {
        entity.setName(request.name().trim());
        entity.setConfigKey(request.configKey().trim());
        entity.setScope(request.scope() == null ? null : request.scope().trim());
        entity.setContent(request.content() == null ? "{}" : request.content().trim());
        entity.setEnabled(request.enabled() == null ? Boolean.TRUE : request.enabled());
    }

    private void ensureSeed(String owner, AiConfigType type) {
        if (aiConfigRepository.countByOwnerAndType(owner, type) > 0) {
            return;
        }

        for (AiConfigEntity item : defaultItems(owner, type)) {
            aiConfigRepository.save(item);
        }
    }

    private List<AiConfigEntity> defaultItems(String owner, AiConfigType type) {
        List<AiConfigEntity> items = new ArrayList<>();

        AiConfigEntity entity = new AiConfigEntity();
        entity.setOwner(owner);
        entity.setType(type);
        entity.setEnabled(true);

        switch (type) {
            case TEMPLATE -> {
                entity.setName("默认接口文档模板");
                entity.setConfigKey("DOC_TEMPLATE_DEFAULT");
                entity.setScope("全量接口");
                entity.setContent("{\"format\":\"markdown\",\"withExample\":true}");
            }
            case CASE_GENERATION -> {
                entity.setName("默认案例生成规则");
                entity.setConfigKey("CASE_GEN_DEFAULT");
                entity.setScope("全量接口");
                entity.setContent("{\"maxCases\":20,\"strategy\":\"normal+boundary+error\"}");
            }
            case PARAM_RULE -> {
                entity.setName("默认动态参数规则");
                entity.setConfigKey("PARAM_RULE_DEFAULT");
                entity.setScope("account,stockCode,token");
                entity.setContent("{\"account\":\"from_env\",\"token\":\"from_login_api\"}");
            }
            case EXECUTE_STRATEGY -> {
                entity.setName("默认执行策略");
                entity.setConfigKey("EXEC_STRATEGY_DEFAULT");
                entity.setScope("全量接口");
                entity.setContent("{\"mode\":\"SERIAL\",\"timeoutMs\":10000,\"retry\":1,\"mock\":false}");
            }
            case RESULT_CLEANUP -> {
                entity.setName("默认结果清理策略");
                entity.setConfigKey("RESULT_CLEANUP_DEFAULT");
                entity.setScope("执行结果");
                entity.setContent("{\"retainDays\":30,\"archiveBeforeDelete\":true}");
            }
            case MODEL_CONFIG -> {
                entity.setName("默认模型配置");
                entity.setConfigKey("MODEL_DEFAULT");
                entity.setScope("文档+案例生成");
                entity.setContent("{\"model\":\"RULE_BASED_ENGINE\",\"temperature\":0.2,\"timeoutMs\":15000}");
            }
            default -> throw new IllegalArgumentException("不支持的配置类型");
        }

        items.add(entity);
        return items;
    }
}
