package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_engagement_analytics")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEngagementAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long analyticsId;

    @ManyToOne
    @JoinColumn(name = "lecture_id")
    private Lecture lecture;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private Boolean isWatched;

    private Double watchTime;
}