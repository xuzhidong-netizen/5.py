package com.xuzhidong.aitest.security;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("security")
@SpringBootTest
@AutoConfigureMockMvc
class SecurityValidationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldRejectInvalidFunctionPayload() throws Exception {
        mockMvc.perform(post("/api/functions")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "sysId":"cjeh2",
                      "sysName":"长江e号2"
                    }
                    """))
            .andExpect(status().isBadRequest());
    }

    @Test
    void shouldRejectUnsupported517268RequestType() throws Exception {
        mockMvc.perform(post("/prod-api/api/v1/forward/517268")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"i_request_data":"delete_everything"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(500))
            .andExpect(jsonPath("$.msg").value("不支持的请求类型: delete_everything"));
    }

    @Test
    void shouldReturnSafeMessageWhenHisIdNotExists() throws Exception {
        mockMvc.perform(post("/prod-api/aitest/his/list/hisId")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {"hisId":"00020251211155058"}
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.code").value(500))
            .andExpect(jsonPath("$.msg").value("您输入的运行id不存在，请确定后重新输入"));
    }
}
