package com.edtech.edtech_backend.dto.auth;

public class AuthResponseDto {
    public String token;
    public String name;

    public AuthResponseDto(String token, String name) {
        this.token = token;
        this.name = name;
    }
}
