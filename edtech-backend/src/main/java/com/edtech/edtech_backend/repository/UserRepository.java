package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 사용자 리포지토리 인터페이스
 * 
 * Spring Data JPA를 사용하여 User 엔티티에 대한 데이터베이스 접근을 처리합니다.
 * JpaRepository를 상속받아 기본적인 CRUD 작업을 자동으로 제공받습니다.
 * @Repository 어노테이션으로 Spring의 컴포넌트 스캔 대상이 됩니다.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    /**
     * 이메일로 사용자 찾기
     * 
     * 주어진 이메일을 가진 사용자를 데이터베이스에서 조회합니다.
     * Optional로 감싸서 반환하여 null 처리를 안전하게 합니다.
     * 
     * @param email 검색할 사용자의 이메일
     * @return 사용자가 존재하면 Optional에 감싸진 User, 없으면 Optional.empty()
     */
    Optional<User> findByEmail(String email);
    
    /**
     * 이메일 중복 확인
     * 
     * 주어진 이메일이 이미 데이터베이스에 존재하는지 확인합니다.
     * 회원가입 시 이메일 중복 체크에 사용됩니다.
     * 
     * @param email 중복 확인할 이메일
     * @return 이메일이 존재하면 true, 없으면 false
     */
    boolean existsByEmail(String email);
    
    /**
     * 역할별 사용자 목록 조회
     * 
     * 특정 역할(admin, student)을 가진 모든 사용자를 조회합니다.
     * 관리자가 학생 목록을 조회할 때 사용됩니다.
     * 
     * @param role 조회할 사용자 역할 (UserRole.admin 또는 UserRole.student)
     * @return 해당 역할을 가진 사용자 리스트
     */
    List<User> findByRole(User.UserRole role);
}