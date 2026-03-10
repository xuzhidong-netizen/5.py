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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

    @Test
    void shouldGenerateAndExecuteTestCasesByApiDefinition() throws Exception {
        MvcResult generateResult = mockMvc.perform(post("/api/test/generate")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "apiName": "下单接口",
                      "apiPath": "/api/order/create",
                      "method": "POST",
                      "requestParams": [
                        {"name":"userId","type":"long","required":true,"description":"用户ID","example":"123"},
                        {"name":"price","type":"double","required":true,"description":"价格","example":"99.9"},
                        {"name":"productId","type":"string","required":true,"description":"商品ID","example":"P123"}
                      ],
                      "responseParams": [
                        {"name":"orderId","type":"string","required":true,"description":"订单ID","example":"O1001"},
                        {"name":"message","type":"string","required":true,"description":"结果消息","example":"订单成功"}
                      ]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].apiName").value("下单接口"))
            .andReturn();

        JsonNode generated = objectMapper.readTree(generateResult.getResponse().getContentAsString());
        assertTrue(generated.isArray());
        assertTrue(generated.size() >= 3);
        long caseId = generated.get(0).path("caseId").asLong();
        assertTrue(caseId > 0);

        mockMvc.perform(post("/api/test/execute")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"caseIds":[%s]}
                    """.formatted(caseId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].status").exists())
            .andExpect(jsonPath("$[0].caseId").value(caseId));
    }

    @Test
    void shouldSupportNewAiTestEndpoints() throws Exception {
        String apiDefinition = """
            {
              "apiName": "资产查询接口",
              "apiPath": "/api/asset/query",
              "method": "POST",
              "requestParams": [
                {"name":"fundAccount","type":"string","required":true,"description":"资金账号","example":"A10001"},
                {"name":"pageNo","type":"int","required":false,"description":"页码","example":"1"}
              ],
              "responseParams": [
                {"name":"total","type":"int","required":true,"description":"总数","example":"10"},
                {"name":"records","type":"array","required":true,"description":"资产列表","example":"[]"}
              ]
            }
            """;

        mockMvc.perform(post("/api/generate-docs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(apiDefinition))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.apiName").value("资产查询接口"))
            .andExpect(jsonPath("$.markdown").exists())
            .andExpect(jsonPath("$.openApi.openapi").value("3.0.3"));

        MvcResult caseResult = mockMvc.perform(post("/api/generate-cases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(apiDefinition))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].apiName").value("资产查询接口"))
            .andReturn();

        JsonNode generated = objectMapper.readTree(caseResult.getResponse().getContentAsString());
        long firstCaseId = generated.get(0).path("caseId").asLong();
        assertTrue(firstCaseId > 0);

        MvcResult executeResult = mockMvc.perform(post("/api/execute-cases")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"caseIds":[%s]}
                    """.formatted(firstCaseId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.runId").exists())
            .andExpect(jsonPath("$.results[0].caseId").value(firstCaseId))
            .andReturn();

        String runId = objectMapper.readTree(executeResult.getResponse().getContentAsString()).path("runId").asText();
        assertTrue(!runId.isBlank());

        mockMvc.perform(get("/api/results").param("runId", runId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].runId").value(runId))
            .andExpect(jsonPath("$[0].results[0].caseId").value(firstCaseId));

        mockMvc.perform(get("/api/results"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].runId").exists());
    }
}
