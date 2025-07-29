package com.edtech.edtech_backend.controller;

import com.edtech.edtech_backend.dto.*;
import com.edtech.edtech_backend.entity.User;
import com.edtech.edtech_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 인증 관련 API 엔드포인트를 처리하는 컨트롤러
 * 
 * 사용자 등록, 로그인, 학생 목록 조회, 가장(임퍼서네이트) 기능을 제공합니다.
 * CORS 설정으로 localhost:3000에서의 요청을 허용합니다.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    private final UserService userService;
    
    /**
     * AuthController 생성자
     * 
     * UserService를 주입받아 사용자 관련 비즈니스 로직을 처리합니다.
     * 
     * @param userService 사용자 서비스 객체
     */
    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    /**
     * 사용자 회원가입 엔드포인트
     * 
     * 새로운 사용자를 등록하고 JWT 토큰을 반환합니다.
     * 이메일 중복 체크를 수행하며, 실패 시 에러 메시지를 반환합니다.
     * 
     * @param registerRequest 회원가입 요청 데이터 (이메일, 비밀번호, 이름, 역할)
     * @return 성공 시 AuthResponse(JWT 토큰 포함), 실패 시 에러 메시지
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse response = userService.register(registerRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * 사용자 로그인 엔드포인트
     * 
     * 이메일과 비밀번호를 검증하고 JWT 토큰을 반환합니다.
     * 인증 실패 시 에러 메시지를 반환합니다.
     * 
     * @param loginRequest 로그인 요청 데이터 (이메일, 비밀번호)
     * @return 성공 시 AuthResponse(JWT 토큰 포함), 실패 시 에러 메시지
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = userService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    /**
     * 모든 학생 목록 조회 엔드포인트
     * 
     * 관리자 권한이 필요하며, ROLE_admin 역할을 가진 사용자만 접근 가능합니다.
     * 학생 정보(userId, email, name)를 포함한 리스트를 반환합니다.
     * 
     * @return 학생 정보 리스트 (userId, email, name 포함)
     */
    @GetMapping("/students")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> getAllStudents() {
        List<User> students = userService.getAllStudents();
        List<Map<String, Object>> studentList = students.stream()
                .map(student -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("userId", student.getUserId());
                    map.put("email", student.getEmail());
                    map.put("name", student.getName());
                    return map;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(studentList);
    }
    
    /**
     * 학생 가장(임퍼서네이트) 엔드포인트
     * 
     * 관리자가 특정 학생으로 로그인할 수 있는 기능입니다.
     * ROLE_admin 역할을 가진 사용자만 접근 가능하며,
     * 해당 학생의 JWT 토큰을 반환합니다.
     * 
     * @param request 가장 요청 데이터 (대상 학생의 userId)
     * @param authentication 현재 인증된 사용자 정보 (관리자)
     * @return 성공 시 학생의 AuthResponse(JWT 토큰 포함), 실패 시 에러 메시지
     */
    @PostMapping("/impersonate")
    @PreAuthorize("hasRole('admin')")
    public ResponseEntity<?> impersonateStudent(@Valid @RequestBody ImpersonateRequest request, Authentication authentication) {
        try {
            AuthResponse response = userService.impersonateStudent(request.getStudentId(), authentication.getName());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}