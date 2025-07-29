package com.edtech.edtech_backend.model;

import javax.persistence.*;  // JPA 관련 어노테이션
import java.time.LocalDateTime;

@Entity // JPA에서 엔티티 클래스임을 명시 (DB 테이블로 매핑됨)
@Table(name = "attendances") // 테이블 이름 지정
public class Attendance {

    @Id // 기본키(PK)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가 전략 (MySQL 등에서 AUTO_INCREMENT)
    private Long id;

    // ✅ 출석이 연결된 강의 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id") // 외래키 컬럼명 지정
    private Course course;

    // ✅ 출석한 사용자 (N:1 관계)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // 외래키 컬럼명 지정
    private User user;

    // ✅ 출석 여부 (참석: true, 결석: false)
    @Column(name = "is_present")
    private Boolean isPresent;

    // ✅ 출석한 날짜 및 시간
    @Column(name = "attendance_date")
    private LocalDateTime attendanceDate;

    // ✅ 출석 데이터가 생성된 시각
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ✅ 기본 생성자
    public Attendance() {}

    // ✅ 사용자 정의 생성자 (현재 시각을 출석일 및 생성일로 설정)
    public Attendance(Course course, User user, Boolean isPresent) {
        this.course = course;
        this.user = user;
        this.isPresent = isPresent;
        this.attendanceDate = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    // ✅ Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Course getCourse() { return course; }
    public void setCourse(Course course) { this.course = course; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Boolean getIsPresent() { return isPresent; }
    public void setIsPresent(Boolean isPresent) { this.isPresent = isPresent; }

    public LocalDateTime getAttendanceDate() { return attendanceDate; }
    public void setAttendanceDate(LocalDateTime attendanceDate) { this.attendanceDate = attendanceDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
