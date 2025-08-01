package com.edtech.edtech_backend.config;

import com.edtech.edtech_backend.security.JwtFilter;
import com.edtech.edtech_backend.security.JwtProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/auth/**",
                    "/static/**",
                    "/mpd/**",     // 정적 리소스 허용
                    "/vtt/**",
                    "/js/**",
                    "/images/**",
                    "/api/**",
                    "/api/lectures/*/chunk/**",
                    "/api/lectures/*/subtitles",
                    "/api/lectures/**",  //
                    "/api/lectures/*/playback"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(jwtProvider());
    }

    @Bean
    public JwtProvider jwtProvider() {
        return new JwtProvider();
    }
}
