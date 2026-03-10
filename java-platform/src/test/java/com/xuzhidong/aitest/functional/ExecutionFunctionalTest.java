package com.xuzhidong.aitest.functional;

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

@Tag("functional")
@SpringBootTest
@AutoConfigureMockMvc
class ExecutionFunctionalTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldRunVersionAndQueryStatusAndResult() throws Exception {
        MvcResult runResult = mockMvc.perform(post("/prod-api/api/v1/forward/517506")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "i_version_name":"长江e号",
                      "i_version_number":"11.9.0"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andReturn();

        JsonNode runJson = objectMapper.readTree(runResult.getResponse().getContentAsString());
        String hisId = runJson.path("data").path("hisId").asText();
        assertTrue(!hisId.isBlank());

        String currentStatus = "RUNNING";
        for (int i = 0; i < 20 && "RUNNING".equals(currentStatus); i++) {
            Thread.sleep(200);
            MvcResult statusResult = mockMvc.perform(post("/prod-api/aitest/his/list/hisId")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("""
                        {"hisId":"%s"}
                        """.formatted(hisId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andReturn();
            JsonNode statusJson = objectMapper.readTree(statusResult.getResponse().getContentAsString());
            currentStatus = statusJson.path("data").path("status").asText();
        }

        mockMvc.perform(post("/prod-api/aitest/upload/detail/list/his/hisId")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"hisId":"%s"}
                    """.formatted(hisId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(200))
            .andExpect(jsonPath("$.data.total").isNumber());
    }
}
