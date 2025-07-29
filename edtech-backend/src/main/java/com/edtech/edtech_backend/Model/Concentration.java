package com.edtech.edtech_backend.model;

import javax.persistence.*;  // JPA 어노테이션 사용
import java.time.LocalDateTime;

@Entity // JPA 엔티티임을 선언
@Table(name = "concentrations") // DB 테이블명 설정
public class Concentration {

    @Id // 기본키 지정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto Increment 전략
    private Long id;

    // ✅ 집중도 데이터가 속한 강의 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id") // 외래키 이름
    private Course course;

    // ✅ 집중도 데이터의 주인 사용자 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // 외래키 이름
    private User user;

    // ✅ 집중도 점수 (0.0 ~ 100.0)
    @Column(nullable = false)
    private Double score;

    // ✅ 집중도 측정 시각 (예: 2025-07-29T14:03:00)
    @Column(name = "measured_at")
    private LocalDateTime measuredAt;

    // ✅ 강의 타임라인 상의 위치 (예: 150초 → 2분 30초 지점)
    @Column(name = "timeline_position")
    private Integer timelinePosition;

    // ✅ 기본 생성자
    public Concentration() {}

    // ✅ 사용자 정의 생성자
    public Concentration(Course course, User user, Double score, Integer timelinePosition) {
        this.course = course;
        this.user = user;
        this.score = score;
        this.timelinePosition = timelinePosition;
        this.measuredAt = LocalDateTime.now(); // 측정 시간은 현재 시각
    }

    // ✅ Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Double getScore() { return score; }
    public void setScore(Double score) { this.score = score; }

    public LocalDateTime getMeasuredAt() { return measuredAt; }
    public void setMeasuredAt(LocalDateTime measuredAt) { this.measuredAt = measuredAt; }

    public Integer getTimelinePosition() { return timelinePosition; }
    public void setTimelinePosition(Integer timelinePosition) { this.timelinePosition = timelinePosition; }
}
