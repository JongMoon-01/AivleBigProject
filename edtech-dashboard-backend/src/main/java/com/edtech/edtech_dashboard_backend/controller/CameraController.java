package com.edtech.edtech_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping("/api/camera")
@CrossOrigin(origins = "*")
public class CameraController {

    // ✅ 카메라 이미지를 받아서 AI 집중도 분석 결과 반환
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeConcentration(
            @RequestParam("image") MultipartFile image,
            @RequestParam("userId") Long userId,
            @RequestParam("courseId") Long courseId) {
        
        try {
            // TODO: 실제 AI 모델 연동 (현재는 더미 데이터)
            Map<String, Object> result = processImageWithAI(image, userId, courseId);
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "이미지 분석 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ 실시간 웹캠 프레임 분석
    @PostMapping("/realtime-analyze")
    public ResponseEntity<Map<String, Object>> realtimeAnalyze(
            @RequestParam("frame") MultipartFile frame,
            @RequestParam("userId") Long userId,
            @RequestParam("sessionId") String sessionId) {
        
        try {
            Map<String, Object> result = processRealtimeFrame(frame, userId, sessionId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "실시간 분석 실패: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // ✅ AI 이미지 분석 처리 (더미 구현 - 나중에 실제 AI 모델로 교체)
    private Map<String, Object> processImageWithAI(MultipartFile image, Long userId, Long courseId) {
        // 더미 데이터 생성 (실제로는 AI 모델 호출)
        Map<String, Object> result = new HashMap<>();
        
        // 기본 정보
        result.put("userId", userId);
        result.put("courseId", courseId);
        result.put("timestamp", System.currentTimeMillis());
        result.put("imageSize", image.getSize());
        
        // AI 분석 결과 (더미)
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("emotion_score", Math.round(ThreadLocalRandom.current().nextDouble(0.3, 1.0) * 1000.0) / 1000.0);
        analysis.put("gaze_score", Math.round(ThreadLocalRandom.current().nextDouble(0.4, 1.0) * 1000.0) / 1000.0);
        analysis.put("task_score", 0.7); // 기본값
        
        double finalScore = 0.4 * (Double) analysis.get("emotion_score") + 
                           0.3 * (Double) analysis.get("gaze_score") + 
                           0.3 * (Double) analysis.get("task_score");
        analysis.put("final_score", Math.round(finalScore * 1000.0) / 1000.0);
        
        // 등급 계산
        String grade;
        if (finalScore >= 0.8) grade = "A";
        else if (finalScore >= 0.6) grade = "B";
        else grade = "C";
        analysis.put("grade", grade);
        
        // 피드백 메시지
        String feedback;
        if (finalScore >= 0.8) feedback = "훌륭한 집중도입니다!";
        else if (finalScore >= 0.6) feedback = "좋은 집중도를 유지하고 있습니다.";
        else feedback = "집중도 개선이 필요합니다.";
        analysis.put("feedback", feedback);
        
        // 감정 상태 (더미)
        String[] emotions = {"focused", "neutral", "distracted", "tired"};
        analysis.put("detected_emotion", emotions[ThreadLocalRandom.current().nextInt(emotions.length)]);
        
        // 시선 방향 (더미)
        String[] gazeDirections = {"center", "left", "right", "up", "down"};
        analysis.put("gaze_direction", gazeDirections[ThreadLocalRandom.current().nextInt(gazeDirections.length)]);
        
        result.put("analysis", analysis);
        result.put("success", true);
        
        return result;
    }

    // ✅ 실시간 프레임 분석
    private Map<String, Object> processRealtimeFrame(MultipartFile frame, Long userId, String sessionId) {
        Map<String, Object> result = new HashMap<>();
        
        result.put("userId", userId);
        result.put("sessionId", sessionId);
        result.put("timestamp", System.currentTimeMillis());
        result.put("frameSize", frame.getSize());
        
        // 실시간 분석 결과 (더미)
        Map<String, Object> realtimeData = new HashMap<>();
        realtimeData.put("concentration_level", Math.round(ThreadLocalRandom.current().nextDouble(0.2, 1.0) * 100.0) / 100.0);
        realtimeData.put("attention_score", Math.round(ThreadLocalRandom.current().nextDouble(0.3, 1.0) * 100.0) / 100.0);
        realtimeData.put("eye_contact_ratio", Math.round(ThreadLocalRandom.current().nextDouble(0.4, 0.9) * 100.0) / 100.0);
        
        // 상태 분류
        double concentrationLevel = (Double) realtimeData.get("concentration_level");
        String status;
        if (concentrationLevel >= 0.7) status = "highly_focused";
        else if (concentrationLevel >= 0.5) status = "moderately_focused";
        else status = "distracted";
        realtimeData.put("status", status);
        
        result.put("realtimeData", realtimeData);
        result.put("success", true);
        
        return result;
    }

    // ✅ 세션 종료 및 최종 분석 결과
    @PostMapping("/session-summary")
    public ResponseEntity<Map<String, Object>> getSessionSummary(
            @RequestParam("sessionId") String sessionId,
            @RequestParam("userId") Long userId) {
        
        Map<String, Object> summary = new HashMap<>();
        summary.put("sessionId", sessionId);
        summary.put("userId", userId);
        summary.put("totalDuration", ThreadLocalRandom.current().nextInt(300, 3600)); // 5분-1시간
        summary.put("averageConcentration", Math.round(ThreadLocalRandom.current().nextDouble(0.4, 0.9) * 1000.0) / 1000.0);
        summary.put("peakConcentration", Math.round(ThreadLocalRandom.current().nextDouble(0.7, 1.0) * 1000.0) / 1000.0);
        summary.put("lowPointCount", ThreadLocalRandom.current().nextInt(0, 5));
        summary.put("recommendation", "전반적으로 좋은 집중도를 보였습니다. 중간중간 휴식을 취하면 더 좋을 것 같습니다.");
        
        return ResponseEntity.ok(summary);
    }
}