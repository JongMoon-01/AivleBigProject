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

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {
    
    private final UserService userService;
    
    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            AuthResponse response = userService.register(registerRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            AuthResponse response = userService.login(loginRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
    
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