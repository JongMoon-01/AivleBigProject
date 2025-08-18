package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Getter @Setter
@NoArgsConstructor
public class QnaComment {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "qna_post_id")
    @JsonIgnore
    private QnaPost qnaPost;

    private String author;
    private String content;
    private LocalDateTime createdAt;
}
