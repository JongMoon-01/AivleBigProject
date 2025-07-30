package com.edtech.edtech_aibackend.model;

import lombok.Data;

@Data
public class QuizResult {
    private int totalQuestions;
    private int correctAnswers;
    private double score;
}