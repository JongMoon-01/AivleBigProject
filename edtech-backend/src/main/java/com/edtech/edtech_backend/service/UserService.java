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

@Service
@Transactional
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    
    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
    }
    
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
    
    public List<User> getAllStudents() {
        return userRepository.findByRole(User.UserRole.student);
    }
    
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
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));
    }
}