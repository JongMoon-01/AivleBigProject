package com.edtech.edtech_backend.service;

import com.edtech.edtech_backend.dto.*;
import com.edtech.edtech_backend.entity.User;
import com.edtech.edtech_backend.repository.UserRepository;
import com.edtech.edtech_backend.security.jwt.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 사용자 관련 비즈니스 로직을 처리하는 서비스 클래스
 * 
 * 회원가입, 로그인, 학생 조회, 가장(임퍼서네이트) 등의 기능을 제공합니다.
 * @Transactional 어노테이션으로 모든 메서드가 트랜잭션 내에서 실행됩니다.
 */
@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    
    /**
     * UserService 생성자
     * 
     * 필요한 의존성들을 주입받아 초기화합니다.
     * 
     * @param userRepository 사용자 리포지토리 - 데이터베이스 접근을 위한 객체
     * @param passwordEncoder 비밀번호 인코더 - 비밀번호 암호화를 위한 객체
     * @param jwtUtils JWT 유틸리티 - JWT 토큰 생성 및 검증을 위한 객체
     */
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }
    
    /**
     * 사용자 회원가입 처리
     * 
     * 1. 이메일 중복 확인
     * 2. 비밀번호 암호화
     * 3. 새 사용자 생성 (기본 역할: student)
     * 4. JWT 토큰 생성 및 반환
     * 
     * @param registerRequest 회원가입 요청 데이터
     * @return 생성된 사용자 정보와 JWT 토큰을 포함한 AuthResponse
     * @throws RuntimeException 이메일이 이미 사용 중일 경우
     */
    public AuthResponse register(RegisterRequest registerRequest) {
        // 이메일 중복 체크
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("이미 사용중인 이메일입니다.");
        }
        
        // 새 사용자 생성 (student 역할로)
        User user = new User(
            registerRequest.getEmail(),
            passwordEncoder.encode(registerRequest.getPassword()),
            registerRequest.getName(),
            User.UserRole.student
        );
        
        User savedUser = userRepository.save(user);
        
        // JWT 토큰 생성
        String jwt = jwtUtils.generateJwtToken(
            savedUser.getUserId(),
            savedUser.getEmail(),
            savedUser.getRole().name()
        );
        
        return new AuthResponse(
            jwt,
            savedUser.getUserId(),
            savedUser.getEmail(),
            savedUser.getName(),
            savedUser.getRole().name()
        );
    }
    
    /**
     * 사용자 로그인 처리
     * 
     * 1. 이메일로 사용자 조회
     * 2. 비밀번호 검증
     * 3. JWT 토큰 생성 및 반환
     * 
     * @param loginRequest 로그인 요청 데이터 (이메일, 비밀번호)
     * @return 사용자 정보와 JWT 토큰을 포함한 AuthResponse
     * @throws RuntimeException 이메일이나 비밀번호가 일치하지 않을 경우
     */
    public AuthResponse login(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다."));
        
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }
        
        // JWT 토큰 생성
        String jwt = jwtUtils.generateJwtToken(
            user.getUserId(),
            user.getEmail(),
            user.getRole().name()
        );
        
        return new AuthResponse(
            jwt,
            user.getUserId(),
            user.getEmail(),
            user.getName(),
            user.getRole().name()
        );
    }
    
    /**
     * 모든 학생 사용자 조회
     * 
     * ROLE_student 역할을 가진 모든 사용자를 데이터베이스에서 조회합니다.
     * 
     * @return 학생 역할을 가진 사용자 리스트
     */
    public List<User> getAllStudents() {
        return userRepository.findByRole(User.UserRole.student);
    }
    
    /**
     * 학생 가장(임퍼서네이트) 기능
     * 
     * 관리자가 특정 학생으로 로그인할 수 있도록 합니다.
     * 1. 요청자가 관리자인지 확인
     * 2. 대상이 학생 계정인지 확인
     * 3. 학생의 JWT 토큰 생성 및 반환
     * 
     * @param studentId 가장할 학생의 ID
     * @param adminEmail 요청자(관리자)의 이메일
     * @return 학생의 정보와 JWT 토큰을 포함한 AuthResponse
     * @throws RuntimeException 관리자가 아니거나, 대상이 학생이 아닌 경우
     */
    public AuthResponse impersonateStudent(Long studentId, String adminEmail) {
        // 관리자 확인
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("관리자를 찾을 수 없습니다."));
        
        if (admin.getRole() != User.UserRole.admin) {
            throw new RuntimeException("관리자 권한이 필요합니다.");
        }
        
        // 학생 조회
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("학생을 찾을 수 없습니다."));
        
        if (student.getRole() != User.UserRole.student) {
            throw new RuntimeException("학생 계정만 위임할 수 있습니다.");
        }
        
        // 학생의 JWT 토큰 생성
        String jwt = jwtUtils.generateJwtToken(
            student.getUserId(),
            student.getEmail(),
            student.getRole().name()
        );
        
        return new AuthResponse(
            jwt,
            student.getUserId(),
            student.getEmail(),
            student.getName(),
            student.getRole().name()
        );
    }
    
    /**
     * 이메일로 사용자 조회
     * 
     * 주어진 이메일로 사용자를 데이터베이스에서 조회합니다.
     * 
     * @param email 조회할 사용자의 이메일
     * @return 조회된 사용자 객체
     * @throws RuntimeException 사용자를 찾을 수 없을 경우
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}