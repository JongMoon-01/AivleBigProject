package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // ✅ 테스트용 간단한 엔드포인트
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testConnection() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Dashboard API is working");
        response.put("timestamp", new java.util.Date().toString());
        return ResponseEntity.ok(response);
    }

    // ✅ 새 대시보드 전체 데이터 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<Map<String, Object>> getDashboardData(@PathVariable Long userId) {
        try {
            Map<String, Object> dashboardData = dashboardService.generateDashboardData(userId);
            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ KPI 메트릭스만 조회 (출석률, 복습률, 집중도 평균)
    @GetMapping("/kpi/{userId}")
    public ResponseEntity<Map<String, Object>> getKPIMetrics(@PathVariable Long userId) {
        try {
            Map<String, Object> kpiData = dashboardService.generateKPIMetrics(userId);
            return ResponseEntity.ok(kpiData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ 시간대별 집중도 데이터 (8AM-6PM)
    @GetMapping("/focus-by-time/{userId}")
    public ResponseEntity<Map<String, Object>> getFocusScoreByTime(@PathVariable Long userId) {
        try {
            Map<String, Object> focusData = dashboardService.generateFocusScoreByTime(userId);
            return ResponseEntity.ok(focusData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ 복습 자료 생성 시간 데이터
    @GetMapping("/review-materials/{userId}")
    public ResponseEntity<Map<String, Object>> getReviewMaterials(@PathVariable Long userId) {
        try {
            Map<String, Object> materialsData = dashboardService.generateReviewMaterials(userId);
            return ResponseEntity.ok(materialsData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ 응답 시간 분포 데이터
    @GetMapping("/response-time/{userId}")
    public ResponseEntity<Map<String, Object>> getResponseTimeDistribution(@PathVariable Long userId) {
        try {
            Map<String, Object> responseData = dashboardService.generateResponseTimeDistribution(userId);
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ 주간 집중도 변화 데이터
    @GetMapping("/weekly-change/{userId}")
    public ResponseEntity<Map<String, Object>> getWeeklyFocusChange(@PathVariable Long userId) {
        try {
            Map<String, Object> weeklyData = dashboardService.generateWeeklyFocusChange(userId);
            return ResponseEntity.ok(weeklyData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ 네비게이션 메뉴 데이터
    @GetMapping("/navigation/{userId}")
    public ResponseEntity<Map<String, Object>> getNavigationData(@PathVariable Long userId) {
        try {
            Map<String, Object> navData = dashboardService.generateNavigationData(userId);
            return ResponseEntity.ok(navData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}