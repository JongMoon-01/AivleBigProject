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
    
    @PostMapping("/korean-history")
    public ResponseEntity<?> generateKoreanHistoryQuiz() {
        try {
            QuizResponse quiz = quizGenerationService.generateQuiz("korean_history");
            quizCache.put("korean-history_" + quiz.getQuizzes().get(0).getId(), quiz);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            log.error("Failed to generate Korean History quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "퀴즈 생성에 실패했습니다: " + e.getMessage()));
        }
    }
    
    @PostMapping("/linear-algebra")
    public ResponseEntity<?> generateLinearAlgebraQuiz() {
        try {
            QuizResponse quiz = quizGenerationService.generateQuiz("linear_algebra");
            quizCache.put("linear-algebra_" + quiz.getQuizzes().get(0).getId(), quiz);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            log.error("Failed to generate Linear Algebra quiz", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "퀴즈 생성에 실패했습니다: " + e.getMessage()));
        }
    }
    
    @PostMapping("/submit")
    public ResponseEntity<?> submitQuiz(@RequestBody QuizSubmission submission) {
        try {
            // 캐시 키 생성 (courseType은 korean-history 또는 linear-algebra 형식)
            String cacheKey = submission.getCourseType() + "_" + submission.getAnswers().keySet().iterator().next();
            log.info("Looking for quiz with cache key: {}", cacheKey);
            log.info("Available cache keys: {}", quizCache.keySet());
            
            QuizResponse cachedQuiz = quizCache.get(cacheKey);
            
            if (cachedQuiz == null) {
                log.error("Quiz not found in cache. Cache key: {}, Available keys: {}", cacheKey, quizCache.keySet());
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "퀴즈를 찾을 수 없습니다. 캐시 키: " + cacheKey));
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