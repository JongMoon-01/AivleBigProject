package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class CourseEngagementAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseAnalyticsId;

    @ManyToOne
    @JoinColumn(name = "lecture_id")
    private Lecture lecture;

    private String userId; // 외래키만 보존

    private double focusScore;
    private double reactionTimeAvg;

    @Column(columnDefinition = "TEXT")
    private String attentionGraphData; // JSON 형식

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters
    public Long getCourseAnalyticsId() { return courseAnalyticsId; }
    public Lecture getLecture() { return lecture; }
    public String getUserId() { return userId; }
    public double getFocusScore() { return focusScore; }
    public double getReactionTimeAvg() { return reactionTimeAvg; }
    public String getAttentionGraphData() { return attentionGraphData; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
