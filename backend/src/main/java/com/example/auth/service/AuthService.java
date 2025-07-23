package com.example.auth.service;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.AuthResponse;
import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private RSAService rsaService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return new AuthResponse(null, null, "Username already exists");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(null, null, "Email already exists");
        }

        String decryptedPassword = request.getPassword();
        
        if (request.getEncryptedPassword() != null && !request.getEncryptedPassword().isEmpty()) {
            try {
                decryptedPassword = rsaService.decrypt(request.getEncryptedPassword());
            } catch (Exception e) {
                return new AuthResponse(null, null, "Failed to decrypt password");
            }
        }

        User user = new User(
            request.getUsername(),
            request.getEmail(),
            passwordEncoder.encode(decryptedPassword)
        );

        userRepository.save(user);
        String token = jwtService.generateToken(user.getUsername());

        return new AuthResponse(token, user.getUsername(), "Registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
            .orElse(null);

        if (user == null) {
            return new AuthResponse(null, null, "Invalid credentials");
        }
        
        String decryptedPassword = request.getPassword();
        
        if (request.getEncryptedPassword() != null && !request.getEncryptedPassword().isEmpty()) {
            try {
                decryptedPassword = rsaService.decrypt(request.getEncryptedPassword());
            } catch (Exception e) {
                return new AuthResponse(null, null, "Failed to decrypt password");
            }
        }

        if (!passwordEncoder.matches(decryptedPassword, user.getPassword())) {
            return new AuthResponse(null, null, "Invalid credentials");
        }

        String token = jwtService.generateToken(user.getUsername());
        return new AuthResponse(token, user.getUsername(), "Login successful", user.isAdmin());
    }
}