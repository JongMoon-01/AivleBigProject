package com.edtech.edtech_aibackend.model;

import lombok.Data;
import java.util.List;

@Data
public class Quiz {
    private String id;
    private String question;
    private List<String> options;
    private int correctAnswer;
    private String explanation;
}