package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long courseId;

    private String title;
    private String materialUrl;

    @ManyToOne
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity;

    // Getters
    public Long getCourseId() { return courseId; }
    public String getTitle() { return title; }
    public String getMaterialUrl() { return materialUrl; }
    public ClassEntity getClassEntity() { return classEntity; }
}
