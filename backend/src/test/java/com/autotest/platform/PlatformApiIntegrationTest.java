package com.autotest.platform;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PlatformApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRegisterLoginAndRunExecution() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "tester",
                      "password": "tester123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "tester",
                      "password": "tester123"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        JsonNode loginBody = objectMapper.readTree(loginResult.getResponse().getContentAsString());
        String token = loginBody.path("data").path("token").asText();
        assertThat(token).isNotBlank();

        MvcResult caseResult = mockMvc.perform(post("/api/v1/cases")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "caseName": "健康检查",
                      "moduleName": "系统",
                      "method": "GET",
                      "apiPath": "/health",
                      "requestBody": "{}",
                      "expectedStatus": 200,
                      "enabled": true
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        long caseId = objectMapper.readTree(caseResult.getResponse().getContentAsString())
            .path("data")
            .path("id")
            .asLong();

        mockMvc.perform(post("/api/v1/executions")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{" + "\"caseIds\": [" + caseId + "]}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalCases").value(1));

        mockMvc.perform(get("/api/v1/dashboard")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.totalCases").value(1))
            .andExpect(jsonPath("$.data.totalExecutions").value(1));
    }

    @Test
    void shouldRejectProtectedWithoutToken() throws Exception {
        mockMvc.perform(get("/api/v1/cases"))
            .andExpect(status().isForbidden());
    }

    @Test
    void shouldSupportDraftToPublishedFlow() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "flow_user",
                      "password": "flowpass123"
                    }
                    """))
            .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "flow_user",
                      "password": "flowpass123"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();
        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("data").path("token").asText();

        MvcResult draftResult = mockMvc.perform(post("/api/case/draft")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "caseName": "草稿案例",
                      "apiName": "订单接口",
                      "apiPath": "/api/order",
                      "requestMethod": "POST",
                      "requestHeaders": "{}",
                      "requestParams": "{\\"amount\\":100}",
                      "expectedResult": "success=true",
                      "assertType": "status_code",
                      "remark": "draft",
                      "expectedStatus": 200,
                      "enabled": true
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();

        long caseId = objectMapper.readTree(draftResult.getResponse().getContentAsString()).path("data").path("id").asLong();

        mockMvc.perform(put("/api/case/draft/{id}/publish", caseId)
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.caseStatus").value("PUBLISHED"));

        mockMvc.perform(get("/api/case/published/list")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].id").value(caseId));

        mockMvc.perform(put("/api/case/published/{id}/cancel-publish", caseId)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"force\":true}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.caseStatus").value("DRAFT"));

        mockMvc.perform(delete("/api/case/draft/{id}", caseId)
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    void shouldSupportOtherFeatureEndpoints() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "other_user",
                      "password": "otherpass123"
                    }
                    """))
            .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "username": "other_user",
                      "password": "otherpass123"
                    }
                    """))
            .andExpect(status().isOk())
            .andReturn();
        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).path("data").path("token").asText();

        mockMvc.perform(get("/api/v1/other/ai-config/TEMPLATE")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data[0].configKey").exists());

        mockMvc.perform(post("/api/v1/other/ai-config/TEMPLATE")
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "模板A",
                      "configKey": "TPL_A",
                      "scope": "all",
                      "content": "{\\"mode\\":\\"markdown\\"}",
                      "enabled": true
                    }
                    """))
            .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/other/reports/document")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/v1/other/logs/operations")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.success").value(true));
    }
}
