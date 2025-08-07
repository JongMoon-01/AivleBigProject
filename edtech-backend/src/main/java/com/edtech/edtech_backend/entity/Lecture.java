package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Lecture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long lectureId;

    private String title;

    private String mpdPath;
    private String vttPath;

    private LocalDateTime createdAt;

    // Getters
    public Long getLectureId() {
        return lectureId;
    }

    public String getTitle() {
        return title;
    }

    public String getMpdPath() {
        return mpdPath;
    }

    public String getVttPath() {
        return vttPath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    @PrePersist
    public void prePersist() {
    if (this.createdAt == null) {
        this.createdAt = LocalDateTime.now();
    }
}
}
