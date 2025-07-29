package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 사용자 엔티티 클래스
 * 
 * 데이터베이스의 users 테이블과 매핑되는 JPA 엔티티입니다.
 * 관리자(admin)와 학생(student) 두 가지 역할을 지원합니다.
 */
@Entity
@Table(name = "users")
public class User {
    
    /**
     * 사용자 고유 ID - 기본 키
     * 자동 증가 전략 사용 (IDENTITY)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    
    /**
     * 사용자 이메일 - 고유해야 하며 null 불가
     * 로그인 시 아이디로 사용됨
     */
    @Column(nullable = false, unique = true)
    private String email;
    
    /**
     * 암호화된 비밀번호 - null 불가
     * BCrypt 등으로 암호화된 값 저장
     */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
    
    /**
     * 사용자 이름 - null 불가
     */
    @Column(nullable = false)
    private String name;
    
    /**
     * 사용자 역할 - null 불가
     * UserRole enum 값을 문자열로 저장
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
    
    /**
     * 생성 시간 - 처음 저장 시 자동 설정
     */
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    /**
     * 수정 시간 - 업데이트 시마다 자동 갱신
     */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * 엔티티 저장 전 실행되는 메서드
     * 생성 시간과 수정 시간을 현재 시간으로 설정
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 엔티티 업데이트 전 실행되는 메서드
     * 수정 시간을 현재 시간으로 갱신
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 사용자 역할 Enum
     * admin: 관리자 - 모든 권한을 가지며 학생 계정으로 가장 가능
     * student: 학생 - 일반 사용자
     */
    public enum UserRole {
        admin, student
    }
    
    /**
     * 기본 생성자 - JPA에서 필수
     */
    public User() {}
    
    /**
     * 모든 필수 필드를 초기화하는 생성자
     * 
     * @param email 사용자 이메일
     * @param passwordHash 암호화된 비밀번호
     * @param name 사용자 이름
     * @param role 사용자 역할
     */
    public User(String email, String passwordHash, String name, UserRole role) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.role = role;
    }
    
    // Getters and Setters
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public UserRole getRole() {
        return role;
    }
    
    public void setRole(UserRole role) {
        this.role = role;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}