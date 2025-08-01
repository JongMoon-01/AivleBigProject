package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.CourseReportDto;
import com.edtech.edtech_backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // REST API 컨트롤러로 선언
@RequestMapping("/api/reports") // 모든 요청 경로는 /api/reports로 시작
@CrossOrigin(origins = "*") // 모든 프론트엔드 도메인의 요청 허용 (CORS 허용)
public class ReportController {

    @Autowired
    private ReportService reportService; // ReportService 의존성 주입

    // ✅ 특정 강좌(courseId)와 사용자(userId)에 대한 학습 리포트 조회
    @GetMapping("/course/{courseId}/user/{userId}")
    public ResponseEntity<CourseReportDto> getCourseReport(
            @PathVariable Long courseId, // 강좌 ID 경로 변수
            @PathVariable Long userId) { // 사용자 ID 경로 변수

        try {
            // 리포트 생성 및 반환
            CourseReportDto report = reportService.generateCourseReport(courseId, userId);
            return ResponseEntity.ok(report); // 200 OK + 리포트 JSON 반환
        } catch (Exception e) {
            // 예외 발생 시 400 Bad Request 반환
            return ResponseEntity.badRequest().build();
        }
    }
}
