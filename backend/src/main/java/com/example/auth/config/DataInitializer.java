package com.example.auth.config;

import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        createAdminIfNotExists("jihyeon", "jihyeon@admin.com", "4308");
        createAdminIfNotExists("donghee", "donghee@admin.com", "4623");
        createAdminIfNotExists("jongmoon", "jongmoon@admin.com", "1519");
        createAdminIfNotExists("yura", "yura@admin.com", "4115");
        createAdminIfNotExists("seongwoo", "seongwoo@admin.com", "8775");
        createAdminIfNotExists("yongsun", "yongsun@admin.com", "3751");
    }

    private void createAdminIfNotExists(String username, String email, String password) {
        if (!userRepository.existsByUsername(username)) {
            User admin = new User(username, email, passwordEncoder.encode(password));
            admin.setAdmin(true);
            userRepository.save(admin);
            System.out.println("Created admin user: " + username);
        }
    }
}