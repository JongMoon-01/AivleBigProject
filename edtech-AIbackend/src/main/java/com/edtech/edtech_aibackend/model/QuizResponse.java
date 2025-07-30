package com.edtech.edtech_aibackend.model;

import lombok.Data;
import java.util.List;

@Data
public class QuizResponse {
    private List<Quiz> quizzes;
    private String courseType;
}