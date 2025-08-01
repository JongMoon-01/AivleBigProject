package com.edtech.edtech_backend.controller.auth;

import com.edtech.edtech_backend.entity.User;
import com.edtech.edtech_backend.dto.auth.AuthRequestDto;
import com.edtech.edtech_backend.dto.auth.AuthResponseDto;
import com.edtech.edtech_backend.service.auth.AuthService;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody AuthRequestDto request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponseDto login(@RequestBody AuthRequestDto request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public User me(@AuthenticationPrincipal(expression = "username") String email) {
        return authService.getUserByEmail(email);
    }
}
