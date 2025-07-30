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
    private final PDFService pdfService;
    private final ObjectMapper objectMapper;
    
    @Value("${openai.api.model}")
    private String model;
    
    @Value("${openai.api.max-tokens}")
    private Integer maxTokens;
    
    @Value("${openai.api.temperature}")
    private Double temperature;
    
    public QuizResponse generateQuiz(String courseType) throws IOException {
        ClassPathResource resource = getClassPathResource(courseType);
        String pdfContent = pdfService.extractTextFromPDF(resource.getInputStream());
        List<String> chunks = pdfService.chunkText(pdfContent, 2000);
        
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
        if ("aice".equalsIgnoreCase(courseType)) {
            return new ClassPathResource("pdf/AICE Associate 샘플문항.pdf");
        } else if ("hanwha".equalsIgnoreCase(courseType)) {
            return new ClassPathResource("pdf/기업분석보고서_한화에어로스페이스(주).pdf");
        }
        throw new IllegalArgumentException("Unknown course type: " + courseType);
    }
    
    private String createQuizPrompt(String courseType, String content) {
        return String.format(
            "다음 문서 내용을 바탕으로 한국어로 객관식 퀴즈 5문제를 생성해주세요.\n" +
            "문서 내용:\n%s\n\n" +
            "요구사항:\n" +
            "1. 5개의 객관식 문제 (4지선다)\n" +
            "2. 각 문제는 문서 내용과 관련이 있어야 함\n" +
            "3. 난이도는 중간 정도\n" +
            "4. JSON 형식으로 반환\n" +
            "5. 형식:\n" +
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
}