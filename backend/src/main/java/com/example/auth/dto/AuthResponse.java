package com.example.auth.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String message;
    private boolean isAdmin;

    public AuthResponse() {}

    public AuthResponse(String token, String username, String message) {
        this.token = token;
        this.username = username;
        this.message = message;
        this.isAdmin = false;
    }

    public AuthResponse(String token, String username, String message, boolean isAdmin) {
        this.token = token;
        this.username = username;
        this.message = message;
        this.isAdmin = isAdmin;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isAdmin() {
        return isAdmin;
    }

    public void setAdmin(boolean admin) {
        isAdmin = admin;
    }
}