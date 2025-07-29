package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;
import java.util.List;

@Entity
@Table(name = "lecture")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lectureId;

    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private String title;

    private String videoUrl;

    private Timestamp createdAt;

    @OneToMany(mappedBy = "lecture")
    private List<Summary> summaries;

    @OneToMany(mappedBy = "lecture")
    private List<CourseEngagementAnalytics> courseAnalytics;

    @OneToMany(mappedBy = "lecture")
    private List<UserEngagementAnalytics> userAnalytics;
}