package com.edtech.edtech_aibackend.service;

import com.edtech.edtech_aibackend.model.Quiz;
import com.edtech.edtech_aibackend.model.QuizResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagQuizGenerationService {
    
    private final ChatClient chatClient;
    private final VectorStore vectorStore;
    private final EmbeddingModel embeddingModel;
    private final ContentExtractionService contentExtractionService;
    private final ObjectMapper objectMapper;
    
    public QuizResponse generateQuiz(String courseType) throws IOException {
        // 1. VTT에서 텍스트 추출 및 교정
        String correctedContent = extractAndCorrectContent(courseType);
        
        // 2. 벡터 DB에 저장 (처음 실행 시만)
        storeContentInVectorDB(courseType, correctedContent);
        
        // 3. RAG를 사용하여 관련 컨텍스트 검색
        List<Document> relevantDocs = searchRelevantContent(courseType);
        
        // 4. 퀴즈 생성
        String prompt = createRagQuizPrompt(courseType, relevantDocs);
        String response = chatClient.prompt()
                .user(prompt)
                .call()
                .content();
        
        log.info("Generated RAG quiz response: {}", response);
        
        return parseQuizResponse(response, courseType);
    }
    
    private String extractAndCorrectContent(String courseType) throws IOException {
        ClassPathResource resource = getClassPathResource(courseType);
        String rawContent = contentExtractionService.extractTextFromVTT(resource.getInputStream());
        
        // 자막 교정
        String correctionPrompt = createCorrectionPrompt(rawContent);
        String correctedContent = chatClient.prompt()
                .user(correctionPrompt)
                .call()
                .content();
        
        log.info("Content corrected for course type: {}", courseType);
        return correctedContent;
    }
    
    private void storeContentInVectorDB(String courseType, String content) {
        try {
            // 기존 문서가 있는지 확인
            List<Document> existingDocs = vectorStore.similaritySearch(
                SearchRequest.query(courseType).withTopK(1)
            );
            
            if (!existingDocs.isEmpty()) {
                log.info("Content already exists in vector DB for course: {}", courseType);
                return;
            }
            
            // 텍스트를 청크로 분할
            List<String> chunks = contentExtractionService.chunkText(content, 500);
            List<Document> documents = new ArrayList<>();
            
            for (int i = 0; i < chunks.size(); i++) {
                Document doc = new Document(chunks.get(i));
                doc.getMetadata().put("courseType", courseType);
                doc.getMetadata().put("chunkId", i);
                doc.getMetadata().put("source", "vtt_subtitle");
                documents.add(doc);
            }
            
            vectorStore.add(documents);
            log.info("Stored {} chunks in vector DB for course: {}", chunks.size(), courseType);
            
        } catch (Exception e) {
            log.error("Failed to store content in vector DB", e);
        }
    }
    
    private List<Document> searchRelevantContent(String courseType) {
        String searchQuery = courseType + " 강의 내용";
        
        SearchRequest searchRequest = SearchRequest.query(searchQuery)
                .withTopK(3)
                .withSimilarityThreshold(0.5);
        
        List<Document> relevantDocs = vectorStore.similaritySearch(searchRequest);
        log.info("Found {} relevant documents for course: {}", relevantDocs.size(), courseType);
        
        return relevantDocs;
    }
    
    private String createRagQuizPrompt(String courseType, List<Document> relevantDocs) {
        StringBuilder contextBuilder = new StringBuilder();
        for (Document doc : relevantDocs) {
            contextBuilder.append(doc.getContent()).append("\n\n");
        }
        
        String courseName = getCourseDisplayName(courseType);
        String context = contextBuilder.toString();
        
        return String.format(
            "다음은 %s 강의의 주요 내용입니다:\n\n%s\n\n" +
            "위 강의 내용을 바탕으로 한국어로 객관식 퀴즈 5문제를 생성해주세요.\n\n" +
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
            courseName, context
        );
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
    
    private ClassPathResource getClassPathResource(String courseType) {
        if ("korean-history".equalsIgnoreCase(courseType)) {
            return new ClassPathResource("vtt/korean_history.vtt");
        } else if ("linear-algebra".equalsIgnoreCase(courseType)) {
            return new ClassPathResource("vtt/linear_algebra.vtt");
        }
        throw new IllegalArgumentException("Unknown course type: " + courseType);
    }
    
    private String getCourseDisplayName(String courseType) {
        if ("korean-history".equalsIgnoreCase(courseType)) {
            return "한국 역사";
        } else if ("linear-algebra".equalsIgnoreCase(courseType)) {
            return "선형대수학";
        }
        return courseType;
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