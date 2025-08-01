package com.edtech.edtech_aibackend.controller;

import com.edtech.edtech_aibackend.model.QuizResponse;
import com.edtech.edtech_aibackend.model.QuizResult;
import com.edtech.edtech_aibackend.model.QuizSubmission;
import com.edtech.edtech_aibackend.service.QuizGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/quiz")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:3000")
public class QuizController {
    
    private final QuizGenerationService quizGenerationService;
    private final Map<String, QuizResponse> quizCache = new HashMap<>();
    
    @PostMapping("/aice")
    public ResponseEntity<?> generateAiceQuiz() {
        try {
            QuizResponse quiz = quizGenerationService.generateQuiz("aice");
            quizCache.put("aice_" + quiz.getQuizzes().get(0).getId(), quiz);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            log.error("Failed to generate AICE quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "퀴즈 생성에 실패했습니다: " + e.getMessage()));
        }
    }
    
    @PostMapping("/hanwha")
    public ResponseEntity<?> generateHanwhaQuiz() {
        try {
            QuizResponse quiz = quizGenerationService.generateQuiz("hanwha");
            quizCache.put("hanwha_" + quiz.getQuizzes().get(0).getId(), quiz);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            log.error("Failed to generate Hanwha quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "퀴즈 생성에 실패했습니다: " + e.getMessage()));
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmission submission) {
        try {
            String cacheKey = submission.getCourseType() + "_" + submission.getAnswers().keySet().iterator().next();
            QuizResponse cachedQuiz = quizCache.get(cacheKey);
            
            if (cachedQuiz == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "퀴즈를 찾을 수 없습니다"));
            }
            
            int correctCount = 0;
            for (Map.Entry<String, Integer> entry : submission.getAnswers().entrySet()) {
                String quizId = entry.getKey();
                Integer answer = entry.getValue();
                
                cachedQuiz.getQuizzes().stream()
                        .filter(q -> q.getId().equals(quizId))
                        .findFirst()
                        .ifPresent(quiz -> {
                            if (quiz.getCorrectAnswer() == answer) {
                                submission.getAnswers().put(quizId, answer);
                            }
                        });
                
                if (cachedQuiz.getQuizzes().stream()
                        .anyMatch(q -> q.getId().equals(quizId) && q.getCorrectAnswer() == answer)) {
                    correctCount++;
                }
            }
            
            QuizResult result = new QuizResult();
            result.setTotalQuestions(cachedQuiz.getQuizzes().size());
            result.setCorrectAnswers(correctCount);
            result.setScore((double) correctCount / cachedQuiz.getQuizzes().size() * 100);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to submit quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "퀴즈 제출에 실패했습니다"));
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy", "service", "quiz-generation"));
    }
}