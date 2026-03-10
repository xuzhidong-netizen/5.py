package com.xuzhidong.aitest.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("integration")
@SpringBootTest
@AutoConfigureMockMvc
class ManualFlowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAddFunctionAndCaseByManualFlow() throws Exception {
        String functionPayload = """
            {
              "sysId": "cjeh2",
              "sysName": "长江e号2",
              "funcNo": "700.888",
              "funcName": "集成测试接口",
              "funcType": "yn",
              "subFuncType": "trade",
              "funcRequestMethod": "POST"
            }
            """;

        mockMvc.perform(post("/api/functions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(functionPayload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.funcNo").value("700.888"));

        String casePayload = """
            {
              "sysId": "cjeh2",
              "sysName": "长江e号2",
              "caseId": 700888001,
              "caseName": "集成测试案例",
              "caseKvBase": "{\\"env\\":\\"50000\\"}",
              "funcNo": "700.888",
              "moduleName": "集成模块"
            }
            """;

        mockMvc.perform(post("/api/cases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(casePayload))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.funcNo").value("700.888"))
            .andExpect(jsonPath("$.data.funcType").value("yn"));

        mockMvc.perform(post("/prod-api/api/v1/forward/517508"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void shouldDispatchThrough517268() throws Exception {
        MvcResult authResult = mockMvc.perform(post("/prod-api/api/v1/forward/517268")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"i_request_data":"authorization"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode authJson = objectMapper.readTree(authResult.getResponse().getContentAsString());
        String token = authJson.path("data").path("authorization").asText();
        assertTrue(token.startsWith("Bearer "));

        MvcResult batchResult = mockMvc.perform(post("/prod-api/api/v1/forward/517268")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "i_request_data":"aitest_devops_batch",
                      "i_resource":"0",
                      "i_sysid":"长江e号",
                      "i_sysver":"12.0.0"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode batchJson = objectMapper.readTree(batchResult.getResponse().getContentAsString());
        String hisId = batchJson.path("data").path("hisId").asText();
        assertTrue(!hisId.isBlank());

        mockMvc.perform(post("/prod-api/api/v1/forward/517268")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"i_request_data":"aitest_devops_hisid:%s"}
                    """.formatted(hisId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));

        mockMvc.perform(post("/prod-api/api/v1/forward/517268")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"i_request_data":"aitest_devops_detail:%s"}
                    """.formatted(hisId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void shouldGenerateAiCaseOnHomepageFlow() throws Exception {
        mockMvc.perform(post("/api/ai/cases/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "sysId": "cjeh2",
                      "sysName": "长江e号2",
                      "funcNo": "500.6",
                      "moduleName": "普通买入",
                      "scenario": "交易买入成功",
                      "businessGoal": "验证委托确认接口返回成功",
                      "autoSave": true
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.saved").value(true))
            .andExpect(jsonPath("$.data.generatedCase.funcNo").value("500.6"))
            .andExpect(jsonPath("$.data.generatedCase.caseName").value(org.hamcrest.Matchers.containsString("AI生成_")));
    }
}
