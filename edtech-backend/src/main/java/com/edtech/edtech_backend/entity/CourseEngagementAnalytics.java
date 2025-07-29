package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_engagement_analytics")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseEngagementAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long analyticsId;

    @ManyToOne
    @JoinColumn(name = "lecture_id")
    private Lecture lecture;

    private Integer viewCount;

    private Double averageWatchTime;
}