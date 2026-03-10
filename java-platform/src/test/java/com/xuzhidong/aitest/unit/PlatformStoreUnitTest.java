package com.xuzhidong.aitest.unit;

import com.xuzhidong.aitest.model.AiCase;
import com.xuzhidong.aitest.model.AiFunction;
import com.xuzhidong.aitest.service.PlatformStore;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@Tag("unit")
class PlatformStoreUnitTest {

    private PlatformStore store;

    @BeforeEach
    void setUp() {
        store = new PlatformStore();
        store.initSeedData();
    }

    @Test
    void shouldRejectDuplicateFunction() {
        AiFunction duplicate = new AiFunction();
        duplicate.setSysId("cjeh2");
        duplicate.setSysName("长江e号2");
        duplicate.setFuncNo("500.6");
        duplicate.setFuncName("委托确认");
        duplicate.setFuncType("yn");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> store.addFunction(duplicate));
        assertEquals("接口记录已存在,请重新检查", ex.getMessage());
    }

    @Test
    void shouldRequireFunctionBeforeAddingCase() {
        AiCase testCase = new AiCase();
        testCase.setSysId("unknown");
        testCase.setSysName("未知系统");
        testCase.setCaseId(1L);
        testCase.setCaseName("未配置接口的案例");
        testCase.setCaseKvBase("{\"env\":\"50000\"}");
        testCase.setFuncNo("999.9");
        testCase.setModuleName("模块");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> store.addCase(testCase));
        assertEquals("请先在接口表 T_AI_FUNCTION 中补充功能号信息", ex.getMessage());
    }

    @Test
    void shouldFindSeedFunction() {
        assertTrue(store.findFunction("cjeh2", "500.6").isPresent());
    }
}
