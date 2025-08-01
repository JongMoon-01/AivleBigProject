package com.edtech.edtech_backend.service.auth;

import com.edtech.edtech_backend.dto.auth.AuthRequestDto;
import com.edtech.edtech_backend.dto.auth.AuthResponseDto;
import com.edtech.edtech_backend.entity.User;
import com.edtech.edtech_backend.repository.UserRepository;
import com.edtech.edtech_backend.security.JwtProvider;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository, JwtProvider jwtProvider) {
        this.userRepository = userRepository;
        this.jwtProvider = jwtProvider;
    }

    public String register(AuthRequestDto req) {
        User user = new User();
        user.setEmail(req.email);
        user.setPasswordHash(passwordEncoder.encode(req.password));
        user.setName(req.name);
        user.setRole(User.Role.valueOf(req.role.toUpperCase()));
        userRepository.save(user);
        return "Registered successfully";
    }

    public AuthResponseDto login(AuthRequestDto req) {
        User user = userRepository.findByEmail(req.email)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtProvider.generateToken(user.getEmail());
        return new AuthResponseDto(token, user.getName());
    }
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
