package com.edtech.edtech_backend.repository;

import com.edtech.edtech_backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository // Spring이 이 인터페이스를 레포지토리 Bean으로 인식
public interface UserRepository extends JpaRepository<User, Long> {

    // ✅ username으로 사용자 조회 (로그인 시 사용 가능)
    Optional<User> findByUsername(String username);

    // ✅ email로 사용자 조회 (비밀번호 찾기 등에서 사용)
    Optional<User> findByEmail(String email);

    // ✅ username 중복 여부 확인 (회원가입 시 유효성 검사)
    Boolean existsByUsername(String username);

    // ✅ email 중복 여부 확인 (회원가입 시 유효성 검사)
    Boolean existsByEmail(String email);
}
