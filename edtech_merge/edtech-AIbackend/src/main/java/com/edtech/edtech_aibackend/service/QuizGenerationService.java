package com.edtech.edtech_aibackend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.completion.chat.ChatMessageRole;
import com.theokanning.openai.service.OpenAiService;
import com.edtech.edtech_aibackend.model.Quiz;
import com.edtech.edtech_aibackend.model.QuizResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuizGenerationService {
    
    private final OpenAiService openAiService;
    private final ContentExtractionService contentExtractionService;
    private final ObjectMapper objectMapper;
    
    @Value("${openai.api.model}")
    private String model;
    
    @Value("${openai.api.max-tokens}")
    private Integer maxTokens;
    
    @Value("${openai.api.temperature}")
    private Double temperature;
    
    public QuizResponse generateQuiz(String courseType) throws IOException {
        ClassPathResource resource = getClassPathResource(courseType);
        String rawContent = contentExtractionService.extractTextFromVTT(resource.getInputStream());
        
        // 자막 교정 단계 추가
        String correctedContent = correctSubtitleContent(rawContent);
        log.info("Corrected subtitle content for course type: {}", courseType);
        
        List<String> chunks = contentExtractionService.chunkText(correctedContent, 2000);
        
        String relevantContent = chunks.isEmpty() ? "" : String.join("\n", chunks.subList(0, Math.min(3, chunks.size())));
        
        String prompt = createQuizPrompt(courseType, relevantContent);
        
        List<ChatMessage> messages = new ArrayList<>();
        messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), "You are a quiz generator that creates educational quizzes in Korean."));
        messages.add(new ChatMessage(ChatMessageRole.USER.value(), prompt));
        
        ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
                .model(model)
                .messages(messages)
                .maxTokens(maxTokens)
                .temperature(temperature)
                .build();
        
        String response = openAiService.createChatCompletion(completionRequest)
                .getChoices().get(0).getMessage().getContent();
        
        log.info("Generated quiz response: {}", response);
        
        return parseQuizResponse(response, courseType);
    }
    
    private ClassPathResource getClassPathResource(String courseType) {
        if ("korean_history".equalsIgnoreCase(courseType)) {
            return new ClassPathResource("vtt/korean_history.vtt");
        } else if ("linear_algebra".equalsIgnoreCase(courseType)) {
            return new ClassPathResource("vtt/linear_algebra.vtt");
        }
        throw new IllegalArgumentException("Unknown course type: " + courseType);
    }
    
    private String createQuizPrompt(String courseType, String content) {
        String courseName = "";
        if ("korean_history".equalsIgnoreCase(courseType)) {
            courseName = "한국 역사";
        } else if ("linear_algebra".equalsIgnoreCase(courseType)) {
            courseName = "선형대수학";
        }
        
        return String.format(
            "다음은 %s 강의의 자막 내용입니다. 이를 바탕으로 한국어로 객관식 퀴즈 5문제를 생성해주세요.\n" +
            "강의 자막:\n%s\n\n" +
            "요구사항:\n" +
            "1. 5개의 객관식 문제 (4지선다)\n" +
            "2. 각 문제는 강의 내용과 직접적으로 관련이 있어야 함\n" +
            "3. 난이도는 중간 정도\n" +
            "4. 강의 내용을 잘 이해했는지 확인할 수 있는 문제\n" +
            "5. JSON 형식으로 반환\n" +
            "6. 형식:\n" +
            "{\n" +
            "  \"quizzes\": [\n" +
            "    {\n" +
            "      \"question\": \"문제\",\n" +
            "      \"options\": [\"선택지1\", \"선택지2\", \"선택지3\", \"선택지4\"],\n" +
            "      \"correctAnswer\": 0,\n" +
            "      \"explanation\": \"설명\"\n" +
            "    }\n" +
            "  ]\n" +
            "}",
            courseName,
            content
        );
    }
    
    private QuizResponse parseQuizResponse(String jsonResponse, String courseType) {
        try {
            jsonResponse = jsonResponse.trim();
            if (jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7);
            }
            if (jsonResponse.endsWith("```")) {
                jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
            }
            
            QuizResponse response = objectMapper.readValue(jsonResponse, QuizResponse.class);
            response.setCourseType(courseType);
            
            for (Quiz quiz : response.getQuizzes()) {
                quiz.setId(UUID.randomUUID().toString());
            }
            
            return response;
        } catch (Exception e) {
            log.error("Failed to parse quiz response", e);
            return createDefaultQuizResponse(courseType);
        }
    }
    
    private QuizResponse createDefaultQuizResponse(String courseType) {
        QuizResponse response = new QuizResponse();
        response.setCourseType(courseType);
        List<Quiz> quizzes = new ArrayList<>();
        
        for (int i = 1; i <= 5; i++) {
            Quiz quiz = new Quiz();
            quiz.setId(UUID.randomUUID().toString());
            quiz.setQuestion("문제 " + i);
            quiz.setOptions(List.of("선택지 1", "선택지 2", "선택지 3", "선택지 4"));
            quiz.setCorrectAnswer(0);
            quiz.setExplanation("설명");
            quizzes.add(quiz);
        }
        
        response.setQuizzes(quizzes);
        return response;
    }
    
    private String correctSubtitleContent(String rawContent) {
        try {
            String correctionPrompt = createCorrectionPrompt(rawContent);
            
            List<ChatMessage> messages = new ArrayList<>();
            messages.add(new ChatMessage(ChatMessageRole.SYSTEM.value(), 
                "You are a Korean language expert who corrects speech recognition errors in subtitles."));
            messages.add(new ChatMessage(ChatMessageRole.USER.value(), correctionPrompt));
            
            ChatCompletionRequest completionRequest = ChatCompletionRequest.builder()
                    .model(model)
                    .messages(messages)
                    .maxTokens(maxTokens)
                    .temperature(0.3) // 낮은 temperature로 더 정확한 교정
                    .build();
            
            String correctedText = openAiService.createChatCompletion(completionRequest)
                    .getChoices().get(0).getMessage().getContent();
            
            return correctedText;
        } catch (Exception e) {
            log.error("Failed to correct subtitle content", e);
            // 교정 실패 시 원본 반환
            return rawContent;
        }
    }
    
    private String createCorrectionPrompt(String content) {
        return String.format(
            "다음은 음성 인식으로 생성된 강의 자막입니다.\n" +
            "음성 인식 오류를 수정하고, 맞춤법과 문법을 교정하여\n" +
            "논리적으로 맞는 내용으로,\n" +
            "원래 의미와 내용은 그대로 유지하되, 명확하게 수정해주세요.\n\n" +
            "자막 내용:\n%s\n\n" +
            "교정된 내용만 반환해주세요. 추가 설명은 필요 없습니다.",
            content
        );
    }
}