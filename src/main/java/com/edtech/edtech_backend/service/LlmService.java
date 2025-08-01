package com.edtech.edtech_backend.service;

import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
public class LlmService {
    private final WebClient webClient;

    public LlmService(WebClient.Builder builder) {
        this.webClient = builder.baseUrl("https://api-inference.huggingface.co").build();
    }

    public String summarize(String text) {
        return webClient.post()
            .uri("/models/your-model-name")
            .header("Authorization", "Bearer YOUR_API_KEY")
            .bodyValue(Map.of("inputs", text))
            .retrieve()
            .bodyToMono(String.class)
            .block();
    }
}