package com.edtech.edtech_backend.model;

import javax.persistence.*;  // JPA 어노테이션
import java.time.LocalDateTime;
import java.util.List;

@Entity // JPA에서 사용자 정보를 나타내는 엔티티 선언
@Table(name = "users") // 매핑되는 DB 테이블 이름 설정
public class User {

    @Id // 기본키
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 자동 증가 ID
    private Long id;

    @Column(nullable = false, unique = true)
    private String username; // 로그인용 아이디 (중복 불가)

    @Column(nullable = false, unique = true)
    private String email; // 사용자 이메일 (중복 불가)

    @Column(nullable = false)
    private String password; // 비밀번호 (해싱 필요)

    @Column(name = "full_name")
    private String fullName; // 사용자 이름

    @Column(name = "created_at")
    private LocalDateTime createdAt; // 가입 시각

    // ✅ 사용자 ↔ 출석 기록 (1:N 관계)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Attendance> attendances;

    // ✅ 사용자 ↔ 집중도 기록 (1:N 관계)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Concentration> concentrations;

    // ✅ 사용자 ↔ 복습 요청 (1:N 관계)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Review> reviews;

    // ✅ 기본 생성자
    public User() {}

    // ✅ 사용자 정의 생성자
    public User(String username, String email, String password, String fullName) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.createdAt = LocalDateTime.now();
    }

    // ✅ Getter & Setter
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<Attendance> getAttendances() { return attendances; }
    public void setAttendances(List<Attendance> attendances) { this.attendances = attendances; }

    public List<Concentration> getConcentrations() { return concentrations; }
    public void setConcentrations(List<Concentration> concentrations) { this.concentrations = concentrations; }

    public List<Review> getReviews() { return reviews; }
    public void setReviews(List<Review> reviews) { this.reviews = reviews; }
}
