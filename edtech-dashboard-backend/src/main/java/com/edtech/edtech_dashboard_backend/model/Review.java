package com.edtech.edtech_backend.model;

import javax.persistence.*;  // JPA 어노테이션
import java.time.LocalDateTime;

@Entity // JPA 엔티티 클래스
@Table(name = "reviews") // 테이블 이름 지정
public class Review {

    @Id // 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto Increment 방식
    private Long id;

    // ✅ 복습 구간이 속한 강의 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id") // 외래키 설정
    private Course course;

    // ✅ 복습 요청을 한 사용자 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // 외래키 설정
    private User user;

    // ✅ 복습 카테고리 (예: 수학, 과학, 실습 등)
    @Column(nullable = false)
    private String category;

    // ✅ 복습이 필요한 강의 구간의 시작 타임라인 (예: 130초)
    @Column(name = "timeline_start")
    private Integer timelineStart;

    // ✅ 복습이 필요한 강의 구간의 끝 타임라인 (예: 170초)
    @Column(name = "timeline_end")
    private Integer timelineEnd;

    // ✅ 해당 구간을 복습했는지 여부 (기본값: false)
    @Column(name = "is_reviewed")
    private Boolean isReviewed = false;

    // ✅ 복습 요청 생성 시각
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ 기본 생성자
    public Review() {}

    // ✅ 사용자 정의 생성자
    public Review(Course course, User user, String category, Integer timelineStart, Integer timelineEnd) {
        this.course = course;
        this.user = user;
        this.category = category;
        this.timelineStart = timelineStart;
        this.timelineEnd = timelineEnd;
        this.createdAt = LocalDateTime.now();
    }

    // ✅ Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getTimelineStart() { return timelineStart; }
    public void setTimelineStart(Integer timelineStart) { this.timelineStart = timelineStart; }

    public Integer getTimelineEnd() { return timelineEnd; }
    public void setTimelineEnd(Integer timelineEnd) { this.timelineEnd = timelineEnd; }

    public Boolean getIsReviewed() { return isReviewed; }
    public void setIsReviewed(Boolean isReviewed) { this.isReviewed = isReviewed; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
