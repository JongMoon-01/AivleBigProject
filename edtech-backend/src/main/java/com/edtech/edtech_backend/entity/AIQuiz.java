package com.edtech.edtech_backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ai_quiz")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIQuiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long quizId;

    private String question;

    private String answer;

    private String explanation;
}