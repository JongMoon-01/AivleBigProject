package com.edtech.edtech_backend.dto;

import java.util.Map;

// ✅ 강의의 카테고리별 미복습 시간 등을 시각화하기 위한 DTO
public class CategoryBarGraphDto {
    private Long courseId; // 강좌 ID
    private Long userId;   // 사용자 ID

    // ✅ 카테고리명(String) → 해당 카테고리의 데이터(CategoryData) 매핑
    private Map<String, CategoryData> categoryData;

    // ✅ 전체 미복습 시간 (모든 카테고리 합산 기준)
    private Integer totalUnreviewedMinutes;

    // ✅ 내부 클래스: 개별 카테고리별 데이터
    public static class CategoryData {
        private String categoryName;       // 카테고리명 (예: 이론, 실습, 퀴즈 등)
        private Integer unreviewedMinutes; // 이 카테고리에서 미복습 상태의 분(minute)
        private Integer totalSections;     // 이 카테고리에 속한 총 세션 수
        private Double percentage;         // 이 카테고리 미복습률 (%) = 미복습시간 / 전체시간 비율

        // 생성자
        public CategoryData(String categoryName, Integer unreviewedMinutes, Integer totalSections) {
            this.categoryName = categoryName;
            this.unreviewedMinutes = unreviewedMinutes;
            this.totalSections = totalSections;
        }

        // Getter & Setter
        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

        public Integer getUnreviewedMinutes() { return unreviewedMinutes; }
        public void setUnreviewedMinutes(Integer unreviewedMinutes) { this.unreviewedMinutes = unreviewedMinutes; }

        public Integer getTotalSections() { return totalSections; }
        public void setTotalSections(Integer totalSections) { this.totalSections = totalSections; }

        public Double getPercentage() { return percentage; }
        public void setPercentage(Double percentage) { this.percentage = percentage; }
    }

    // 기본 생성자
    public CategoryBarGraphDto() {}

    // Getter & Setter
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Map<String, CategoryData> getCategoryData() { return categoryData; }
    public void setCategoryData(Map<String, CategoryData> categoryData) { this.categoryData = categoryData; }

    public Integer getTotalUnreviewedMinutes() { return totalUnreviewedMinutes; }
    public void setTotalUnreviewedMinutes(Integer totalUnreviewedMinutes) { this.totalUnreviewedMinutes = totalUnreviewedMinutes; }
}
