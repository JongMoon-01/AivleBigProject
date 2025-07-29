package com.edtech.edtech_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication // ✅ 이 애플리케이션이 Spring Boot 프로젝트임을 선언
public class EdtechBackendApplication {

    // ✅ 프로젝트 실행 시 가장 먼저 호출되는 메인 메서드
    public static void main(String[] args) {
        SpringApplication.run(EdtechBackendApplication.class, args);
    }
}
