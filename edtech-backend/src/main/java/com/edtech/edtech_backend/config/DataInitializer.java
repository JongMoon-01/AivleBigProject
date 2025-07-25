package com.edtech.edtech_backend.config;

import com.edtech.edtech_backend.entity.User;
import com.edtech.edtech_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // 관리자 계정 데이터
        List<AdminData> adminAccounts = Arrays.asList(
            new AdminData("jihyeon", "jihyeon@admin.com", "4308"),
            new AdminData("donghee", "donghee@admin.com", "4623"),
            new AdminData("jongmoon", "jongmoon@admin.com", "1519"),
            new AdminData("yura", "yura@admin.com", "4115"),
            new AdminData("seongwoo", "seongwoo@admin.com", "8775"),
            new AdminData("yongsun", "yongsun@admin.com", "3751")
        );
        
        // 각 관리자 계정 생성
        for (AdminData admin : adminAccounts) {
            if (!userRepository.existsByEmail(admin.email)) {
                User adminUser = new User(
                    admin.email,
                    passwordEncoder.encode(admin.password),
                    admin.name,
                    User.UserRole.admin
                );
                userRepository.save(adminUser);
                System.out.println("Admin account created: " + admin.email);
            }
        }
    }
    
    private static class AdminData {
        String name;
        String email;
        String password;
        
        AdminData(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }
    }
}