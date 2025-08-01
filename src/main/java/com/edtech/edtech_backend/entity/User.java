package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class User {
    @Id
    @GeneratedValue
    private Long userId;

    @Column(unique = true, nullable = false)
    private String email;

    private String passwordHash;

    private String name;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role {
        ADMIN, STUDENT
    }
}
