package com.edtech.edtech_backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notice")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticePost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "class_id")
    private ClassEntity classEntity; // 어떤 클래스에 속한 글인지

    private String title;
    private String content;
    private String author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String fileUrl;
    
    @Column
    private String fileName;
}
