package com.edtech.edtech_backend.config;

import com.edtech.edtech_backend.security.jwt.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Spring Security 설정 클래스
 * 
 * JWT 기반 인증, CORS 설정, 권한 관리 등을 구성합니다.
 * @EnableWebSecurity: Spring Security를 활성화합니다.
 * @EnableMethodSecurity: 메서드 레벨 보안을 활성화합니다 (@PreAuthorize 사용 가능).
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;
    
    /**
     * 비밀번호 인코더 Bean 설정
     * 
     * BCrypt 알고리즘을 사용하여 비밀번호를 안전하게 암호화합니다.
     * 
     * @return BCryptPasswordEncoder 인스턴스
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    /**
     * Spring Security 필터 체인 설정
     * 
     * 1. CORS 설정 적용
     * 2. CSRF 비활성화 (JWT 사용으로 불필요)
     * 3. 세션 사용 안 함 (STATELESS - JWT 사용)
     * 4. 엔드포인트별 권한 설정:
     *    - /api/auth/register, /api/auth/login: 모든 사용자 허용
     *    - /api/auth/students, /api/auth/impersonate: admin 역할만 허용
     *    - 그 외 모든 요청: 인증 필요
     * 5. JWT 인증 필터를 UsernamePasswordAuthenticationFilter 앞에 추가
     * 
     * @param http HttpSecurity 객체
     * @return 구성된 SecurityFilterChain
     * @throws Exception 설정 중 발생할 수 있는 예외
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/auth/students", "/api/auth/impersonate").hasRole("admin")
                        .anyRequest().authenticated()
                );
        
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    /**
     * CORS(Cross-Origin Resource Sharing) 설정
     * 
     * 프론트엔드(localhost:3000)와의 통신을 허용합니다.
     * - 허용된 Origin: http://localhost:3000
     * - 허용된 HTTP 메서드: GET, POST, PUT, DELETE, OPTIONS
     * - 모든 헤더 허용
     * - 인증 정보(Credentials) 포함 허용
     * - Authorization 헤더 노출
     * 
     * @return CORS 설정 소스
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}