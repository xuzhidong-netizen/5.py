package com.xuzhidong.aitest.ai.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class LlmClient {

    @Value("${platform.ai.model-url:}")
    private String modelUrl;

    @Value("${platform.ai.temperature:0.2}")
    private double temperature;

    public String chat(String prompt) {
        if (modelUrl == null || modelUrl.isBlank()) {
            return "";
        }
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("prompt", prompt);
        requestBody.put("temperature", temperature);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.postForEntity(modelUrl, requestBody, String.class);
        return response.getBody();
    }
}
