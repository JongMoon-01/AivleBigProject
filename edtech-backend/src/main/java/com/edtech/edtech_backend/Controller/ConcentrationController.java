package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.model.Concentration;
import com.edtech.edtech_backend.service.ConcentrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/concentrations")
@CrossOrigin(origins = "*")
public class ConcentrationController {

    @Autowired
    private ConcentrationService concentrationService;

    // ✅ FastAPI에서 집중도 데이터를 받는 API
    @PostMapping
    public ResponseEntity<Concentration> saveConcentration(@RequestBody ConcentrationRequest request) {
        try {
            Concentration concentration = concentrationService.saveConcentration(
                request.getCourseId(), 
                request.getUserId(), 
                request.getScore(), 
                request.getTimelinePosition()
            );
            return ResponseEntity.ok(concentration);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ 특정 강좌의 집중도 데이터 조회
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Concentration>> getConcentrationsByCourse(@PathVariable Long courseId) {
        List<Concentration> concentrations = concentrationService.getConcentrationsByCourse(courseId);
        return ResponseEntity.ok(concentrations);
    }

    // ✅ 특정 사용자의 집중도 데이터 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Concentration>> getConcentrationsByUser(@PathVariable Long userId) {
        List<Concentration> concentrations = concentrationService.getConcentrationsByUser(userId);
        return ResponseEntity.ok(concentrations);
    }

    // ✅ 집중도 데이터 요청 DTO
    public static class ConcentrationRequest {
        private Long courseId;
        private Long userId;
        private Double score;
        private Integer timelinePosition;

        // Getters and Setters
        public Long getCourseId() { return courseId; }
        public void setCourseId(Long courseId) { this.courseId = courseId; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public Double getScore() { return score; }
        public void setScore(Double score) { this.score = score; }

        public Integer getTimelinePosition() { return timelinePosition; }
        public void setTimelinePosition(Integer timelinePosition) { this.timelinePosition = timelinePosition; }
    }
}