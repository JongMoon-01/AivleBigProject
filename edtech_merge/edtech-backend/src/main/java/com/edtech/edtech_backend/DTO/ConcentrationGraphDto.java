package com.edtech.edtech_backend.dto;

import java.util.List;

// ✅ 강의 집중도 그래프 데이터를 전달하기 위한 DTO
public class ConcentrationGraphDto {
    private Long courseId;  // 강의 ID
    private Long userId;    // 사용자 ID

    // ✅ 집중도 측정 데이터 리스트 (시간대별 집중도)
    private List<ConcentrationPoint> concentrationPoints;

    // ✅ 전체 평균 집중도
    private Double averageConcentration;

    // ✅ 집중도 최고점
    private Double maxConcentration;

    // ✅ 집중도 최저점
    private Double minConcentration;

    // ✅ 내부 클래스: 집중도 측정 시점의 데이터 단위 (그래프의 하나의 점)
    public static class ConcentrationPoint {
        private Integer timelinePosition;   // 타임라인 상의 위치 (예: n번째 분)
        private Double concentrationScore;  // 해당 시간의 집중도 점수 (0.0~1.0)
        private String timestamp;           // 해당 시점의 시간 (예: "00:05:12")

        // 생성자
        public ConcentrationPoint(Integer timelinePosition, Double concentrationScore, String timestamp) {
            this.timelinePosition = timelinePosition;
            this.concentrationScore = concentrationScore;
            this.timestamp = timestamp;
        }

        // Getter & Setter
        public Integer getTimelinePosition() { return timelinePosition; }
        public void setTimelinePosition(Integer timelinePosition) { this.timelinePosition = timelinePosition; }

        public Double getConcentrationScore() { return concentrationScore; }
        public void setConcentrationScore(Double concentrationScore) { this.concentrationScore = concentrationScore; }

        public String getTimestamp() { return timestamp; }
        public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
    }

    // 기본 생성자
    public ConcentrationGraphDto() {}

    // Getter & Setter
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<ConcentrationPoint> getConcentrationPoints() { return concentrationPoints; }
    public void setConcentrationPoints(List<ConcentrationPoint> concentrationPoints) { this.concentrationPoints = concentrationPoints; }

    public Double getAverageConcentration() { return averageConcentration; }
    public void setAverageConcentration(Double averageConcentration) { this.averageConcentration = averageConcentration; }

    public Double getMaxConcentration() { return maxConcentration; }
    public void setMaxConcentration(Double maxConcentration) { this.maxConcentration = maxConcentration; }

    public Double getMinConcentration() { return minConcentration; }
    public void setMinConcentration(Double minConcentration) { this.minConcentration = minConcentration; }
}
