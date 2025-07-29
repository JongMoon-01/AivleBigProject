package com.edtech.edtech_backend.security.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * JWT(JSON Web Token) 유틸리티 클래스
 * 
 * JWT 토큰의 생성, 검증, 파싱 기능을 제공합니다.
 * HS512 알고리즘을 사용하여 토큰을 서명합니다.
 */
@Component
public class JwtUtils {
    
    /**
     * JWT 비밀 키 - application.yaml에서 로드
     */
    @Value("${jwt.secret}")
    private String jwtSecret;
    
    /**
     * JWT 만료 시간 (밀리초) - application.yaml에서 로드
     */
    @Value("${jwt.expiration}")
    private int jwtExpirationMs;
    
    /**
     * JWT 서명을 위한 Key 객체 생성
     * 
     * 비밀 키를 HMAC SHA 알고리즘에 적합한 Key 객체로 변환합니다.
     * 
     * @return 서명용 Key 객체
     */
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }
    
    /**
     * JWT 토큰 생성
     * 
     * 사용자 정보를 기반으로 JWT 토큰을 생성합니다.
     * 토큰에는 이메일(subject), userId, role이 포함됩니다.
     * 
     * @param userId 사용자 ID
     * @param email 사용자 이메일
     * @param role 사용자 역할
     * @return 생성된 JWT 토큰 문자열
     */
    public String generateJwtToken(Long userId, String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }
    
    /**
     * JWT 토큰에서 이메일 추출
     * 
     * 토큰의 subject 필드에 저장된 이메일을 반환합니다.
     * 
     * @param token JWT 토큰
     * @return 사용자 이메일
     */
    public String getEmailFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }
    
    /**
     * JWT 토큰에서 사용자 ID 추출
     * 
     * 토큰의 userId claim에서 사용자 ID를 추출합니다.
     * 
     * @param token JWT 토큰
     * @return 사용자 ID
     */
    public Long getUserIdFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("userId", Long.class);
    }
    
    /**
     * JWT 토큰에서 사용자 역할 추출
     * 
     * 토큰의 role claim에서 사용자 역할을 추출합니다.
     * 
     * @param token JWT 토큰
     * @return 사용자 역할 (admin 또는 student)
     */
    public String getRoleFromJwtToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("role", String.class);
    }
    
    /**
     * JWT 토큰 유효성 검증
     * 
     * 토큰의 서명, 만료 시간, 형식 등을 검증합니다.
     * 다양한 예외 상황에 대한 에러 메시지를 출력합니다.
     * 
     * @param authToken 검증할 JWT 토큰
     * @return 토큰이 유효하면 true, 그렇지 않으면 false
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        }
        
        return false;
    }
}