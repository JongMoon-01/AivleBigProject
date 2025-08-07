package com.edtech.edtech_backend.dto;

import java.util.List;
import java.util.Map;

// ✅ 강의 리포트 전체 데이터를 담는 DTO
public class CourseReportDto {
    private Long courseId;                     // 강좌 ID
    private String courseTitle;               // 강좌 제목

    private List<UnreviewedSection> unreviewedSections; // ✅ 미복습 구간 목록
    private Map<String, Integer> categoryBarGraph;      // ✅ 카테고리별 미복습 시간 (분 단위)
    private List<ConcentrationPoint> concentrationGraph;// ✅ 시간대별 집중도 데이터

    private Double attendanceRate;            // ✅ 출석률 (0.0 ~ 1.0)
    private String comprehensiveReport;       // ✅ 종합 요약 문장 (LLM 기반 생성 등)

    // ✅ 내부 클래스: 미복습 구간 (타임라인에서 복습이 필요한 구간 정보)
    public static class UnreviewedSection {
        private Integer timelineStart; // 구간 시작 위치 (초 또는 n분)
        private Integer timelineEnd;   // 구간 끝 위치
        private String category;       // 해당 구간의 카테고리 (예: 이론, 실습 등)

        public UnreviewedSection(Integer timelineStart, Integer timelineEnd, String category) {
            this.timelineStart = timelineStart;
            this.timelineEnd = timelineEnd;
            this.category = category;
        }

        // Getter & Setter
        public Integer getTimelineStart() { return timelineStart; }
        public void setTimelineStart(Integer timelineStart) { this.timelineStart = timelineStart; }

        public Integer getTimelineEnd() { return timelineEnd; }
        public void setTimelineEnd(Integer timelineEnd) { this.timelineEnd = timelineEnd; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    // ✅ 내부 클래스: 집중도 점수 (그래프용 데이터)
    public static class ConcentrationPoint {
        private Integer timelinePosition;   // 타임라인 상의 위치 (분 단위 등)
        private Double concentrationScore;  // 집중도 점수 (0.0 ~ 1.0)

        public ConcentrationPoint(Integer timelinePosition, Double concentrationScore) {
            this.timelinePosition = timelinePosition;
            this.concentrationScore = concentrationScore;
        }

        // Getter & Setter
        public Integer getTimelinePosition() { return timelinePosition; }
        public void setTimelinePosition(Integer timelinePosition) { this.timelinePosition = timelinePosition; }

        public Double getConcentrationScore() { return concentrationScore; }
        public void setConcentrationScore(Double concentrationScore) { this.concentrationScore = concentrationScore; }
    }

    // 기본 생성자
    public CourseReportDto() {}

    // Getter & Setter
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public List<UnreviewedSection> getUnreviewedSections() { return unreviewedSections; }
    public void setUnreviewedSections(List<UnreviewedSection> unreviewedSections) { this.unreviewedSections = unreviewedSections; }

    public Map<String, Integer> getCategoryBarGraph() { return categoryBarGraph; }
    public void setCategoryBarGraph(Map<String, Integer> categoryBarGraph) { this.categoryBarGraph = categoryBarGraph; }

    public List<ConcentrationPoint> getConcentrationGraph() { return concentrationGraph; }
    public void setConcentrationGraph(List<ConcentrationPoint> concentrationGraph) { this.concentrationGraph = concentrationGraph; }

    public Double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(Double attendanceRate) { this.attendanceRate = attendanceRate; }

    public String getComprehensiveReport() { return comprehensiveReport; }
    public void setComprehensiveReport(String comprehensiveReport) { this.comprehensiveReport = comprehensiveReport; }
}
