package com.xuzhidong.aitest.stability;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tag("stability")
@SpringBootTest
@AutoConfigureMockMvc
class StabilitySmokeTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldKeepServingSummaryInRepeatedRequests() throws Exception {
        for (int i = 0; i < 30; i++) {
            mockMvc.perform(get("/api/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.functionCount").isNumber())
                .andExpect(jsonPath("$.caseCount").isNumber())
                .andExpect(jsonPath("$.runCount").isNumber());
        }
    }
}
