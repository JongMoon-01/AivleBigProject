package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class RandomButtonClick {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long lectureId;

    private String userId;

    private boolean clicked;

    private String buttonId; // 프론트에서 고유 ID (UUID or timestamp)

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }

    // Getters & Setters 생략 가능 (Lombok 사용 시)
    public Long getLectureId() { return lectureId; }
    public void setLectureId(Long lectureId) { this.lectureId = lectureId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public boolean isClicked() { return clicked; }
    public void setClicked(boolean clicked) { this.clicked = clicked; }

    public String getButtonId() { return buttonId; }
    public void setButtonId(String buttonId) { this.buttonId = buttonId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}

