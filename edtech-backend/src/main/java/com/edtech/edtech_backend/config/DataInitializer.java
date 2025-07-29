package com.edtech.edtech_backend.config;

import com.edtech.edtech_backend.entity.User;
import com.edtech.edtech_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * 데이터 초기화 컴포넌트
 * 
 * 애플리케이션 시작 시 초기 데이터를 생성합니다.
 * CommandLineRunner를 구현하여 Spring Boot 애플리케이션 시작 후 자동 실행됩니다.
 * 미리 정의된 관리자 계정들을 데이터베이스에 삽입합니다.
 */
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    /**
     * 애플리케이션 시작 시 실행되는 메서드
     * 
     * 관리자 계정들이 데이터베이스에 존재하지 않으면 생성합니다.
     * 중복 생성을 방지하기 위해 이메일 존재 여부를 확인한 후 생성합니다.
     * 
     * @param args 커맨드 라인 인자
     * @throws Exception 실행 중 발생할 수 있는 예외
     */
    @Override
    public void run(String... args) throws Exception {
        // 관리자 계정 데이터 정의
        List<AdminData> adminAccounts = Arrays.asList(
            new AdminData("jihyeon", "jihyeon@admin.com", "4308"),
            new AdminData("donghee", "donghee@admin.com", "4623"),
            new AdminData("jongmoon", "jongmoon@admin.com", "1519"),
            new AdminData("yura", "yura@admin.com", "4115"),
            new AdminData("seongwoo", "seongwoo@admin.com", "8775"),
            new AdminData("yongsun", "yongsun@admin.com", "3751")
        );
        
        // 각 관리자 계정 생성 - 중복 방지
        for (AdminData admin : adminAccounts) {
            if (!userRepository.existsByEmail(admin.email)) {
                User adminUser = new User(
                    admin.email,
                    passwordEncoder.encode(admin.password), // 비밀번호 암호화
                    admin.name,
                    User.UserRole.admin
                );
                userRepository.save(adminUser);
                System.out.println("Admin account created: " + admin.email);
            }
        }
    }
    
    /**
     * 관리자 계정 데이터를 담는 내부 클래스
     * 
     * 초기 관리자 계정 생성에 필요한 정보(이름, 이메일, 비밀번호)를 저장합니다.
     */
    private static class AdminData {
        String name;
        String email;
        String password;
        
        /**
         * AdminData 생성자
         * 
         * @param name 관리자 이름
         * @param email 관리자 이메일
         * @param password 관리자 비밀번호 (평문 - 나중에 암호화됨)
         */
        AdminData(String name, String email, String password) {
            this.name = name;
            this.email = email;
            this.password = password;
        }
    }
}