package com.edtech.edtech_aibackend.model;

import lombok.Data;
import java.util.Map;

@Data
public class QuizSubmission {
    private Map<String, Integer> answers;
    private String courseType;
}