package com.edtech.edtech_backend.model;

import javax.persistence.*;  // JPA 관련 어노테이션
import java.time.LocalDateTime;
import java.util.List;

@Entity // JPA에서 이 클래스가 테이블과 매핑되는 엔티티임을 명시
@Table(name = "courses") // 실제 DB 테이블 이름 설정
public class Course {

    @Id // 기본키 설정
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto Increment (MySQL 등에서 사용)
    private Long id;

    @Column(nullable = false)
    private String title; // 강의 제목

    @Column(nullable = false)
    private String description; // 강의 설명

    @Column(name = "created_at")
    private LocalDateTime createdAt; // 강의 생성 일시

    // ✅ 이 강의에 대한 출석 기록들 (1:N 관계)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Attendance> attendances;

    // ✅ 이 강의에 대한 집중도 데이터들 (1:N 관계)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Concentration> concentrations;

    // ✅ 이 강의에 대한 리뷰들 (1:N 관계)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<Review> reviews;

    // ✅ 기본 생성자
    public Course() {}

    // ✅ 강의 제목과 설명을 받아 초기화하는 생성자
    public Course(String title, String description) {
        this.title = title;
        this.description = description;
        this.createdAt = LocalDateTime.now();
    }

    // ✅ Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Attendance> getAttendances() { return attendances; }
    public void setAttendances(List<Attendance> attendances) { this.attendances = attendances; }

    public List<Concentration> getConcentrations() { return concentrations; }
    public void setConcentrations(List<Concentration> concentrations) { this.concentrations = concentrations; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }
}
